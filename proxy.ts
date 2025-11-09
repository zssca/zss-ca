import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/session-proxy'

/**
 * Next.js 16 Proxy for Supabase Session Management
 *
 * This proxy runs on the Node.js runtime and handles:
 * 1. Session token refresh
 * 2. Pathname injection for layout metadata
 * 3. Security headers (CSP, XSS protection, etc.)
 *
 * Per Next.js 16, proxy.ts replaces the deprecated middleware.ts pattern.
 *
 * IMPORTANT: This proxy should ONLY handle session token refresh.
 * Per Supabase SSR best practices, this is MANDATORY for session refreshes.
 *
 * DO NOT add authorization logic here - all auth checks belong in:
 * - Server Components (layouts, pages)
 * - Route Handlers (API routes)
 *
 * @see https://nextjs.org/blog/next-16
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function proxy(request: NextRequest): Promise<Response> {
  // Update session (required for Supabase auth)
  // This handles session refresh + route protection
  const response = await updateSession(request)

  // Add pathname to headers for layout metadata
  response.headers.set('x-pathname', request.nextUrl.pathname)

  // Security headers (Next.js 15+ best practices)
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - API routes, webhooks, callbacks (auth handled in route)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
