'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyOTPSchema } from '../schema'

export async function verifyOTPAction(data: unknown): Promise<{ error: string; fieldErrors?: Record<string, string[]> } | { error: null; data?: { profileId: string } }> {
  // 1. Validate input with Zod
  const result = verifyOTPSchema.safeParse(data)

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors
    }
  }

  const supabase = await createClient()

  // Call the verify_otp function
  const { data: rpcResult, error } = await supabase.rpc('verify_otp', {
    p_email: result.data.email,
    p_otp_code: result.data.otp,
    p_verification_type: result.data.type,
  })

  // Type guard for the result
  const otpResult = rpcResult as { success: boolean; message?: string; profile_id?: string } | null

  if (error || !otpResult?.success) {
    return { error: otpResult?.message || 'Invalid or expired code' }
  }

  // If email confirmation, update user metadata and profile
  if (result.data.type === 'email_confirmation') {
    const { error: updateError } = await supabase.auth.updateUser({
      data: { email_verified: true },
    })

    if (updateError) {
      return { error: 'Failed to confirm email' }
    }

    // Update profile table to mark email as verified
    if (otpResult.profile_id) {
      const { error: profileError } = await supabase
        .from('profile')
        .update({ email_verified: true })
        .eq('id', otpResult.profile_id)

      if (profileError) {
        console.error('Failed to update profile email_verified status:', profileError)
        // Don't fail the entire verification if this update fails
      }
    }
  }

  return {
    error: null,
    data: { profileId: otpResult.profile_id || '' }
  }
}
