'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { updateProfileAction } from '../api/mutations'
import type { Database } from '@/lib/types/database.types'
import { toast } from 'sonner'
import { SubmitButton } from './profile-form-submit-button'
import { ProfileContactFieldsNative } from './profile-contact-fields-native'
import { ProfileCompanyFieldsNative } from './profile-company-fields-native'
import { ProfileAddressFieldsNative } from './profile-address-fields-native'

type Profile = Database['public']['Tables']['profile']['Row']

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps): React.JSX.Element {
  const [state, formAction, isPending] = useActionState(updateProfileAction, {
    error: null,
  })

  // Show toast notifications based on form state
  useEffect(() => {
    if (!isPending && state) {
      if (state.error) {
        toast.error('Profile update failed', {
          description: state.error,
        })
      } else {
        toast.success('Profile updated', {
          description: 'Your profile has been updated successfully',
        })
      }
    }
  }, [state, isPending])

  return (
    <div>
      {/* Screen reader announcement for form status */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {isPending && 'Form is submitting, please wait'}
        {!isPending && !state?.error && state && 'Profile updated successfully'}
      </div>

      <form action={formAction} className="space-y-6">
        <ProfileContactFieldsNative
          profile={profile}
          errors={state && 'fieldErrors' in state ? state.fieldErrors : undefined}
          isPending={isPending}
        />
        <ProfileCompanyFieldsNative
          profile={profile}
          errors={state && 'fieldErrors' in state ? state.fieldErrors : undefined}
          isPending={isPending}
        />
        <ProfileAddressFieldsNative
          profile={profile}
          errors={state && 'fieldErrors' in state ? state.fieldErrors : undefined}
          isPending={isPending}
        />
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
