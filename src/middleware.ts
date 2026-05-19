import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    
    // Always allow access to the login page
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for the custom auth cookie set during login
    // This provides network-level protection for the admin dashboard
    const hasAuthCookie = request.cookies.has('sb-auth-token');

    if (!hasAuthCookie) {
      // Redirect to login if no active session token is found
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }
 
  return NextResponse.next()
}

export const config = {
  // Match all /admin routes
  matcher: ['/admin/:path*'],
}
