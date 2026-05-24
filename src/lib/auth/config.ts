// ============================================================
// NextAuth v5 — Configuration
// ============================================================

import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db/client"
import { loginSchema } from "@/lib/validations/auth"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          include: { admin: true },
        })

        if (!user || !user.passwordHash) return null
        if (!user.isActive) return null

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return null

        // Mise à jour lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email ?? "",
          name: user.fullName,
          isAdmin: !!user.admin,
          adminRole: user.admin?.role ?? null,
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false
        token.adminRole = (user as { adminRole?: string | null }).adminRole ?? null
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean
        ;(session.user as { adminRole?: string | null }).adminRole = token.adminRole as string | null
      }
      return session
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = (auth?.user as { isAdmin?: boolean })?.isAdmin ?? false
      const isAdminRoute = nextUrl.pathname.startsWith("/admin")
      const isClientRoute = nextUrl.pathname.startsWith("/dashboard")

      if (isAdminRoute) return isLoggedIn && isAdmin
      if (isClientRoute) return isLoggedIn
      return true
    },
  },

  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 jours
}
