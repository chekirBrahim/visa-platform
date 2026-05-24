// ============================================================
// Config NextAuth EDGE-SAFE — utilisée uniquement dans le middleware
// N'importe pas Prisma, bcrypt ou tout module Node.js-only
// ============================================================
import type { NextAuthConfig } from "next-auth"

export const edgeAuthConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = (auth?.user as { isAdmin?: boolean })?.isAdmin

      // Routes admin — doit être connecté ET admin
      if (nextUrl.pathname.startsWith("/admin")) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl))
        if (!isAdmin) return Response.redirect(new URL("/dashboard", nextUrl))
        return true
      }

      // Routes client — doit être connecté
      if (nextUrl.pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl))
        return true
      }

      // Rediriger les utilisateurs connectés depuis /login
      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
  },
  providers: [], // Aucun provider ici — edge runtime seulement
}
