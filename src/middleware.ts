import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/study-packs', '/review', '/practice', '/upload']
  
  // Define auth routes that should redirect to dashboard if already logged in
  const authRoutes = ['/login', '/signup']
  
  // Define marketing routes that should redirect to dashboard if already logged in
  const marketingRoutes = ['/waitlist']
  
  const { pathname } = request.nextUrl

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Check if the current path is a marketing route
  const isMarketingRoute = pathname === '/' || marketingRoutes.some(route => pathname.startsWith(route))

  // If user is not authenticated and trying to access protected route, redirect to login
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth or marketing routes, redirect to dashboard
  if ((isAuthRoute || isMarketingRoute) && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
