'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Mail } from 'lucide-react'
import { Kbd } from '@/components/ui/kbd'

interface ResetPasswordEmailFieldProps {
  fieldErrors?: Record<string, string[]> | undefined
  isPending: boolean
  emailError: string | null
  onEmailErrorChange: (message: string | null) => void
}

const ICON_SIZE = 'size-4'
const EMAIL_HINT_ID = 'reset-email-hint'

export function ResetPasswordEmailField({
  fieldErrors,
  isPending,
  emailError,
  onEmailErrorChange,
}: ResetPasswordEmailFieldProps): React.JSX.Element {
  const emailServerErrorId = fieldErrors?.['email'] ? 'reset-email-error' : null
  const emailClientErrorId = emailError ? 'reset-email-error-client' : null

  return (
    <Field data-invalid={!!fieldErrors?.['email'] || !!emailError}>
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
          aria-invalid={!!fieldErrors?.['email'] || !!emailError}
          aria-describedby={[
            emailServerErrorId,
            emailClientErrorId,
            EMAIL_HINT_ID,
          ].filter(Boolean).join(' ') || undefined}
          disabled={isPending}
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
      <FieldDescription id={EMAIL_HINT_ID} className="text-xs text-muted-foreground">
        We&apos;ll send a verification code to this address. Press <Kbd>Enter</Kbd> to submit quickly.
      </FieldDescription>
      {fieldErrors?.['email'] ? (
        <FieldError
          id="reset-email-error"
          errors={fieldErrors['email'].map((message) => ({ message }))}
        />
      ) : null}
      {emailError ? (
        <FieldError
          id="reset-email-error-client"
          errors={[{ message: emailError }]}
        />
      ) : null}
    </Field>
  )
}
