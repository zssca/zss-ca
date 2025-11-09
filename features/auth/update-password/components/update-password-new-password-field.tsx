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
import { Lock } from 'lucide-react'
import { PasswordRequirementsHint } from '@/features/auth/components/password-requirements-hint'
import { PasswordStrengthIndicator } from '@/features/auth/components/password-strength-indicator'
import type { PasswordStrengthResult } from '@/lib/utils/password-strength'
import { PasswordVisibilityToggle } from '@/features/auth/components/password-visibility-toggle'
import { Kbd } from '@/components/ui/kbd'

interface UpdatePasswordNewPasswordFieldProps {
  fieldErrors?: Record<string, string[]> | undefined
  isPending: boolean
  passwordResult: PasswordStrengthResult
  showPassword: boolean
  onTogglePassword: (pressed: boolean) => void
  onPasswordInput: (value: string) => void
}

const ICON_SIZE = 'size-4'
const PASSWORD_HINT_ID = 'update-password-hint'
const PASSWORD_STRENGTH_ID = 'update-password-strength'

export function UpdatePasswordNewPasswordField({
  fieldErrors,
  isPending,
  passwordResult,
  showPassword,
  onTogglePassword,
  onPasswordInput,
}: UpdatePasswordNewPasswordFieldProps): React.JSX.Element {
  return (
    <Field data-invalid={!!fieldErrors?.['password']}>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor="password">
          Password
          <span className="ml-1 text-destructive" aria-hidden="true">*</span>
        </FieldLabel>
        <PasswordRequirementsHint ariaLabel="Show password requirements" />
      </div>
      <FieldDescription id={PASSWORD_HINT_ID} className="text-xs text-muted-foreground">
        Hover or focus the info icon to review the full password checklist.
      </FieldDescription>
      <InputGroup>
        <InputGroupAddon aria-hidden="true">
          <Lock className={ICON_SIZE} />
        </InputGroupAddon>
        <InputGroupInput
          type={showPassword ? 'text' : 'password'}
          id="password"
          name="password"
          placeholder="••••••••"
          autoComplete="new-password webauthn"
          data-webauthn="true"
          required
          aria-required="true"
          aria-invalid={!!fieldErrors?.['password']}
          aria-describedby={[
            fieldErrors?.['password'] ? 'update-password-error' : null,
            PASSWORD_STRENGTH_ID,
            PASSWORD_HINT_ID,
          ].filter(Boolean).join(' ') || undefined}
          disabled={isPending}
          onChange={(event) => onPasswordInput(event.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <PasswordVisibilityToggle
            pressed={showPassword}
            onPressedChange={onTogglePassword}
            disabled={isPending}
          />
        </InputGroupAddon>
      </InputGroup>
      <PasswordStrengthIndicator id={PASSWORD_STRENGTH_ID} result={passwordResult} className="mt-2" />
      <FieldDescription className="text-xs text-muted-foreground">
        Press <Kbd>Enter</Kbd> to save once your password is ready.
      </FieldDescription>
      {fieldErrors?.['password'] ? (
        <FieldError
          id="update-password-error"
          errors={fieldErrors['password'].map((message) => ({ message }))}
        />
      ) : null}
    </Field>
  )
}
