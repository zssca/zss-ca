import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getServiceRoleKeyOrThrow, resolveServerSupabaseUrl } from '@/lib/supabase/env'
import type { Database } from '@/lib/types/database.types'

/**
 * Creates an admin Supabase client with service role access
 *
 * WARNING: This client bypasses RLS policies. Only use for:
 * - Background jobs
 * - Webhooks
 * - Admin operations
 * - Data migrations
 *
 * NEVER expose this client or its credentials to the frontend
 *
 * @returns Supabase admin client with full database access
 */
export function createClient() {
  const supabaseUrl = resolveServerSupabaseUrl()
  if (!supabaseUrl) {
    throw new Error(
      '[supabase-admin] Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) environment variable.'
    )
  }
  const supabaseServiceKey = getServiceRoleKeyOrThrow()

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
