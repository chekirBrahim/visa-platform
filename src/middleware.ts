// ============================================================
// Middleware NextAuth v5 — Protection des routes
// ============================================================

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false

  // Routes admin protégées
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/admin", nextUrl))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
  }

  // Routes client protégées
  if (nextUrl.pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
      )
    }
  }

  // Rediriger un admin déjà connecté qui va au login
  if (nextUrl.pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin/dashboard" : "/dashboard", nextUrl)
    )
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
}
