import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { z } from 'zod'
import { rateLimits, withRateLimit } from '@/lib/rate-limit'

// ✅ Next.js 15+: Route handlers are not cached by default
// Explicitly set dynamic for clarity on POST endpoints
export const dynamic = 'force-dynamic'

// Define request body schema for validation
const checkoutRequestSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  billingInterval: z.enum(['monthly', 'yearly'], {
    message: 'Billing interval must be monthly or yearly'
  }),
})

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting (10 checkout attempts per hour per IP)
    const rateLimit = await withRateLimit(req, rateLimits.api)

    if (!rateLimit.allowed && rateLimit.response) {
      return rateLimit.response
    }

    const body = await req.json()

    // Validate request body with Zod
    const result = checkoutRequestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          fieldErrors: result.error.flatten().fieldErrors
        },
        {
          status: 400,
          headers: rateLimit.headers,
        }
      )
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const sessionResult = await createCheckoutSession({
      planId: result.data.planId,
      billingInterval: result.data.billingInterval,
      origin,
    })

    return NextResponse.json(sessionResult, {
      headers: rateLimit.headers,
    })
  } catch (error: unknown) {
    // Type guard for Error instances
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (error instanceof Error) {
      console.error('Checkout error:', error.message, error.stack)
    } else {
      console.error('Checkout error:', String(error))
    }

    // Map internal errors to user-friendly messages without exposing implementation details
    const errorMessageMap: Record<string, { message: string; status: number }> = {
      'Unauthorized': { message: 'Please sign in to continue', status: 401 },
      'Plan not found': { message: 'Selected plan is not available', status: 404 },
      'User already has an active subscription': { message: 'You already have an active subscription', status: 400 },
      'Price ID not configured for this plan': { message: 'Plan pricing is not configured. Please contact support.', status: 400 },
    }

    const errorInfo = errorMessageMap[errorMessage] || {
      message: 'Failed to create checkout session. Please try again.',
      status: 500
    }

    return NextResponse.json({ error: errorInfo.message }, { status: errorInfo.status })
  }
}
