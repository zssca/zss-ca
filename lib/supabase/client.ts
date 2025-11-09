import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getBrowserSupabaseEnvOrThrow } from '@/lib/supabase/env'
import type { Database } from '@/lib/types/database.types'

export function createClient(): SupabaseClient<Database> {
  const { url, anonKey } = getBrowserSupabaseEnvOrThrow('createBrowserClient')
  return createBrowserClient<Database>(
    url,
    anonKey,
  )
}
