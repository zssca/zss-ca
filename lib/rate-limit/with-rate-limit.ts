import { NextResponse } from 'next/server'
import type { Ratelimit } from '@upstash/ratelimit'
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders } from './core'

/**
 * Apply rate limiting to API routes and return headers
 * Implements P0 security requirement for rate limiting with proper headers
 */
export async function withRateLimit(
  request: Request,
  limiter: Ratelimit,
  identifierOverride?: string
): Promise<{ allowed: boolean; headers: Record<string, string>; response?: NextResponse }> {
  // Get identifier (IP address or override)
  const identifier = identifierOverride || getClientIdentifier(request.headers)

  // Check rate limit
  const rateCheck = await checkRateLimit(limiter, identifier)

  // Generate headers
  const headers = getRateLimitHeaders(rateCheck)

  // If rate limited, return error response
  if (!rateCheck.success) {
    const minutesUntilReset = Math.ceil((rateCheck.reset - Date.now()) / 60000)

    return {
      allowed: false,
      headers,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${minutesUntilReset} minute(s).`,
          retryAfter: rateCheck.reset,
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': String(Math.ceil((rateCheck.reset - Date.now()) / 1000)),
          },
        }
      ),
    }
  }

  return {
    allowed: true,
    headers,
  }
}
