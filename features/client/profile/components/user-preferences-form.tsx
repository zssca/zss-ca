'use client'

import { useActionState, useEffect } from 'react'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { SubmitButton } from './profile-form-submit-button'
import type { UserPreferences } from '../api/schema'
import {
  appearanceOptions,
  languageOptions,
  timezoneOptions,
} from '../api/schema'
import { updatePreferencesAction } from '../api/mutations'

interface UserPreferencesFormProps {
  preferences: UserPreferences
}

export function UserPreferencesForm({ preferences }: UserPreferencesFormProps): React.JSX.Element {
  const [state, formAction, isPending] = useActionState(updatePreferencesAction, {
    error: null,
  })

  useEffect(() => {
    if (!isPending && state) {
      if (state.error) {
        toast.error('Preference update failed', {
          description: state.error,
        })
      } else {
        toast.success('Preferences updated', {
          description: 'Your notification and display settings have been saved',
        })
      }
    }
  }, [state, isPending])

  const fieldErrors = state && 'fieldErrors' in state ? state.fieldErrors : undefined

  return (
    <div>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {isPending && 'Saving your preferences, please wait'}
        {!isPending && !state?.error && state && 'Preferences updated successfully'}
      </div>

      <form action={formAction} className="space-y-6">
        <FieldSet>
          <FieldLegend>Notifications</FieldLegend>
          <FieldGroup>
            <Field
              className="flex items-start gap-3"
              data-invalid={false}
            >
              <input
                type="checkbox"
                id="email_notifications"
                name="email_notifications"
                defaultChecked={preferences.email_notifications}
                disabled={isPending}
                className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <div className="flex-1">
                <FieldLabel htmlFor="email_notifications">Email notifications</FieldLabel>
                <FieldDescription>Receive product updates, site alerts, and deployment summaries via email.</FieldDescription>
              </div>
            </Field>

            <Field
              className="flex items-start gap-3"
              data-invalid={false}
            >
              <input
                type="checkbox"
                id="sms_notifications"
                name="sms_notifications"
                defaultChecked={preferences.sms_notifications}
                disabled={isPending}
                className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <div className="flex-1">
                <FieldLabel htmlFor="sms_notifications">SMS notifications</FieldLabel>
                <FieldDescription>Receive urgent deployment and billing alerts via SMS.</FieldDescription>
              </div>
            </Field>

            <Field
              className="flex items-start gap-3"
              data-invalid={false}
            >
              <input
                type="checkbox"
                id="marketing_opt_in"
                name="marketing_opt_in"
                defaultChecked={preferences.marketing_opt_in}
                disabled={isPending}
                className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <div className="flex-1">
                <FieldLabel htmlFor="marketing_opt_in">Marketing communications</FieldLabel>
                <FieldDescription>Hear about roadmap updates, beta programs, and exclusive offers.</FieldDescription>
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Display & locale</FieldLegend>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors?.['appearance']}>
              <FieldLabel htmlFor="appearance">Appearance</FieldLabel>
              <select
                id="appearance"
                name="appearance"
                defaultValue={preferences.appearance}
                aria-invalid={!!fieldErrors?.['appearance']}
                disabled={isPending}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {appearanceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'system' ? 'Match system' : option === 'light' ? 'Light' : 'Dark'}
                  </option>
                ))}
              </select>
              <FieldDescription>Choose how the dashboard should look.</FieldDescription>
              <FieldError
                errors={fieldErrors?.['appearance']?.map((message) => ({ message }))}
              />
            </Field>

            <Field data-invalid={!!fieldErrors?.['language']}>
              <FieldLabel htmlFor="language">Language</FieldLabel>
              <select
                id="language"
                name="language"
                defaultValue={preferences.language}
                aria-invalid={!!fieldErrors?.['language']}
                disabled={isPending}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'en' ? 'English (US)' : 'French (Canada)'}
                  </option>
                ))}
              </select>
              <FieldDescription>Interface language for navigation and notifications.</FieldDescription>
              <FieldError
                errors={fieldErrors?.['language']?.map((message) => ({ message }))}
              />
            </Field>

            <Field data-invalid={!!fieldErrors?.['timezone']}>
              <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
              <select
                id="timezone"
                name="timezone"
                defaultValue={preferences.timezone}
                aria-invalid={!!fieldErrors?.['timezone']}
                disabled={isPending}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {timezoneOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatTimezone(option)}
                  </option>
                ))}
              </select>
              <FieldDescription>Used for analytics rollups and scheduled maintenance windows.</FieldDescription>
              <FieldError
                errors={fieldErrors?.['timezone']?.map((message) => ({ message }))}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <div className="flex gap-2">
          <SubmitButton />
          <Button type="reset" variant="outline" disabled={isPending}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}

function formatTimezone(timezone: string): string {
  switch (timezone) {
    case 'UTC':
      return 'UTC'
    case 'America/Toronto':
      return 'Eastern (America/Toronto)'
    case 'America/Los_Angeles':
      return 'Pacific (America/Los_Angeles)'
    case 'Europe/London':
      return 'London (Europe/London)'
    case 'Asia/Tokyo':
      return 'Tokyo (Asia/Tokyo)'
    default:
      return timezone
  }
}
