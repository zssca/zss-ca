'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ChurnMetrics } from '../api/queries'

interface ChurnRateChartProps {
  data: ChurnMetrics[]
}

type ChurnChartDatum = {
  month: string
  churnRate: number
  retentionRate: number
  churned: number
  activeStart: number
}

/**
 * Churn Rate Chart
 * Dual line chart showing churn rate and retention rate
 */
export function ChurnRateChart({ data }: ChurnRateChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No churn data available
      </div>
    )
  }

  // Format data for chart
  const chartData: ChurnChartDatum[] = data
    .map((record) => ({
      month: formatMonth(record.period),
      churnRate: record.gross_churn_rate,
      retentionRate: record.retention_rate,
      churned: record.churned,
      activeStart: record.active_start,
    }))
    .reverse() // Show oldest to newest

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="churnRate"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
              name="Churn Rate"
            />

            <Line
              type="monotone"
              dataKey="retentionRate"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              name="Retention Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Churn Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Retention Rate</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Avg Churn Rate</div>
          <div className="mt-1 text-2xl font-bold">
            {calculateAverage(chartData.map(d => d.churnRate)).toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Avg Retention</div>
          <div className="mt-1 text-2xl font-bold">
            {calculateAverage(chartData.map(d => d.retentionRate)).toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total Churned</div>
          <div className="mt-1 text-2xl font-bold">
            {chartData.reduce((sum, d) => sum + d.churned, 0)}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Custom tooltip for chart
 */
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null
  }

  const [firstEntry] = payload
  if (!firstEntry?.payload) {
    return null
  }

  const data = firstEntry.payload as ChurnChartDatum

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="mb-2 font-semibold">{data.month}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-destructive">Churn Rate:</span>
          <span className="font-medium text-destructive">
            {data.churnRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-primary">Retention Rate:</span>
          <span className="font-medium text-primary">
            {data.retentionRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Churned:</span>
          <span className="font-medium">{data.churned}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Active Start:</span>
          <span className="font-medium">{data.activeStart}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Format month string
 */
function formatMonth(monthStr: string): string {
  const date = new Date(monthStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

/**
 * Calculate average of array
 */
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}
