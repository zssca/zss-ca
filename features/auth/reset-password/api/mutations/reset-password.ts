'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { resetPasswordSchema } from '../schema'
import { sendOTPForPasswordReset } from '@/lib/auth/otp-helpers'
import { ROUTES } from '@/lib/constants/routes'
import { rateLimits, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

type ResetPasswordState = {
  error?: string | null
  fieldErrors?: Record<string, string[]>
  success?: boolean
  message?: string
}

export async function resetPasswordAction(prevState: ResetPasswordState | null, formData: FormData): Promise<ResetPasswordState | never> {
  // Rate limit by IP address - 3 reset attempts per hour
  const headersList = await headers()
  const identifier = getClientIdentifier(headersList)
  const rateCheck = await checkRateLimit(rateLimits.passwordReset, identifier)

  if (!rateCheck.success) {
    const minutesUntilReset = Math.ceil((rateCheck.reset - Date.now()) / 60000)
    return {
      error: `Too many password reset attempts. Please try again in ${minutesUntilReset} minute(s).`,
    }
  }

  // Validate input with Zod
  const email = formData.get('email') as string
  const result = resetPasswordSchema.safeParse({ email })

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors
    }
  }

  const supabase = await createClient()

  // Check if user exists (silently - don't reveal if account exists)
  const { data: profile } = await supabase
    .from('profile')
    .select('id, contact_email')
    .eq('contact_email', result.data.email)
    .single()

  // Always proceed to OTP page regardless of whether user exists
  // This prevents account enumeration attacks
  if (profile) {
    // Only send OTP if user actually exists
    const error = await sendOTPForPasswordReset(result.data.email, profile.id)

    if (error) {
      console.error('OTP send error:', error)
      // Still redirect - don't reveal failure
    }
  }

  // Always redirect with same message - don't reveal if account exists
  revalidatePath('/', 'layout')
  redirect(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(email)}&type=password_reset`)
}
