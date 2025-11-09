'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { loginSchema } from '../schema'
import { rateLimits, checkRateLimit } from '@/lib/rate-limit'

type LoginState = {
  error?: string | null
  fieldErrors?: Record<string, string[]>
}

export async function loginAction(prevState: LoginState | null, formData: FormData): Promise<LoginState | never> {
  const remember = formData.get('remember') === 'on'

  // Validate input with Zod
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors
    }
  }

  const supabase = await createClient({
    cookieMaxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12,
  })

  // Get request metadata
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  // Check database-backed rate limit with account lockout
  const { data: rateLimitCheck } = await supabase.rpc('check_login_rate_limit', {
    p_email: result.data.email,
    p_ip: ipAddress,
  })

  type RateLimitResult = { allowed: boolean; reason?: string; retry_after?: number; locked_until?: string }
  const limitResult = rateLimitCheck as RateLimitResult | null

  if (limitResult && !limitResult.allowed) {
    if (limitResult.reason === 'account_locked') {
      return {
        error: 'Account locked due to too many failed login attempts. Please contact support or try again later.',
      }
    } else if (limitResult.reason === 'rate_limited') {
      const seconds = limitResult.retry_after || 300
      const minutes = Math.ceil(seconds / 60)
      return {
        error: `Too many login attempts. Please try again in ${minutes} minute(s).`,
      }
    }
  }

  // Also check Redis rate limit as backup (5 attempts per 5 minutes per email)
  const rateCheck = await checkRateLimit(rateLimits.login, result.data.email, {
    violationType: 'login',
    email: result.data.email,
    ipAddress: ipAddress,
    endpoint: '/login',
    userAgent: userAgent,
  })
  if (!rateCheck.success) {
    const minutesUntilReset = Math.ceil((rateCheck.reset - Date.now()) / 60000)
    return {
      error: `Too many login attempts. Please try again in ${minutesUntilReset} minute(s).`,
    }
  }

  // Attempt login
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  // Log login attempt to database
  await supabase.from('login_attempts').insert({
    email: result.data.email,
    success: !error,
    ip_address: ipAddress,
    user_agent: userAgent,
    failure_reason: error?.message,
  })

  if (error) {
    console.error('Login error:', error)
    // Generic error message to prevent account enumeration
    return { error: 'Invalid email or password' }
  }

  // Success - clear any lockouts for this email
  await supabase.from('account_lockouts').delete().eq('email', result.data.email)

  // Note: Rate limit is managed by Upstash Redis and will auto-expire

  // Get user profile to determine role
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profile')
      .select('role')
      .eq('id', user.id)
      .single()

    // ✅ CRITICAL: Clear all cached data after login
    // This ensures fresh user-specific data is loaded
    revalidatePath('/', 'layout')

    // Redirect based on user role
    const redirectUrl = profile?.role === 'admin'
      ? ROUTES.ADMIN_DASHBOARD
      : ROUTES.CLIENT_DASHBOARD

    redirect(redirectUrl)
  }

  // ✅ Clear cache before fallback redirect
  revalidatePath('/', 'layout')
  redirect(ROUTES.CLIENT_DASHBOARD)
}
