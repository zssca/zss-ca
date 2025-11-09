const SERVER_URL_KEYS = ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'] as const
const CLIENT_URL_KEYS = ['NEXT_PUBLIC_SUPABASE_URL'] as const

const SERVER_ANON_KEYS = [
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
] as const

const CLIENT_ANON_KEYS = ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] as const

function getEnvValue(keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = process.env[key]
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }
  return null
}

function inferUrlFromProjectRef(): string | null {
  const ref = process.env['SUPABASE_PROJECT_REF']
  if (!ref) {
    return null
  }
  return `https://${ref}.supabase.co`
}

function formatMissing(keys: readonly string[]): string {
  return keys.join(' | ')
}

export function resolveServerSupabaseUrl(): string | null {
  return getEnvValue(SERVER_URL_KEYS) ?? inferUrlFromProjectRef()
}

export function resolveServerSupabaseAnonKey(): string | null {
  return getEnvValue(SERVER_ANON_KEYS)
}

export function resolveBrowserSupabaseUrl(): string | null {
  return getEnvValue(CLIENT_URL_KEYS)
}

export function resolveBrowserSupabaseAnonKey(): string | null {
  return getEnvValue(CLIENT_ANON_KEYS)
}

export function hasServerSupabaseEnv(): boolean {
  return Boolean(resolveServerSupabaseUrl() && resolveServerSupabaseAnonKey())
}

export function getServerSupabaseEnvOrThrow(context: string) {
  const url = resolveServerSupabaseUrl()
  const anonKey = resolveServerSupabaseAnonKey()

  if (!url || !anonKey) {
    const missing: string[] = []
    if (!url) {
      missing.push(formatMissing(SERVER_URL_KEYS))
    }
    if (!anonKey) {
      missing.push(formatMissing(SERVER_ANON_KEYS))
    }

    throw new Error(
      `[${context}] Missing Supabase environment variables: ${missing.join(
        ', '
      )}. Configure them in .env.local (see https://supabase.com/docs/guides/auth/server-side/creating-a-client).`
    )
  }

  return { url, anonKey }
}

export function getBrowserSupabaseEnvOrThrow(context: string) {
  const url = resolveBrowserSupabaseUrl()
  const anonKey = resolveBrowserSupabaseAnonKey()

  if (!url || !anonKey) {
    const missing: string[] = []
    if (!url) {
      missing.push(formatMissing(CLIENT_URL_KEYS))
    }
    if (!anonKey) {
      missing.push(formatMissing(CLIENT_ANON_KEYS))
    }

    throw new Error(
      `[${context}] Missing browser-safe Supabase env vars: ${missing.join(
        ', '
      )}.`
    )
  }

  return { url, anonKey }
}

export function getServiceRoleKeyOrThrow() {
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!key) {
    throw new Error(
      '[supabase] Missing SUPABASE_SERVICE_ROLE_KEY. Never expose this key to the browser.'
    )
  }
  return key
}
