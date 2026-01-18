import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/study-packs', '/review', '/practice', '/upload']

  // Define admin routes that require admin role
  const adminRoutes = ['/admin']

  // Define auth routes that should redirect to dashboard if already logged in
  const authRoutes = ['/login', '/signup']

  // Define marketing routes that should redirect to dashboard if already logged in
  const marketingRoutes = ['/waitlist']

  const { pathname, searchParams } = request.nextUrl

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Check if the current path is a protected route
  // Note: We include the ID directly as a fallback to ensure it works immediately even if env vars haven't reloaded
  const demoId = process.env.NEXT_PUBLIC_DEMO_PACK_ID || '3747df11-0426-4749-8597-af89639e8d38'
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) &&
    !(demoId && pathname.includes(demoId))

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Check if the current path is a marketing route
  const isMarketingRoute = pathname === '/' || marketingRoutes.some(route => pathname.startsWith(route))

  // Check admin access for admin routes
  if (isAdminRoute && user) {
    // Create Supabase client to check role
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map(cookie => ({
              name: cookie.name,
              value: cookie.value
            }))
          },
          setAll() {
            // Not needed for read-only operation
          }
        }
      }
    )

    // Check user role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single()

    // If not admin, redirect to home
    if (!profile || profile.role !== 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If user is not authenticated and trying to access admin route, redirect to home
  if (isAdminRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

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
