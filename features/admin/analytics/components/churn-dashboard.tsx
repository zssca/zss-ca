import { Suspense } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getCurrentMonthChurn,
  getRecentChurnRate,
  getChurnPatterns,
} from '../api/queries'
import { ChurnRateChart } from './churn-rate-chart'
import { ChurnPatternsTable } from './churn-patterns-table'

/**
 * Churn Dashboard - Main Container
 * Displays churn rate, retention trends, and churn patterns
 */
export async function ChurnDashboard() {
  return (
    <div className="space-y-6">
      {/* Current Month Churn Alert */}
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <CurrentMonthAlert />
      </Suspense>

      {/* Churn Rate Trend Chart */}
      <Suspense fallback={<ChartSkeleton title="Churn Rate Trend" />}>
        <ChurnRateTrendSection />
      </Suspense>

      {/* Churn Patterns by Plan */}
      <Suspense fallback={<ChartSkeleton title="Churn Patterns by Plan" />}>
        <ChurnPatternsSection />
      </Suspense>
    </div>
  )
}

/**
 * Current Month Churn Alert
 * Shows alert if current month churn exceeds threshold
 */
async function CurrentMonthAlert() {
  const currentChurn = await getCurrentMonthChurn()

  if (!currentChurn) {
    return null
  }

  const CHURN_THRESHOLD = 5 // 5% threshold
  const isHighChurn = currentChurn.gross_churn_rate > CHURN_THRESHOLD

  if (!isHighChurn) {
    return (
      <Alert>
        <AlertTitle>Churn Rate: {currentChurn.gross_churn_rate.toFixed(1)}%</AlertTitle>
        <AlertDescription>
          Current month churn is within acceptable range (threshold: {CHURN_THRESHOLD}%)
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>High Churn Alert</AlertTitle>
      <AlertDescription>
        Current month churn rate is {currentChurn.gross_churn_rate.toFixed(1)}%,
        exceeding the {CHURN_THRESHOLD}% threshold. {currentChurn.churned} customers
        churned out of {currentChurn.active_start} active at period start.
      </AlertDescription>
    </Alert>
  )
}

/**
 * Churn Rate Trend Section
 */
async function ChurnRateTrendSection() {
  const data = await getRecentChurnRate()

  return (
    <Item>
      <ItemHeader>
        <ItemTitle>Churn Rate Trend</ItemTitle>
        <ItemDescription>
          Monthly churn and retention rates over the last 12 months
        </ItemDescription>
      </ItemHeader>
      <ItemContent>
        <ChurnRateChart data={data} />
      </ItemContent>
    </Item>
  )
}

/**
 * Churn Patterns Section
 */
async function ChurnPatternsSection() {
  const data = await getChurnPatterns(6)

  return (
    <Item>
      <ItemHeader>
        <ItemTitle>Churn Patterns by Plan</ItemTitle>
        <ItemDescription>
          Analyze churn patterns across different subscription plans
        </ItemDescription>
      </ItemHeader>
      <ItemContent>
        <ChurnPatternsTable data={data} />
      </ItemContent>
    </Item>
  )
}

/**
 * Loading Skeleton
 */
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
