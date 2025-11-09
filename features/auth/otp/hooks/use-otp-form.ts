'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface UseOtpFormParams {
  onVerify: (otp: string) => Promise<{ success: boolean; message?: string }>
  onResend?: () => Promise<void>
}

interface VerifyState {
  error?: string
  success?: boolean
}

export function useOtpForm({ onVerify, onResend }: UseOtpFormParams) {
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [otpAnnouncement, setOtpAnnouncement] = useState<string | null>(null)

  const verifyAction = async (_prevState: VerifyState | null, formData: FormData) => {
    const otp = formData.get('otp') as string

    if (!otp || otp.length !== 6) {
      return {
        error: 'Please enter a valid 6-digit code',
      }
    }

    try {
      const result = await onVerify(otp)

      if (!result.success) {
        return {
          error: result.message || 'Invalid or expired verification code. Please try again or request a new code.',
        }
      }

      toast.success('Code verified successfully', {
        description: 'Redirecting you to the next step.',
      })

      return {
        success: true,
      }
    } catch {
      return {
        error: 'An error occurred while verifying your code. Please try again.',
      }
    }
  }

  const [state, formAction, isPending] = useActionState(verifyAction, null)

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [resendTimer])

  useEffect(() => {
    if (!resendSuccess) {
      return
    }

    toast.success('Verification code sent', {
      description: 'Check your email for the new code. It may take a few moments to arrive.',
    })

    const timer = setTimeout(() => setResendSuccess(false), 5000)
    return () => clearTimeout(timer)
  }, [resendSuccess])

  useEffect(() => {
    if (isPending) {
      setOtpAnnouncement('Verifying code, please wait')
    }
  }, [isPending])

  useEffect(() => {
    if (!otpAnnouncement) {
      return
    }

    const timer = setTimeout(() => setOtpAnnouncement(null), 1500)
    return () => clearTimeout(timer)
  }, [otpAnnouncement])

  const handleResend = async () => {
    if (!onResend || isResending || resendTimer > 0) return

    setIsResending(true)
    setResendSuccess(false)

    try {
      await onResend()
      setResendTimer(60)
      setResendSuccess(true)
      setOtpAnnouncement('Verification code resent successfully')
    } catch (error) {
      console.error('Failed to resend code:', error)
    } finally {
      setIsResending(false)
    }
  }

  const announcements = [
    isPending && 'Verifying code, please wait',
    isResending && 'Sending new code, please wait',
    !isPending && state?.error,
    !isPending && state?.success && 'Code verified successfully',
    resendSuccess && 'New code sent successfully',
    resendTimer > 0 && `You can request a new code in ${resendTimer} seconds`,
    otpAnnouncement,
  ]

  return {
    state,
    formAction,
    isPending,
    handleResend,
    isResending,
    resendTimer,
    resendSuccess,
    otpAnnouncement,
    setOtpAnnouncement,
    announcements,
  }
}
