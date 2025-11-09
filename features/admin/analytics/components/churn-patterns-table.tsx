'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { ChurnPattern } from '../api/queries'

interface ChurnPatternsTableProps {
  data: ChurnPattern[]
}

/**
 * Churn Patterns Table
 * Displays churn analysis by plan
 */
export function ChurnPatternsTable({ data }: ChurnPatternsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No churn pattern data available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead className="text-right">Total Churned</TableHead>
            <TableHead className="text-right">Avg Lifetime</TableHead>
            <TableHead className="text-right">Trial Churn</TableHead>
            <TableHead className="text-right">Paid Churn</TableHead>
            <TableHead className="text-right">Avg Revenue Lost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((pattern) => (
            <TableRow key={pattern.plan_id}>
              <TableCell className="font-medium">
                {pattern.plan_name}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">{pattern.total_churned}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {pattern.avg_lifetime_days.toFixed(0)} days
              </TableCell>
              <TableCell className="text-right">
                <div className="space-y-1">
                  <div>{pattern.churned_in_trial}</div>
                  <div className="text-xs text-muted-foreground">
                    ({getPercentage(pattern.churned_in_trial, pattern.total_churned)}%)
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="space-y-1">
                  <div>{pattern.churned_after_trial}</div>
                  <div className="text-xs text-muted-foreground">
                    ({getPercentage(pattern.churned_after_trial, pattern.total_churned)}%)
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(pattern.avg_revenue_lost)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Key Insights */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-3 font-semibold">Key Insights</h4>
        <div className="space-y-2 text-sm">
          {getKeyInsights(data).map((insight, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Format currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Calculate percentage
 */
function getPercentage(part: number, total: number): string {
  if (total === 0) return '0'
  return ((part / total) * 100).toFixed(1)
}

/**
 * Generate key insights from churn data
 */
function getKeyInsights(data: ChurnPattern[]): string[] {
  const insights: string[] = []

  // Find plan with highest churn
  const highestChurn = data.reduce((max, p) =>
    p.total_churned > max.total_churned ? p : max
  )
  insights.push(
    `${highestChurn.plan_name} has the highest churn with ${highestChurn.total_churned} customers`
  )

  // Find plan with shortest lifetime
  const shortestLifetime = data.reduce((min, p) =>
    p.avg_lifetime_days < min.avg_lifetime_days ? p : min
  )
  insights.push(
    `${shortestLifetime.plan_name} has the shortest average lifetime at ${shortestLifetime.avg_lifetime_days.toFixed(0)} days`
  )

  // Find plan with highest trial churn rate
  const highestTrialChurn = data.reduce((max, p) => {
    const rate = p.churned_in_trial / p.total_churned
    const maxRate = max.churned_in_trial / max.total_churned
    return rate > maxRate ? p : max
  })
  const trialChurnRate = (highestTrialChurn.churned_in_trial / highestTrialChurn.total_churned) * 100
  insights.push(
    `${highestTrialChurn.plan_name} has ${trialChurnRate.toFixed(0)}% of churn during trial period`
  )

  // Calculate total revenue lost
  const totalRevenueLost = data.reduce((sum, p) => sum + p.avg_revenue_lost, 0)
  insights.push(
    `Total average revenue lost to churn: ${formatCurrency(totalRevenueLost)}`
  )

  return insights
}
