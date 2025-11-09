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

interface SignupEmailFieldProps {
  fieldErrors?: Record<string, string[]> | undefined
  isPending: boolean
  emailError: string | null
  onEmailErrorChange: (message: string | null) => void
}

const ICON_SIZE = 'size-4'
const EMAIL_HINT_ID = 'signup-email-hint'

export function SignupEmailField({
  fieldErrors,
  isPending,
  emailError,
  onEmailErrorChange,
}: SignupEmailFieldProps): React.JSX.Element {
  const emailServerErrorId = fieldErrors?.['email'] ? 'signup-email-error' : null
  const emailClientErrorId = emailError ? 'signup-email-error-client' : null

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
        Use your work email to invite teammates automatically. Press <Kbd>Enter</Kbd> to move to the next field.
      </FieldDescription>
      {fieldErrors?.['email'] ? (
        <FieldError
          id="signup-email-error"
          errors={fieldErrors['email'].map((message) => ({ message }))}
        />
      ) : null}
      {emailError ? (
        <FieldError
          id="signup-email-error-client"
          errors={[{ message: emailError }]}
        />
      ) : null}
    </Field>
  )
}
