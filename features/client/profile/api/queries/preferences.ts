import 'server-only'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  defaultUserPreferences,
  type UserPreferences,
  userPreferencesRowSchema,
} from '../schema'

const USER_PREFERENCES_COLUMNS = `
  profile_id,
  email_notifications,
  sms_notifications,
  marketing_opt_in,
  appearance,
  language,
  timezone,
  created_at,
  updated_at
`

export const getUserPreferences = cache(async (): Promise<UserPreferences | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select(USER_PREFERENCES_COLUMNS)
    .eq('profile_id', user.id)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user preferences:', error)
    return null
  }

  if (!data) {
    const defaults = {
      profile_id: user.id,
      ...defaultUserPreferences,
    }

    const { data: inserted, error: insertError } = await supabase
      .from('user_preferences')
      .insert(defaults)
      .select(USER_PREFERENCES_COLUMNS)
      .single()

    if (insertError || !inserted) {
      console.error('Error seeding user preferences:', insertError)
      // Fallback to defaults with synthetic timestamps to avoid blocking the UI
      return userPreferencesRowSchema.parse({
        ...defaults,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    return userPreferencesRowSchema.parse(inserted)
  }

  return userPreferencesRowSchema.parse(data)
})
