'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface OTPFormStatusProps {
  resendSuccess: boolean
  errorMessage?: string
}

export function OTPFormStatus({ resendSuccess, errorMessage }: OTPFormStatusProps) {
  return (
    <>
      {resendSuccess ? (
        <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100">
          <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Code sent</AlertTitle>
          <AlertDescription>
            A new verification code has been sent to your email. It may take a few minutes to arrive.
          </AlertDescription>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive" aria-live="assertive">
          <AlertCircle className="size-4" />
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
    </>
  )
}
