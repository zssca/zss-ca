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
import { PasswordVisibilityToggle } from '@/features/auth/components/password-visibility-toggle'
import { Kbd } from '@/components/ui/kbd'

interface UpdatePasswordConfirmPasswordFieldProps {
  fieldErrors?: Record<string, string[]> | undefined
  isPending: boolean
  showConfirmPassword: boolean
  onToggleConfirmPassword: (pressed: boolean) => void
}

const ICON_SIZE = 'size-4'

export function UpdatePasswordConfirmPasswordField({
  fieldErrors,
  isPending,
  showConfirmPassword,
  onToggleConfirmPassword,
}: UpdatePasswordConfirmPasswordFieldProps): React.JSX.Element {
  return (
    <Field data-invalid={!!fieldErrors?.['confirmPassword']}>
      <FieldLabel htmlFor="confirmPassword">
        Confirm Password
        <span className="ml-1 text-destructive" aria-hidden="true">*</span>
      </FieldLabel>
      <InputGroup>
        <InputGroupAddon aria-hidden="true">
          <Lock className={ICON_SIZE} />
        </InputGroupAddon>
        <InputGroupInput
          type={showConfirmPassword ? 'text' : 'password'}
          id="confirmPassword"
          name="confirmPassword"
          placeholder="••••••••"
          autoComplete="new-password webauthn"
          data-webauthn="true"
          required
          aria-required="true"
          aria-invalid={!!fieldErrors?.['confirmPassword']}
          aria-describedby={fieldErrors?.['confirmPassword'] ? 'update-confirm-password-error' : undefined}
          disabled={isPending}
        />
        <InputGroupAddon align="inline-end">
          <PasswordVisibilityToggle
            pressed={showConfirmPassword}
            onPressedChange={onToggleConfirmPassword}
            disabled={isPending}
            showLabel="Show confirm password"
            hideLabel="Hide confirm password"
          />
        </InputGroupAddon>
      </InputGroup>
      {fieldErrors?.['confirmPassword'] ? (
        <FieldError
          id="update-confirm-password-error"
          errors={fieldErrors['confirmPassword'].map((message) => ({ message }))}
        />
      ) : null}
      <FieldDescription className="text-xs text-muted-foreground">
        Press <Kbd>Enter</Kbd> to confirm and update your password.
      </FieldDescription>
    </Field>
  )
}
