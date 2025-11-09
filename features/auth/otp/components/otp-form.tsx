'use client'

import Link from 'next/link'
import { Item } from '@/components/ui/item'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { ROUTES } from '@/lib/constants/routes'
import { Kbd } from '@/components/ui/kbd'
import { AuthFormAnnouncements } from '@/features/auth/components/auth-form-announcements'
import { OTPFormHeader } from './otp-form-header'
import { OTPFormActions } from './otp-form-actions'
import { OTPFormStatus } from './otp-form-status'
import { useOtpForm } from '../hooks/use-otp-form'
import { getVerificationSteps } from '../utils/get-verification-steps'
import { OTPVerificationBreadcrumb } from './otp-verification-breadcrumb'

interface OTPFormProps {
  email: string
  verificationType: 'password_reset' | 'email_confirmation' | 'two_factor'
  onVerify: (otp: string) => Promise<{ success: boolean; message?: string }>
  onResend?: () => Promise<void>
  title?: string
  description?: string
}

export function OTPForm({
  email,
  verificationType,
  onVerify,
  onResend,
  title = 'Enter Verification Code',
  description = "We've sent a 6-digit verification code to your email.",
}: OTPFormProps) {
  const {
    state,
    formAction,
    isPending,
    handleResend,
    isResending,
    resendTimer,
    resendSuccess,
    setOtpAnnouncement,
    announcements,
  } = useOtpForm({ onVerify, onResend })

  const otpDescriptionId = 'otp-instructions'
  const verificationSteps = getVerificationSteps(verificationType)

  return (
    <div className="flex flex-col gap-6 items-center">
      <AuthFormAnnouncements messages={announcements} />

      <Item variant="outline" className="overflow-hidden bg-card max-w-7xl w-full">
        <div className="grid p-0 md:grid-cols-2 gap-0 w-full">
          <FieldGroup className="gap-6 p-6 md:p-8">
            <OTPVerificationBreadcrumb steps={verificationSteps} />

            <OTPFormHeader
              title={title}
              description={description}
              email={email}
              verificationType={verificationType}
            />

            <OTPFormStatus resendSuccess={resendSuccess} errorMessage={state?.error} />

            <form action={formAction} className="space-y-6" noValidate>
              <FieldGroup className="gap-4">
                <Field data-invalid={!!state?.error}>
                  <FieldLabel htmlFor="otp">One-Time Password</FieldLabel>
                  <FieldDescription id={otpDescriptionId}>
                    Enter the 6-digit code we sent. Use <Kbd>Tab</Kbd> to move forward and{' '}
                    <Kbd>Shift</Kbd>+<Kbd>Tab</Kbd> to move back between slots.
                  </FieldDescription>
                  <InputOTP
                    maxLength={6}
                    disabled={isPending}
                    name="otp"
                    id="otp"
                    required
                    aria-required="true"
                    aria-invalid={!!state?.error}
                    aria-describedby={[
                      state?.error ? 'otp-error' : null,
                      otpDescriptionId,
                    ].filter(Boolean).join(' ')}
                    onChange={(value) => {
                      if (value.length === 3) {
                        setOtpAnnouncement('Halfway through code entry')
                      }
                    }}
                    onComplete={() => {
                      setOtpAnnouncement('Code entry complete, verifying now')
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {state?.error ? (
                    <FieldError id="otp-error" errors={[{ message: state.error }]} />
                  ) : null}
                </Field>
              </FieldGroup>

              <OTPFormActions
                isResending={isResending}
                canResend={resendTimer === 0}
                resendTimer={resendTimer}
                onResend={handleResend}
              />
            </form>
          </FieldGroup>

          <div className="bg-muted relative hidden md:flex items-center rounded-md justify-center text-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Secure verification</h2>
              <p className="text-muted-foreground text-sm text-balance">
                Protect access to your sites and tickets with a quick one-time code delivered to your inbox.
              </p>
            </div>
          </div>
        </div>
      </Item>

      <p className="text-center text-sm text-muted-foreground">
        By continuing you agree to our{' '}
        <Link href={ROUTES.PRIVACY}>Privacy Policy</Link>{' '}and{' '}
        <Link href={ROUTES.TERMS}>Terms of Service</Link>.
      </p>
    </div>
  )
}
