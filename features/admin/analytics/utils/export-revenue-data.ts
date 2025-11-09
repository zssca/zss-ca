"use server"

import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/format'

const USD_CURRENCY: Intl.NumberFormatOptions = { currency: 'USD' }

// Type definitions for RPC function results
type MRRDataRow = {
  month: string
  mrr: number | null
  mom_growth_percentage: number | null
  customers: number | null
  new_mrr: number | null
  churned_mrr: number | null
}

type ChurnDataRow = {
  plan_name: string | null
  churned_count: number | null
  churn_within_trial: number | null
  churn_after_trial: number | null
  avg_lifetime_days: number | null
  avg_lifetime_revenue: number | null
  most_common_duration_range: string | null
}

type LTVDataRow = {
  plan_name: string | null
  customer_count: number | null
  avg_ltv: number | null
  median_ltv: number | null
  total_ltv: number | null
  avg_subscription_length_months: number | null
}

// ✅ CORRECT: Use database-generated types with joins
type SubscriptionHistoryWithJoins = {
  occurred_at: string
  event_type: string
  from_status: string | null
  to_status: string | null
  mrr_change: number | null
  arr_change: number | null
  prorated_amount: number | null
  reason: string | null
  changed_by: string | null
  profile: {
    contact_name: string | null
    contact_email: string | null
  } | null
  from_plan: {
    name: string | null
  } | null
  to_plan: {
    name: string | null
  } | null
}

export async function exportRevenueDataAsCSV(
  _startDate: Date,
  _endDate: Date
): Promise<string> {
  const supabase = await createClient()

  const { data: mrrData, error: mrrError } = await supabase.rpc(
    'calculate_mrr_growth',
    { p_months: 12 }
  )

  if (mrrError) {
    throw new Error('Failed to fetch MRR data')
  }

  const headers = [
    'Month',
    'MRR',
    'ARR',
    'MoM Growth %',
    'Customers',
    'New MRR',
    'Churned MRR',
  ]

  const rows = (mrrData || []).map((row: MRRDataRow) => [
    formatDate(row.month),
    formatCurrency(row.mrr ?? 0, USD_CURRENCY),
    formatCurrency((row.mrr ?? 0) * 12, USD_CURRENCY),
    row.mom_growth_percentage != null
      ? `${row.mom_growth_percentage.toFixed(1)}%`
      : 'N/A',
    row.customers ?? 0,
    formatCurrency(row.new_mrr ?? 0, USD_CURRENCY),
    formatCurrency(row.churned_mrr ?? 0, USD_CURRENCY),
  ])

  return toCsv(headers, rows)
}

export async function exportChurnDataAsCSV(
  startDate: Date,
  endDate: Date
): Promise<string> {
  const supabase = await createClient()
  const months = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
  )

  const { data: churnData, error } = await supabase.rpc(
    'analyze_churn_patterns',
    { p_months: months }
  )

  if (error) {
    throw new Error('Failed to fetch churn data')
  }

  const headers = [
    'Plan',
    'Total Churned',
    'Churn During Trial',
    'Churn After Trial',
    'Avg Lifetime (days)',
    'Avg Revenue Lost',
    'Common Duration',
  ]

  const rows = (churnData || []).map((row: ChurnDataRow) => [
    row.plan_name ?? 'Unknown',
    row.churned_count ?? 0,
    row.churn_within_trial ?? 0,
    row.churn_after_trial ?? 0,
    row.avg_lifetime_days?.toFixed(1) ?? 'N/A',
    formatCurrency(row.avg_lifetime_revenue ?? 0, USD_CURRENCY),
    row.most_common_duration_range ?? 'N/A',
  ])

  return toCsv(headers, rows)
}

export async function exportCustomerLTVAsCSV(): Promise<string> {
  const supabase = await createClient()

  const { data: ltvData, error } = await supabase.rpc('calculate_ltv_by_plan')

  if (error) {
    throw new Error('Failed to fetch LTV data')
  }

  const headers = [
    'Plan',
    'Customers',
    'Avg LTV',
    'Median LTV',
    'Total LTV',
    'Avg Subscription (months)',
  ]

  const rows = (ltvData || []).map((row: LTVDataRow) => [
    row.plan_name ?? 'Unknown',
    row.customer_count ?? 0,
    formatCurrency(row.avg_ltv ?? 0, USD_CURRENCY),
    formatCurrency(row.median_ltv ?? 0, USD_CURRENCY),
    formatCurrency(row.total_ltv ?? 0, USD_CURRENCY),
    row.avg_subscription_length_months?.toFixed(1) ?? 'N/A',
  ])

  return toCsv(headers, rows)
}

export async function exportSubscriptionHistoryAsCSV(
  startDate: Date,
  endDate: Date
): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscription_history')
    .select(
      `
      *,
      from_plan:plan!subscription_history_from_plan_id_fkey(name),
      to_plan:plan!subscription_history_to_plan_id_fkey(name),
      profile!subscription_history_profile_id_fkey(contact_name, contact_email)
    `
    )
    .gte('occurred_at', startDate.toISOString())
    .lte('occurred_at', endDate.toISOString())
    .order('occurred_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch subscription history')
  }

  const headers = [
    'Date',
    'Customer Name',
    'Customer Email',
    'Event Type',
    'From Plan',
    'To Plan',
    'From Status',
    'To Status',
    'MRR Change',
    'ARR Change',
    'Prorated Amount',
    'Reason',
    'Changed By',
  ]

  const rows = (data || []).map((row: SubscriptionHistoryWithJoins) => [
    formatDate(row.occurred_at),
    row.profile?.contact_name ?? 'N/A',
    row.profile?.contact_email ?? 'N/A',
    row.event_type,
    row.from_plan?.name ?? 'N/A',
    row.to_plan?.name ?? 'N/A',
    row.from_status ?? 'N/A',
    row.to_status ?? 'N/A',
    formatCurrency(row.mrr_change ?? 0, USD_CURRENCY),
    formatCurrency(row.arr_change ?? 0, USD_CURRENCY),
    formatCurrency(row.prorated_amount ?? 0, USD_CURRENCY),
    row.reason ?? 'N/A',
    row.changed_by ?? 'N/A',
  ])

  return toCsv(headers, rows)
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function toCsv(headers: string[], rows: Array<Array<string | number>>) {
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')
}
