import 'server-only'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getServerSupabaseEnvOrThrow } from '@/lib/supabase/env'
import type { Database } from '@/lib/types/database.types'

interface CreateClientOptions {
  cookieMaxAge?: number
}

export async function createClient(
  options: CreateClientOptions = {},
): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()
  const { url, anonKey } = getServerSupabaseEnvOrThrow('createServerClient')

  const cookieOptions =
    typeof options.cookieMaxAge === 'number' ? { maxAge: options.cookieMaxAge } : undefined

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component cookie setting can fail
            // This is expected when called from a Server Component
          }
        },
      },
    },
  )
}
