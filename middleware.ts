import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Define public routes that don't require authentication
    const publicRoutes = ["/login", "/signup", "/test-env"]

    // If user is not signed in and the current path is not a public route,
    // redirect the user to /login
    if (!session && !publicRoutes.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // If user is signed in and the current path is /login or /signup,
    // redirect the user to /dashboard
    if (session && ["/login", "/signup"].includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, allow the request to proceed
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
} 