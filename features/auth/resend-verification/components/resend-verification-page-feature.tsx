import { Suspense } from 'react'
import { ResendVerificationForm } from '../../components/resend-verification-form'

export function ResendVerificationPageFeature() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Resend Verification Email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address to receive a new verification code
          </p>
        </div>
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <ResendVerificationForm />
        </Suspense>
      </div>
    </div>
  )
}
