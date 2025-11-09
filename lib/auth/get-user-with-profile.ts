import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { hasServerSupabaseEnv } from '@/lib/supabase/env'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profile']['Row']
type User = Awaited<
  ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>
>['data']['user']

export interface UserWithProfile {
  user: User
  profile: Profile | null
}

/**
 * Get authenticated user with their profile
 *
 * This function fetches the current authenticated user and their associated
 * profile from the database. Used primarily by layout components that need
 * to display user information.
 *
 * @returns UserWithProfile object if authenticated, null if not
 *
 * @example
 * ```typescript
 * const userWithProfile = await getUserWithProfile()
 * if (userWithProfile) {
 *   const { user, profile } = userWithProfile
 *   // Use user and profile data
 * }
 * ```
 */
export async function getUserWithProfile(): Promise<UserWithProfile | null> {
  if (!hasServerSupabaseEnv()) {
    return null
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    user,
    profile: profile ?? null,
  }
}
