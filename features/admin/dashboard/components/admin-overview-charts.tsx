'use client'

import type { MonthlyGrowthData } from './growth-trend-chart'
import { GrowthTrendChart } from './growth-trend-chart'
import { SubscriptionDistributionChart } from './subscription-distribution-chart'
import { SiteStatusChart } from './site-status-chart'

interface AdminOverviewChartsProps {
  stats: {
    totalClients: number
    activeSubscriptions: number
    liveSites: number
    planDistribution: Record<string, number>
    statusDistribution: Record<string, number>
  }
  trendData: MonthlyGrowthData[]
}

export function AdminOverviewCharts({ stats, trendData }: AdminOverviewChartsProps): React.JSX.Element {
  return (
    <div className="space-y-4" role="list" aria-label="Dashboard analytics">
      <div role="listitem">
        <GrowthTrendChart
          trendData={trendData}
          className="h-full"
        />
      </div>
      <div role="listitem">
        <SubscriptionDistributionChart
          planDistribution={stats.planDistribution}
          className="h-full"
        />
      </div>
      <div role="listitem">
        <SiteStatusChart
          statusDistribution={stats.statusDistribution}
          className="h-full"
        />
      </div>
    </div>
  )
}
