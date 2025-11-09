import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Lazy initialization of Redis client to avoid build-time errors
let redisInstance: Redis | null = null

function getRedis(): Redis {
  if (!redisInstance) {
    const redisUrl = process.env['UPSTASH_REDIS_REST_URL']
    const redisToken = process.env['UPSTASH_REDIS_REST_TOKEN']

    if (!redisUrl || !redisToken) {
      throw new Error('Missing required environment variables: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN')
    }

    redisInstance = new Redis({
      url: redisUrl,
      token: redisToken,
    })
  }

  return redisInstance
}

// Lazy initialization of rate limiters
type RateLimiters = {
  login: Ratelimit
  signup: Ratelimit
  passwordReset: Ratelimit
  verificationResend: Ratelimit
  contactForm: Ratelimit
  createTicket: Ratelimit
  ticketReply: Ratelimit
  bulkNotifications: Ratelimit
  api: Ratelimit
}

let rateLimitersCache: RateLimiters | null = null

function getRateLimiters(): RateLimiters {
  if (!rateLimitersCache) {
    const redis = getRedis()

    rateLimitersCache = {
      // Authentication endpoints
      login: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '5 m'),
        analytics: true,
        prefix: 'ratelimit:login',
      }),

      signup: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        analytics: true,
        prefix: 'ratelimit:signup',
      }),

      passwordReset: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        analytics: true,
        prefix: 'ratelimit:password-reset',
      }),

      verificationResend: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '15 m'),
        analytics: true,
        prefix: 'ratelimit:verification-resend',
      }),

      // Contact and support endpoints
      contactForm: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        analytics: true,
        prefix: 'ratelimit:contact',
      }),

      createTicket: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'),
        analytics: true,
        prefix: 'ratelimit:ticket',
      }),

      ticketReply: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '1 h'),
        analytics: true,
        prefix: 'ratelimit:ticket-reply',
      }),

      // Admin bulk operations
      bulkNotifications: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        analytics: true,
        prefix: 'ratelimit:bulk-notifications',
      }),

      // General API endpoints
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        analytics: true,
        prefix: 'ratelimit:api',
      }),
    }
  }

  return rateLimitersCache
}

// Export rate limits with getter functions
export const rateLimits: {
  readonly login: Ratelimit
  readonly signup: Ratelimit
  readonly passwordReset: Ratelimit
  readonly verificationResend: Ratelimit
  readonly contactForm: Ratelimit
  readonly createTicket: Ratelimit
  readonly ticketReply: Ratelimit
  readonly bulkNotifications: Ratelimit
  readonly api: Ratelimit
} = {
  get login() { return getRateLimiters().login },
  get signup() { return getRateLimiters().signup },
  get passwordReset() { return getRateLimiters().passwordReset },
  get verificationResend() { return getRateLimiters().verificationResend },
  get contactForm() { return getRateLimiters().contactForm },
  get createTicket() { return getRateLimiters().createTicket },
  get ticketReply() { return getRateLimiters().ticketReply },
  get bulkNotifications() { return getRateLimiters().bulkNotifications },
  get api() { return getRateLimiters().api },
}

export { checkRateLimit, getClientIdentifier, getRateLimitHeaders } from './core'
export { withRateLimit } from './with-rate-limit'
