import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database.types'

/**
 * Retention & Churn Metrics Types
 * Based on database functions created by Agent 7
 */

export interface ChurnMetrics {
  period: string
  active_start: number
  new_subscriptions: number
  churned: number
  reactivated?: number
  active_end: number
  gross_churn_rate: number
  net_churn_rate: number
  retention_rate: number
  churn_rate: number
}

export interface CohortRetention {
  cohort_month: string
  months_since_start: number
  cohort_size: number
  retained_customers: number
  retention_rate: number
  churned_customers: number
}

export interface ChurnPattern {
  plan_id: string
  plan_name: string
  total_churned: number
  avg_lifetime_days: number
  churned_in_trial: number
  churned_after_trial: number
  avg_revenue_lost: number
  most_common_duration_range?: string
}

type ChurnRateRecord =
  Database['public']['Functions']['calculate_churn_rate']['Returns'][number]

type CohortRetentionRecord =
  Database['public']['Functions']['calculate_cohort_retention']['Returns'][number]

type ChurnPatternRecord =
  Database['public']['Functions']['analyze_churn_patterns']['Returns'][number]

/**
 * Get churn rate metrics for specified date range
 * @param startDate - Start date (default: 1 year ago)
 * @param endDate - End date (default: today)
 */
export async function getChurnRate(
  startDate?: Date,
  endDate?: Date
): Promise<ChurnMetrics[]> {
  const supabase = await createClient()

  const params: {
    p_start_date?: string
    p_end_date?: string
  } = {}

  if (startDate) {
    params.p_start_date = startDate.toISOString().split('T')[0]
  }
  if (endDate) {
    params.p_end_date = endDate.toISOString().split('T')[0]
  }

  const { data, error } = await supabase.rpc('calculate_churn_rate', params)

  if (error) {
    console.error('Error fetching churn rate:', error)
    return []
  }

  return (data || []).map(mapChurnRateRecord)
}

/**
 * Get churn rate for last 12 months
 */
export async function getRecentChurnRate(): Promise<ChurnMetrics[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 12)

  return getChurnRate(startDate, endDate)
}

/**
 * Get current month churn metrics
 */
export async function getCurrentMonthChurn(): Promise<ChurnMetrics | null> {
  const startDate = new Date()
  startDate.setDate(1) // First day of current month

  const data = await getChurnRate(startDate, new Date())

  return data?.[0] || null
}

/**
 * Get cohort retention analysis
 * @param cohortStart - Start of cohort period (default: 1 year ago)
 * @param cohortEnd - End of cohort period (default: today)
 */
export async function getCohortRetention(
  cohortStart?: Date,
  cohortEnd?: Date
): Promise<CohortRetention[]> {
  const supabase = await createClient()

  const params: {
    p_cohort_start?: string
    p_cohort_end?: string
  } = {}

  if (cohortStart) {
    params.p_cohort_start = cohortStart.toISOString().split('T')[0]
  }
  if (cohortEnd) {
    params.p_cohort_end = cohortEnd.toISOString().split('T')[0]
  }

  const { data, error } = await supabase.rpc(
    'calculate_cohort_retention',
    params
  )

  if (error) {
    console.error('Error fetching cohort retention:', error)
    return []
  }

  return (data || []).map(mapCohortRecord)
}

/**
 * Get churn patterns by plan
 * @param months - Number of months to analyze (default: 6)
 */
export async function getChurnPatterns(months = 6): Promise<ChurnPattern[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('analyze_churn_patterns', {
    p_months: months,
  })

  if (error) {
    console.error('Error fetching churn patterns:', error)
    return []
  }

  return (data || []).map(mapChurnPattern)
}

/**
 * Calculate average customer lifetime in months
 */
export async function getAverageCustomerLifetime(): Promise<number> {
  const patterns = await getChurnPatterns()

  if (patterns.length === 0) return 0

  const totalDays = patterns.reduce(
    (sum, pattern) => sum + pattern.avg_lifetime_days,
    0
  )
  const avgDays = totalDays / patterns.length

  return avgDays / 30.44 // Convert to months
}

/**
 * Get retention rate trend (inverse of churn)
 */
export async function getRetentionTrend(): Promise<
  Array<{ month: string; retention_rate: number }>
> {
  const churnData = await getRecentChurnRate()

  return churnData.map((record) => ({
    month: record.period,
    retention_rate: record.retention_rate,
  }))
}

function mapChurnRateRecord(record: ChurnRateRecord): ChurnMetrics {
  return {
    period: record.period,
    active_start: record.active_start,
    new_subscriptions: record.new_subscriptions,
    churned: record.churned,
    reactivated: 0,
    active_end: record.active_end,
    gross_churn_rate: record.gross_churn_rate,
    net_churn_rate: record.net_churn_rate,
    retention_rate: record.retention_rate,
    churn_rate: record.churn_rate,
  }
}

function mapCohortRecord(record: CohortRetentionRecord): CohortRetention {
  return {
    cohort_month: record.cohort_month,
    months_since_start: record.months_since_start,
    cohort_size: record.cohort_size,
    retained_customers: record.retained_customers,
    retention_rate: record.retention_percentage,
    churned_customers: record.churned_customers,
  }
}

function mapChurnPattern(record: ChurnPatternRecord): ChurnPattern {
  return {
    plan_id: record.plan_name,
    plan_name: record.plan_name,
    total_churned: record.churned_count,
    avg_lifetime_days: record.avg_lifetime_days,
    churned_in_trial: record.churn_within_trial,
    churned_after_trial: record.churn_after_trial,
    avg_revenue_lost: record.avg_lifetime_revenue,
    most_common_duration_range: record.most_common_duration_range,
  }
}
