'use client'

import { useState } from 'react'
import { AlertCircle, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface VerificationStatusBannerProps {
  email: string
  isVerified: boolean
}

/**
 * Verification Status Banner
 *
 * Displays the email verification status and allows users to resend
 * verification emails if not verified.
 *
 * Features:
 * - Shows verification status (verified or pending)
 * - Resend verification email button
 * - Rate limiting feedback
 * - Success/error toast notifications
 */
export function VerificationStatusBanner({ email, isVerified }: VerificationStatusBannerProps) {
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { toast } = useToast()

  // Don't show banner if already verified
  if (isVerified) {
    return null
  }

  const handleResendVerification = async () => {
    setIsResending(true)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.status === 429) {
        // Rate limited
        const retryAfter = data.retryAfter
        const minutes = Math.ceil((retryAfter - Date.now()) / 60000)
        setCooldown(retryAfter)

        toast({
          variant: 'destructive',
          title: 'Too Many Requests',
          description: `Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before requesting another verification email.`,
        })
      } else if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to send verification email. Please try again.',
        })
      } else {
        toast({
          title: 'Verification Email Sent',
          description: 'Please check your inbox and spam folder for the verification email.',
        })

        // Set a 60-second cooldown for UI feedback
        setCooldown(Date.now() + 60000)
      }
    } catch (error) {
      console.error('Error resending verification:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
      })
    } finally {
      setIsResending(false)
    }
  }

  const isCooldownActive = cooldown > Date.now()

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Email Verification Required</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          Your email address <strong>{email}</strong> is not verified yet.
          Please check your inbox for the verification email.
        </p>
        <Button
          onClick={handleResendVerification}
          disabled={isResending || isCooldownActive}
          variant="outline"
          size="sm"
          className="bg-white text-red-600 border-red-300 hover:bg-red-50"
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Resend Verification Email
            </>
          )}
        </Button>
        {isCooldownActive && (
          <p className="text-sm text-muted-foreground mt-2">
            Please wait before requesting another email.
          </p>
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Verification Success Banner
 *
 * Shows a success message when email is verified
 */
export function VerificationSuccessBanner() {
  return (
    <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle>Email Verified</AlertTitle>
      <AlertDescription>
        Your email address has been successfully verified. You now have full access to your account.
      </AlertDescription>
    </Alert>
  )
}
