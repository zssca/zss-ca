'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { LTVByPlan } from '../api/queries'

interface LTVByPlanChartProps {
  data: LTVByPlan[]
}

type LTVChartDatum = {
  name: string
  avgLTV: number
  medianLTV: number
  customerCount: number
  avgMonths: number
}

// Plan colors matching the application theme
const PLAN_COLORS: Record<string, string> = {
  starter: 'hsl(var(--chart-1))',
  professional: 'hsl(var(--chart-2))',
  enterprise: 'hsl(var(--chart-3))',
  premium: 'hsl(var(--chart-4))',
}

/**
 * LTV by Plan Chart
 * Bar chart showing average customer lifetime value per plan
 */
export function LTVByPlanChart({ data }: LTVByPlanChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No LTV data available
      </div>
    )
  }

  // Format data for chart
  const chartData: LTVChartDatum[] = data
    .map((plan) => ({
      name: plan.plan_name,
      avgLTV: plan.avg_ltv,
      medianLTV: plan.median_ltv,
      customerCount: plan.customer_count,
      avgMonths: plan.avg_subscription_months,
    }))
    .sort((a, b) => b.avgLTV - a.avgLTV)

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            vertical={false}
          />

          <XAxis
            dataKey="name"
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

          <Bar dataKey="avgLTV" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => {
              const planKey = entry.name.toLowerCase()
              const color =
                PLAN_COLORS[planKey] || 'hsl(var(--primary))'
              return <Cell key={`cell-${index}`} fill={color} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-4 grid gap-2 text-sm">
        {chartData.map((plan, index) => {
          const planKey = plan.name.toLowerCase()
          const color = PLAN_COLORS[planKey] || 'hsl(var(--primary))'
          return (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex gap-4 text-muted-foreground">
                <span>
                  Avg: {formatCurrency(plan.avgLTV)}
                </span>
                <span>
                  {plan.customerCount} customers
                </span>
                <span>
                  {plan.avgMonths.toFixed(1)} months
                </span>
              </div>
            </div>
          )
        })}
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

  const data = firstEntry.payload as LTVChartDatum

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="mb-2 font-semibold">{data.name}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Avg LTV:</span>
          <span className="font-medium">{formatCurrency(data.avgLTV)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Median LTV:</span>
          <span className="font-medium">{formatCurrency(data.medianLTV)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Customers:</span>
          <span className="font-medium">{data.customerCount}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Avg Subscription:</span>
          <span className="font-medium">{data.avgMonths.toFixed(1)} months</span>
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
