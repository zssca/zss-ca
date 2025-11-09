import { createClient } from '@/lib/supabase/server'

export type ViolationType = 'login' | 'api' | 'contact_form' | 'signup' | 'password_reset' | 'generic'

export interface RateLimitViolation {
  email?: string
  ipAddress?: string
  endpoint: string
  violationType: ViolationType
  requestCount: number
  limitThreshold: number
  userAgent?: string
}

/**
 * Log a rate limit violation to the database
 * This will automatically alert admins if a user has 3+ violations in an hour
 */
export async function logRateLimitViolation(violation: RateLimitViolation): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.rpc('log_rate_limit_violation', {
      p_email: violation.email ?? '',
      p_ip_address: violation.ipAddress ?? '',
      p_endpoint: violation.endpoint,
      p_violation_type: violation.violationType,
      p_request_count: violation.requestCount,
      p_limit_threshold: violation.limitThreshold,
      p_user_agent: violation.userAgent,
    })

    if (error) {
      console.error('Failed to log rate limit violation:', error)
    }
  } catch (error) {
    console.error('Error logging rate limit violation:', error)
    // Don't throw - logging failures shouldn't break the application
  }
}

/**
 * Get rate limit violation statistics for admin dashboard
 */
export async function getRateLimitStats(hoursAgo: number = 24): Promise<{
  totalViolations: number
  uniqueUsers: number
  uniqueIps: number
  topViolators: Array<{
    email: string
    ip_address: string
    violation_count: number
    last_violation: string
  }>
} | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_rate_limit_stats', {
      p_hours_ago: hoursAgo,
    })

    if (error) {
      console.error('Failed to get rate limit stats:', error)
      return null
    }

    type StatsResult = {
      total_violations: number
      unique_users: number
      unique_ips: number
      top_violators: Array<{
        email: string
        ip_address: string
        violation_count: number
        last_violation: string
      }>
    }

    const stats = data as StatsResult

    return {
      totalViolations: stats.total_violations,
      uniqueUsers: stats.unique_users,
      uniqueIps: stats.unique_ips,
      topViolators: stats.top_violators || [],
    }
  } catch (error) {
    console.error('Error getting rate limit stats:', error)
    return null
  }
}
