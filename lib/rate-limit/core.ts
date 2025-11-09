import { Ratelimit } from '@upstash/ratelimit'
import { logRateLimitViolation, type ViolationType } from './monitoring'

/**
 * Check rate limit for a given identifier.
 *
 * NOTE: For Server Actions, rate limit headers cannot be returned directly
 * because Server Actions use redirect() which doesn't support custom headers.
 * Use withRateLimit() proxy helpers for API routes instead.
 *
 * For Server Actions, the rate limit info is only returned in error messages.
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
  options?: {
    violationType?: ViolationType
    email?: string
    ipAddress?: string
    endpoint?: string
    userAgent?: string
  }
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  error?: string
}> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    // Log violation if rate limit exceeded
    if (!success && options) {
      await logRateLimitViolation({
        email: options.email,
        ipAddress: options.ipAddress,
        endpoint: options.endpoint || 'unknown',
        violationType: options.violationType || 'generic',
        requestCount: limit - remaining,
        limitThreshold: limit,
        userAgent: options.userAgent,
      })
    }

    return {
      success,
      limit,
      remaining,
      reset,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Allow request to proceed if rate limit check fails
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      error: 'Rate limit check failed',
    }
  }
}

// Helper to generate rate limit headers
export function getRateLimitHeaders(rateLimitResult: {
  limit: number
  remaining: number
  reset: number
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(rateLimitResult.limit),
    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
    'X-RateLimit-Reset': String(rateLimitResult.reset),
  }
}

// Helper to get client identifier from headers
export function getClientIdentifier(headers: Headers): string {
  // Try to get IP from various headers
  const forwardedFor = headers.get('x-forwarded-for')
  const ip =
    (forwardedFor && forwardedFor.split(',')[0]?.trim()) ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'

  return ip
}
