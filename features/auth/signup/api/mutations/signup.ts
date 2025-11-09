'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { signupSchema } from '../schema'
import { sendOTPForEmailConfirmation } from '@/lib/auth/otp-helpers'
import { ROUTES } from '@/lib/constants/routes'
import { rateLimits, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

type SignupState = {
  error?: string | null
  fieldErrors?: Record<string, string[]>
  success?: boolean
  message?: string
}

export async function signupAction(prevState: SignupState | null, formData: FormData): Promise<SignupState | never> {
  // Rate limit by IP address - 3 signups per hour
  const headersList = await headers()
  const identifier = getClientIdentifier(headersList)
  const rateCheck = await checkRateLimit(rateLimits.signup, identifier)

  if (!rateCheck.success) {
    const minutesUntilReset = Math.ceil((rateCheck.reset - Date.now()) / 60000)
    return {
      error: `Too many signup attempts. Please try again in ${minutesUntilReset} minute(s).`,
    }
  }

  // Validate input with Zod
  const result = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    companyName: formData.get('companyName'),
  })

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors
    }
  }

  const supabase = await createClient()

  // First, sign up the user
  const { data: authData, error: signupError } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        company_name: result.data.companyName,
      },
    },
  })

  if (signupError) {
    console.error('Signup error:', signupError)
    if (signupError.message?.toLowerCase().includes('registered')) {
      return { error: 'An account with this email already exists. Please sign in or reset your password.' }
    }

    return { error: 'Failed to create account. Please try again.' }
  }

  // Generate and send OTP for email confirmation
  if (authData.user) {
    const otpError = await sendOTPForEmailConfirmation(result.data.email, authData.user.id)
    if (otpError) {
      return { error: 'Account created but failed to send verification code. Please request a new code.' }
    }
  }

  // Get plan parameter from form if present
  const planId = formData.get('planId') as string | null
  const otpUrl = `${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(result.data.email)}&type=email_confirmation${planId ? `&plan=${planId}` : ''}`

  // Clear cache before redirect
  revalidatePath('/', 'layout')

  redirect(otpUrl)
}
