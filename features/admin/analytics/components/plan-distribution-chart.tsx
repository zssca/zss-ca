'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface ChartData {
  name: string
  value: number
}

interface PlanDistributionChartProps {
  data: ChartData[]
}

export function PlanDistributionChart({ data }: PlanDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-muted-foreground">
        No subscription data available
      </div>
    )
  }

  return (
    <ChartContainer
      config={{
        value: {
          label: 'Subscriptions',
          color: 'var(--chart-1)',
        },
      }}
      className="min-h-[300px]"
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--chart-1)" />
      </BarChart>
    </ChartContainer>
  )
}