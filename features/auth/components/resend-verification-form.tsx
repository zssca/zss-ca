'use client'

import { useState, useActionState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { resendVerificationAction } from '../api/mutations/resend-verification'

/**
 * Resend Verification Form
 *
 * Form for requesting a new email verification code.
 * Uses server action for security and rate limiting.
 */
export function ResendVerificationForm() {
  const [state, formAction, isPending] = useActionState(resendVerificationAction, null)
  const [email, setEmail] = useState('')

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
          autoComplete="email"
          className="w-full"
        />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Mail className="mr-2 h-4 w-4 animate-pulse" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Send Verification Email
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already verified?{' '}
        <a href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </a>
      </p>
    </form>
  )
}
