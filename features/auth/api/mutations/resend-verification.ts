'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { sendOTPForEmailConfirmation } from '@/lib/auth/otp-helpers'
import { rateLimits, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { z } from 'zod'

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ResendVerificationState = {
  error?: string
  success?: boolean
  message?: string
}

/**
 * Resend Verification Action
 *
 * Server action to resend email verification code.
 * Includes rate limiting and security measures.
 */
export async function resendVerificationAction(
  prevState: ResendVerificationState | null,
  formData: FormData
): Promise<ResendVerificationState> {
  // Rate limiting
  const headersList = await headers()
  const identifier = getClientIdentifier(headersList)
  const rateCheck = await checkRateLimit(rateLimits.verificationResend, identifier)

  if (!rateCheck.success) {
    const minutesUntilReset = Math.ceil((rateCheck.reset - Date.now()) / 60000)
    return {
      error: `Too many requests. Please try again in ${minutesUntilReset} minute(s).`,
    }
  }

  // Validate input
  const result = resendVerificationSchema.safeParse({
    email: formData.get('email'),
  })

  if (!result.success) {
    return {
      error: 'Invalid email address',
    }
  }

  const supabase = await createClient()

  try {
    // Check if user exists and verification status
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('id, email_verified')
      .eq('contact_email', result.data.email)
      .single()

    // Don't reveal if user exists (prevent enumeration)
    // Always show the same success message
    const successMessage = 'If an unverified account exists with this email, a verification code has been sent.'

    if (profileError || !profile) {
      // Still return success to prevent enumeration
      return {
        success: true,
        message: successMessage,
      }
    }

    // Check if already verified
    if (profile.email_verified) {
      // Redirect verified users to login
      redirect('/login?message=already_verified')
    }

    // Send new OTP
    const otpError = await sendOTPForEmailConfirmation(result.data.email, profile.id)

    if (otpError) {
      console.error('Failed to send verification email:', otpError)
      return {
        error: 'Failed to send verification email. Please try again later.',
      }
    }

    return {
      success: true,
      message: successMessage,
    }

  } catch (error) {
    console.error('Error in resendVerificationAction:', error)
    return {
      error: 'An unexpected error occurred. Please try again later.',
    }
  }
}
