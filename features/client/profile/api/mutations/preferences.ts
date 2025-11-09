'use server'

import { updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updatePreferencesSchema, defaultUserPreferences } from '../schema'

type ActionResult =
  | { error: string; fieldErrors?: Record<string, string[]> }
  | { error: null }

export async function updatePreferencesAction(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const result = updatePreferencesSchema.safeParse({
    email_notifications: formData.get('email_notifications') === 'on',
    sms_notifications: formData.get('sms_notifications') === 'on',
    marketing_opt_in: formData.get('marketing_opt_in') === 'on',
    appearance: (formData.get('appearance') ?? defaultUserPreferences.appearance) as string,
    language: (formData.get('language') ?? defaultUserPreferences.language) as string,
    timezone: (formData.get('timezone') ?? defaultUserPreferences.timezone) as string,
  })

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const payload = {
    profile_id: user.id,
    ...result.data,
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert(payload, { onConflict: 'profile_id' })

  if (error) {
    console.error('Error updating preferences:', error)
    return { error: 'Failed to update preferences' }
  }

  const { error: profileError } = await supabase
    .from('profile')
    .update({ marketing_opt_in: result.data.marketing_opt_in })
    .eq('id', user.id)

  if (profileError) {
    console.error('Error syncing marketing preference:', profileError)
    return { error: 'Preferences saved but marketing opt-in sync failed' }
  }

  updateTag(`user-preferences:${user.id}`)
  updateTag(`profile:${user.id}`)

  return { error: null }
}
