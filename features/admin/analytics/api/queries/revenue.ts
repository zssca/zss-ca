import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database.types'

/**
 * Revenue Metrics Types
 * Based on database functions created by Agent 7
 */

export interface CurrentMRRMetrics {
  current_mrr: number
  current_arr: number
  active_customers: number
  arpu: number
}

export interface MRRGrowthRecord {
  month: string
  mrr: number
  new_revenue: number
  churned_revenue: number
  growth_rate: number
}

export interface RevenueByPlan {
  plan_id: string
  plan_name: string
  price_monthly: number
  price_yearly: number | null
  active_count: number
  monthly_revenue: number
  yearly_revenue: number
  percentage: number
}

export interface CustomerLTV {
  profile_id: string
  customer_name: string | null
  customer_email: string | null
  subscription_count: number
  total_months_subscribed: number
  avg_monthly_value: number
  total_ltv: number
  current_plan: string | null
}

export interface LTVByPlan {
  plan_id: string
  plan_name: string
  customer_count: number
  avg_ltv: number
  median_ltv: number
  total_ltv: number
  avg_subscription_months: number
}

type CurrentMRRRecord =
  Database['public']['Functions']['calculate_current_mrr']['Returns'][number]
type MRRGrowthRecordRaw =
  Database['public']['Functions']['calculate_mrr_growth']['Returns'][number]
type RevenueByPlanRecord =
  Database['public']['Functions']['calculate_revenue_by_plan']['Returns'][number]
type LTVByPlanRecord =
  Database['public']['Functions']['calculate_ltv_by_plan']['Returns'][number]

/**
 * Get current MRR, ARR, and ARPU metrics
 */
export async function getCurrentMRRMetrics(): Promise<CurrentMRRMetrics | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('calculate_current_mrr')

  if (error) {
    console.error('Error fetching current MRR metrics:', error)
    return null
  }

  const record = data?.[0]
  return record ? mapCurrentMRR(record) : null
}

/**
 * Get MRR growth trends over specified number of months
 * @param months - Number of months to retrieve (default: 12)
 */
export async function getMRRGrowth(months = 12): Promise<MRRGrowthRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('calculate_mrr_growth', {
    p_months: months,
  })

  if (error) {
    console.error('Error fetching MRR growth:', error)
    return []
  }

  return (data || []).map(mapMRRGrowthRecord)
}

/**
 * Get revenue breakdown by plan
 */
export async function getRevenueByPlan(): Promise<RevenueByPlan[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('calculate_revenue_by_plan')

  if (error) {
    console.error('Error fetching revenue by plan:', error)
    return []
  }

  return (data || []).map(mapRevenueByPlan)
}

/**
 * Get customer LTV metrics for all customers
 * @param limit - Maximum number of customers to return (default: 100)
 */
export async function getCustomerLTV(limit = 100): Promise<CustomerLTV[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('calculate_customer_ltv')

  if (error) {
    console.error('Error fetching customer LTV:', error)
    return []
  }

  // Sort by total LTV descending and limit
  const sorted = (data || [])
    .sort((a: CustomerLTV, b: CustomerLTV) => b.total_ltv - a.total_ltv)
    .slice(0, limit)

  return sorted
}

/**
 * Get high-value customers (top 20 by LTV)
 */
export async function getHighValueCustomers(): Promise<CustomerLTV[]> {
  return getCustomerLTV(20)
}

/**
 * Get LTV metrics aggregated by plan
 */
export async function getLTVByPlan(): Promise<LTVByPlan[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('calculate_ltv_by_plan')

  if (error) {
    console.error('Error fetching LTV by plan:', error)
    return []
  }

  return (data || []).map(mapLTVByPlanRecord)
}

/**
 * Refresh the analytics MRR materialized view
 * Should be called after subscription changes or on a schedule
 */
export async function refreshAnalyticsMRR(): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('refresh_analytics_mrr')

  if (error) {
    console.error('Error refreshing analytics MRR:', error)
    return false
  }

  return true
}

function mapCurrentMRR(record: CurrentMRRRecord): CurrentMRRMetrics {
  return {
    current_mrr: record.total_mrr,
    current_arr: record.total_arr,
    active_customers: record.active_customers,
    arpu: record.average_revenue_per_user,
  }
}

function mapMRRGrowthRecord(record: MRRGrowthRecordRaw): MRRGrowthRecord {
  return {
    month: record.month,
    mrr: record.mrr,
    new_revenue: record.new_mrr,
    churned_revenue: record.churned_mrr,
    growth_rate: record.mom_growth_percentage,
  }
}

function mapRevenueByPlan(record: RevenueByPlanRecord): RevenueByPlan {
  return {
    plan_id: record.plan_id,
    plan_name: record.plan_name,
    price_monthly: record.monthly_price,
    price_yearly: null,
    active_count: record.active_count,
    monthly_revenue: record.monthly_revenue,
    yearly_revenue: record.yearly_revenue,
    percentage: record.percentage,
  }
}

function mapLTVByPlanRecord(record: LTVByPlanRecord): LTVByPlan {
  return {
    plan_id: record.plan_id,
    plan_name: record.plan_name,
    customer_count: record.customer_count,
    avg_ltv: record.avg_ltv,
    median_ltv: record.median_ltv,
    total_ltv: record.total_ltv,
    avg_subscription_months: record.avg_subscription_length_months,
  }
}
