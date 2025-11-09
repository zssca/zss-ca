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
import type { RevenueByPlan } from '../api/queries'

interface RevenueByPlanChartProps {
  data: RevenueByPlan[]
}

type RevenuePlanDatum = {
  name: string
  revenue: number
  count: number
  percentage: number
}

// Plan colors matching the application theme
const PLAN_COLORS: Record<string, string> = {
  starter: 'hsl(var(--chart-1))',
  professional: 'hsl(var(--chart-2))',
  enterprise: 'hsl(var(--chart-3))',
  premium: 'hsl(var(--chart-4))',
}

/**
 * Revenue by Plan Chart
 * Bar chart showing revenue distribution across plans
 */
export function RevenueByPlanChart({ data }: RevenueByPlanChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No plan revenue data available
      </div>
    )
  }

  // Format data for chart
  const chartData: RevenuePlanDatum[] = data
    .map((plan) => ({
      name: plan.plan_name,
      revenue: plan.monthly_revenue,
      count: plan.active_count,
      percentage: plan.percentage,
    }))
    .sort((a, b) => b.revenue - a.revenue)

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

          <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => {
              const planKey = entry.name.toLowerCase()
              const color =
                PLAN_COLORS[planKey] || 'hsl(var(--primary))'
              return <Cell key={`cell-${index}`} fill={color} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {chartData.map((plan, index) => {
          const planKey = plan.name.toLowerCase()
          const color = PLAN_COLORS[planKey] || 'hsl(var(--primary))'
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">
                {plan.name} ({plan.percentage.toFixed(1)}%)
              </span>
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

  const data = firstEntry.payload as RevenuePlanDatum

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="mb-2 font-semibold">{data.name}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Monthly Revenue:</span>
          <span className="font-medium">{formatCurrency(data.revenue)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Active Customers:</span>
          <span className="font-medium">{data.count}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Revenue Share:</span>
          <span className="font-medium">{data.percentage.toFixed(1)}%</span>
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
