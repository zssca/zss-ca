'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Kbd } from '@/components/ui/kbd'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AuthSubmitButton } from '@/features/auth/components/auth-submit-button'
import { PasswordVisibilityToggle } from '@/features/auth/components/password-visibility-toggle'
import { ROUTES } from '@/lib/constants/routes'
import { Lock, Mail } from 'lucide-react'

interface LoginFormFieldsProps {
  formAction: (formData: FormData) => void
  state: { fieldErrors?: Record<string, string[]> } | null
  isPending: boolean
  isRateLimited: boolean
  rememberMe: boolean
  onRememberChange: (checked: boolean) => void
  showPassword: boolean
  onTogglePassword: (next: boolean) => void
  emailError: string | null
  onEmailErrorChange: (message: string | null) => void
}

const ICON_SIZE = 'size-4'

export function LoginFormFields({
  formAction,
  state,
  isPending,
  isRateLimited,
  rememberMe,
  onRememberChange,
  showPassword,
  onTogglePassword,
  emailError,
  onEmailErrorChange,
}: LoginFormFieldsProps): React.JSX.Element {
  const emailHintId = 'login-email-hint'
  const passwordHintId = 'login-password-hint'
  const emailServerErrorId = state?.fieldErrors?.['email'] ? 'login-email-error' : null
  const emailClientErrorId = emailError ? 'login-email-error-client' : null
  const passwordErrorId = state?.fieldErrors?.['password'] ? 'login-password-error' : null

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="remember" value={rememberMe ? 'on' : 'off'} />

      <FieldGroup className="gap-4">
        <Field data-invalid={!!(state?.fieldErrors?.['email']) || !!emailError}>
          <FieldLabel htmlFor="email">
            Email
            <span className="ml-1 text-destructive" aria-hidden="true">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon aria-hidden="true">
              <Mail className={ICON_SIZE} />
            </InputGroupAddon>
            <InputGroupInput
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              inputMode="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={!!(state?.fieldErrors?.['email']) || !!emailError}
              aria-describedby={[
                emailServerErrorId,
                emailClientErrorId,
                emailHintId,
              ].filter(Boolean).join(' ') || undefined}
              disabled={isPending || isRateLimited}
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              onBlur={(event) => {
                if (!event.target.value) {
                  onEmailErrorChange('Email is required')
                } else if (!event.target.checkValidity()) {
                  onEmailErrorChange('Enter a valid email address')
                } else {
                  onEmailErrorChange(null)
                }
              }}
              onChange={() => onEmailErrorChange(null)}
            />
          </InputGroup>
          <FieldDescription id={emailHintId} className="text-xs text-muted-foreground">
            Press <Kbd>Enter</Kbd> to move to password or <Kbd>Esc</Kbd> to clear this field.
          </FieldDescription>
          {state?.fieldErrors?.['email'] ? (
            <FieldError
              id="login-email-error"
              errors={state.fieldErrors['email'].map((message) => ({ message }))}
            />
          ) : null}
          {emailError ? <FieldError id="login-email-error-client" errors={[{ message: emailError }]} /> : null}
        </Field>

        <Field data-invalid={!!state?.fieldErrors?.['password']}>
          <FieldLabel htmlFor="password">
            Password
            <span className="ml-1 text-destructive" aria-hidden="true">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon aria-hidden="true">
              <Lock className={ICON_SIZE} />
            </InputGroupAddon>
            <InputGroupInput
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              aria-required="true"
              aria-invalid={!!state?.fieldErrors?.['password']}
              aria-describedby={[
                passwordErrorId,
                passwordHintId,
              ].filter(Boolean).join(' ') || undefined}
              disabled={isPending || isRateLimited}
            />
            <InputGroupAddon align="inline-end">
              <PasswordVisibilityToggle
                pressed={showPassword}
                onPressedChange={onTogglePassword}
                disabled={isPending || isRateLimited}
              />
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription id={passwordHintId} className="text-xs text-muted-foreground">
            Press <Kbd>Enter</Kbd> to submit or <Kbd>Esc</Kbd> to clear the password.
          </FieldDescription>
          {state?.fieldErrors?.['password'] ? (
            <FieldError
              id="login-password-error"
              errors={state.fieldErrors['password'].map((message) => ({ message }))}
            />
          ) : null}
        </Field>
      </FieldGroup>

      <FieldSeparator />

      <Field orientation="horizontal" className="items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => onRememberChange(checked === true)}
            disabled={isPending || isRateLimited}
            aria-label="Remember me for 30 days"
          />
          <FieldLabel htmlFor="remember" className="text-sm font-normal text-muted-foreground">
            Remember me for 30 days
          </FieldLabel>
        </div>
        <Button asChild variant="link" size="sm">
          <Link href={ROUTES.RESET_PASSWORD}>Forgot password?</Link>
        </Button>
      </Field>

      <FieldSeparator />

      <AuthSubmitButton label="Sign in" disabled={isRateLimited} loadingLabel="Signing in, please wait" />

      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account?</span>
        <Button asChild variant="link" size="sm">
          <Link href={ROUTES.SIGNUP}>Sign up</Link>
        </Button>
      </div>
    </form>
  )
}
