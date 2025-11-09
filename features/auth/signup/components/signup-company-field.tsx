'use client'

import {
  Field,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SignupCompanyFieldProps {
  fieldErrors?: Record<string, string[]> | undefined
  isPending: boolean
}

const ICON_SIZE = 'size-4'

export function SignupCompanyField({
  fieldErrors,
  isPending,
}: SignupCompanyFieldProps): React.JSX.Element {
  return (
    <Field data-invalid={!!fieldErrors?.['companyName']}>
      <FieldLabel htmlFor="companyName">
        Company Name
        <Badge variant="outline" className="ml-2 text-xs uppercase">
          Optional
        </Badge>
      </FieldLabel>
      <InputGroup>
        <InputGroupAddon aria-hidden="true">
          <Building2 className={ICON_SIZE} />
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          id="companyName"
          name="companyName"
          placeholder="Your company"
          autoComplete="organization"
          disabled={isPending}
        />
      </InputGroup>
      {fieldErrors?.['companyName'] ? (
        <FieldError
          id="signup-company-error"
          errors={fieldErrors['companyName'].map((message) => ({ message }))}
        />
      ) : null}
    </Field>
  )
}
