/**
 * Environment Variable Type Definitions
 *
 * Provides type-safe access to environment variables with proper validation.
 * Follows docs/rules/02-typescript.md patterns for strict type safety.
 */

/**
 * Retrieves a required environment variable with type safety
 * @throws Error if variable is not set
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Retrieves an optional environment variable with type safety
 */
export function getEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Type-safe environment variable accessors
 * Use these instead of direct process.env access to avoid TS4111 errors
 */
export const env = {
  // Supabase
  get NEXT_PUBLIC_SUPABASE_URL(): string {
    return requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY(): string {
    return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  },
  get SUPABASE_SERVICE_ROLE_KEY(): string {
    return requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  },
  get SUPABASE_WEBHOOK_SECRET(): string | undefined {
    return getEnv('SUPABASE_WEBHOOK_SECRET');
  },

  // Stripe
  get STRIPE_SECRET_KEY(): string {
    return requireEnv('STRIPE_SECRET_KEY');
  },
  get STRIPE_WEBHOOK_SECRET(): string {
    return requireEnv('STRIPE_WEBHOOK_SECRET');
  },
  get NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY(): string {
    return requireEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  },

  // Upstash Redis
  get UPSTASH_REDIS_REST_URL(): string | undefined {
    return getEnv('UPSTASH_REDIS_REST_URL');
  },
  get UPSTASH_REDIS_REST_TOKEN(): string | undefined {
    return getEnv('UPSTASH_REDIS_REST_TOKEN');
  },

  // Resend
  get RESEND_API_KEY(): string {
    return requireEnv('RESEND_API_KEY');
  },

  // App
  get NEXT_PUBLIC_APP_URL(): string {
    return requireEnv('NEXT_PUBLIC_APP_URL');
  },
  get NODE_ENV(): 'development' | 'production' | 'test' {
    const nodeEnv = process.env['NODE_ENV'] || 'development';
    if (nodeEnv !== 'development' && nodeEnv !== 'production' && nodeEnv !== 'test') {
      return 'development';
    }
    return nodeEnv;
  },

  // Helper: Check if variable exists
  has(key: string): boolean {
    return process.env[key] !== undefined;
  },
} as const;
