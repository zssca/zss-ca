import { Suspense } from 'react'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getCurrentMRRMetrics,
  getMRRGrowth,
  getRevenueByPlan,
  getLTVByPlan,
} from '../api/queries'
import { MRRMetricCard } from './mrr-metric-card'
import { MRRTrendChart } from './mrr-trend-chart'
import { RevenueByPlanChart } from './revenue-by-plan-chart'
import { LTVByPlanChart } from './ltv-by-plan-chart'

/**
 * Revenue Dashboard - Main Container
 * Displays MRR, ARR, revenue trends, and plan breakdowns
 */
export async function RevenueDashboard() {
  return (
    <div className="space-y-6">
      {/* MRR/ARR Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<MetricCardSkeleton />}>
          <MRRMetrics />
        </Suspense>
      </div>

      {/* MRR Trend Chart */}
      <Suspense fallback={<ChartSkeleton title="MRR Growth Trend" />}>
        <MRRTrendSection />
      </Suspense>

      {/* Revenue and LTV by Plan */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<ChartSkeleton title="Revenue by Plan" />}>
          <RevenueByPlanSection />
        </Suspense>

        <Suspense fallback={<ChartSkeleton title="LTV by Plan" />}>
          <LTVByPlanSection />
        </Suspense>
      </div>
    </div>
  )
}

/**
 * MRR Metrics Cards
 */
async function MRRMetrics() {
  const metrics = await getCurrentMRRMetrics()
  const growth = await getMRRGrowth(2) // Get last 2 months for trend

  if (!metrics) {
    return (
      <div className="col-span-4 text-center text-muted-foreground">
        No revenue data available
      </div>
    )
  }

  // Calculate month-over-month growth
  const currentMonth = growth[0]
  const previousMonth = growth[1]
  const mrrGrowth = currentMonth && previousMonth
    ? ((currentMonth.mrr - previousMonth.mrr) / previousMonth.mrr) * 100
    : 0

  return (
    <>
      <MRRMetricCard
        title="Monthly Recurring Revenue"
        value={metrics.current_mrr}
        trend={mrrGrowth}
        format="currency"
        description="Active subscription revenue"
      />
      <MRRMetricCard
        title="Annual Recurring Revenue"
        value={metrics.current_arr}
        trend={mrrGrowth}
        format="currency"
        description="Annualized revenue projection"
      />
      <MRRMetricCard
        title="Active Customers"
        value={metrics.active_customers}
        trend={0}
        format="number"
        description="Paying subscribers"
      />
      <MRRMetricCard
        title="ARPU"
        value={metrics.arpu}
        trend={0}
        format="currency"
        description="Average revenue per user"
      />
    </>
  )
}

/**
 * MRR Trend Chart Section
 */
async function MRRTrendSection() {
  const data = await getMRRGrowth(12)

  return (
    <Item>
      <ItemHeader>
        <ItemTitle>MRR Growth Trend</ItemTitle>
        <ItemDescription>
          Monthly recurring revenue over the last 12 months
        </ItemDescription>
      </ItemHeader>
      <ItemContent>
        <MRRTrendChart data={data} />
      </ItemContent>
    </Item>
  )
}

/**
 * Revenue by Plan Section
 */
async function RevenueByPlanSection() {
  const data = await getRevenueByPlan()

  return (
    <Item>
      <ItemHeader>
        <ItemTitle>Revenue by Plan</ItemTitle>
        <ItemDescription>
          Active subscription revenue breakdown
        </ItemDescription>
      </ItemHeader>
      <ItemContent>
        <RevenueByPlanChart data={data} />
      </ItemContent>
    </Item>
  )
}

/**
 * LTV by Plan Section
 */
async function LTVByPlanSection() {
  const data = await getLTVByPlan()

  return (
    <Item>
      <ItemHeader>
        <ItemTitle>Customer LTV by Plan</ItemTitle>
        <ItemDescription>
          Average lifetime value per plan
        </ItemDescription>
      </ItemHeader>
      <ItemContent>
        <LTVByPlanChart data={data} />
      </ItemContent>
    </Item>
  )
}

/**
 * Loading Skeletons
 */
function MetricCardSkeleton() {
  return (
    <Item>
      <ItemContent className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3 w-40" />
      </ItemContent>
    </Item>
  )
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Item>
      <ItemHeader>
        <ItemTitle>{title}</ItemTitle>
      </ItemHeader>
      <ItemContent>
        <Skeleton className="h-[300px] w-full" />
      </ItemContent>
    </Item>
  )
}
