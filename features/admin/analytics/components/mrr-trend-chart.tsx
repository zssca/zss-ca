'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { MRRGrowthRecord } from '../api/queries'

interface MRRTrendChartProps {
  data: MRRGrowthRecord[]
}

type MRRTrendDatum = {
  month: string
  mrr: number
  new: number
  churned: number
}

/**
 * MRR Trend Chart
 * Line chart showing monthly recurring revenue over time
 */
export function MRRTrendChart({ data }: MRRTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No revenue data available
      </div>
    )
  }

  // Format data for chart
  const chartData: MRRTrendDatum[] = data
    .map((record) => ({
      month: formatMonth(record.month),
      mrr: record.mrr,
      new: record.new_revenue,
      churned: Math.abs(record.churned_revenue),
    }))
    .reverse() // Show oldest to newest

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

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
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="mrr"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#mrrGradient)"
            name="MRR"
          />
        </AreaChart>
      </ResponsiveContainer>
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

  const data = firstEntry.payload as MRRTrendDatum

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="mb-2 font-semibold">{data.month}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">MRR:</span>
          <span className="font-medium">
            {formatCurrency(data.mrr)}
          </span>
        </div>
        {data.new > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-green-600 dark:text-green-400">New:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              +{formatCurrency(data.new)}
            </span>
          </div>
        )}
        {data.churned > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-red-600 dark:text-red-400">Churned:</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{formatCurrency(data.churned)}
            </span>
          </div>
        )}
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
