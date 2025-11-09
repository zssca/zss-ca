import 'server-only'

import { cache } from 'react'
import { createClient, requireAuth, requireAdminRole } from '@/lib/supabase'

export interface MonthlyGrowthData {
  month: string
  clients: number
  subscriptions: number
}

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
export const getGrowthTrend = cache(async (): Promise<MonthlyGrowthData[]> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  // Get the last 6 months of data
  const months = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    months.push({
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      startDate: date.toISOString(),
      endDate: nextDate.toISOString(),
    })
  }

  // Query historical data for each month
  const monthlyData = await Promise.all(
    months.map(async ({ label, endDate }) => {
      const [{ count: clients }, { count: subscriptions }] = await Promise.all([
        // Count clients created up to this month
        supabase
          .from('profile')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'client')
          .is('deleted_at', null)
          .lt('created_at', endDate),

        // Count subscriptions active up to this month
        supabase
          .from('subscription')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null)
          .lt('created_at', endDate)
          .or(`canceled_at.is.null,canceled_at.gte.${endDate}`),
      ])

      return {
        month: label,
        clients: clients ?? 0,
        subscriptions: subscriptions ?? 0,
      }
    })
  )

  return monthlyData
})
