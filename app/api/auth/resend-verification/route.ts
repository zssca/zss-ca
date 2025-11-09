import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendOTPForEmailConfirmation } from '@/lib/auth/otp-helpers'
import { rateLimits, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { headers } from 'next/headers'

/**
 * Resend verification email endpoint
 *
 * Allows users to manually request a new verification email
 * if they didn't receive the original or it expired.
 *
 * Rate limited to prevent abuse: 3 requests per 15 minutes per IP
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const headersList = await headers()
    const identifier = getClientIdentifier(headersList)
    const rateCheck = await checkRateLimit(
      rateLimits.verificationResend,
      identifier
    )

    if (!rateCheck.success) {
      const minutesUntilReset = Math.ceil((rateCheck.reset - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Too many requests. Please try again in ${minutesUntilReset} minute(s).`,
          retryAfter: rateCheck.reset
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user exists and is not already verified
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('id, email_verified')
      .eq('contact_email', email)
      .or(`contact_email.eq.${email}`)
      .single()

    // Don't reveal if user exists (prevent enumeration)
    if (profileError || !profile) {
      // Still return success to prevent enumeration
      return NextResponse.json({
        success: true,
        message: 'If an unverified account exists with this email, a verification code has been sent.'
      })
    }

    // Check if already verified
    if (profile.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'This email is already verified. You can log in now.'
      })
    }

    // Send new OTP
    const otpError = await sendOTPForEmailConfirmation(email, profile.id)

    if (otpError) {
      console.error('Failed to send verification email:', otpError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

    // Success response (same whether user exists or not for security)
    return NextResponse.json({
      success: true,
      message: 'If an unverified account exists with this email, a verification code has been sent.'
    })

  } catch (error) {
    console.error('Error in resend verification endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
