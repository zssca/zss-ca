import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getServerSupabaseEnvOrThrow } from '@/lib/supabase/env'
import type { Database } from '@/lib/types/database.types'

/**
 * Update Supabase session in middleware
 *
 * This function handles session token refresh and basic route protection.
 * Per Supabase SSR documentation, session refresh is MANDATORY.
 *
 * What this does:
 * - Creates a Supabase client with cookie management
 * - Calls getUser() to trigger automatic token refresh if expired
 * - Redirects unauthenticated users away from protected routes
 * - Redirects authenticated users away from auth pages
 * - Updates response cookies with refreshed tokens
 *
 * What this does NOT do:
 * - Role-based authorization (handled in layouts/pages)
 * - Complex database queries
 * - Business logic
 *
 * @see https://supabase.com/docs/guides/auth/server-side/creating-a-client
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { url, anonKey } = getServerSupabaseEnvOrThrow('session-proxy')

  const supabase = createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: Do NOT run code here - causes random logouts
  // This triggers automatic token refresh if the session is expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes
  const protectedRoutes = ['/admin', '/client']
  const authRoutes = ['/login', '/signup', '/reset-password', '/verify-otp', '/update-password']
  const verificationRoutes = ['/verify-otp', '/resend-verification']
  const pathname = request.nextUrl.pathname

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isVerificationRoute = verificationRoutes.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Check email verification for authenticated users
  if (user && !isVerificationRoute) {
    const { data: profile } = await supabase
      .from('profile')
      .select('email_verified')
      .eq('id', user.id)
      .single()

    // Redirect unverified users to verification page
    if (profile && !profile.email_verified) {
      const url = request.nextUrl.clone()
      url.pathname = '/verify-otp'
      url.searchParams.set('email', user.email || '')
      url.searchParams.set('type', 'email_confirmation')
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages to prevent confusion
  if (isAuthRoute && user && pathname !== '/verify-otp') {
    const url = request.nextUrl.clone()
    // Get redirect from query params or default to client dashboard
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/client'
    url.pathname = redirectTo
    url.search = '' // Clear query params
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
