'use client'

import * as React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils/index'

export interface MonthlyGrowthData {
  month: string
  clients: number
  subscriptions: number
}

interface GrowthTrendChartProps {
  trendData: MonthlyGrowthData[]
  className?: string
}

const chartConfig = {
  clients: {
    label: 'Clients',
    color: 'var(--chart-1)',
  },
  subscriptions: {
    label: 'Subscriptions',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function GrowthTrendChart({
  trendData,
  className,
}: GrowthTrendChartProps): React.JSX.Element {

  const [activeMetric, setActiveMetric] = React.useState<keyof typeof chartConfig>('clients')

  const totals = {
    clients: trendData.reduce((sum, entry) => sum + entry.clients, 0),
    subscriptions: trendData.reduce((sum, entry) => sum + entry.subscriptions, 0),
  }

  return (
    <Item
      role="listitem"
      variant="outline"
      aria-label="Growth trends chart"
      className={cn('h-full flex flex-col', className)}
    >
      <ItemHeader className="flex-col items-stretch gap-0 border-b pb-0">
        <div className="flex flex-1 flex-col justify-center gap-1 pb-3 pt-4 sm:pt-3">
          <ItemTitle className="text-base font-semibold sm:text-lg">Growth Trend</ItemTitle>
          <ItemDescription>Totals across the last six months</ItemDescription>
        </div>
        <ItemActions className="relative -mx-4 mt-2 flex w-[calc(100%+2rem)] gap-0 border-t sm:-mx-6 sm:w-[calc(100%+3rem)] sm:border-t-0">
          {(['clients', 'subscriptions'] as const).map((key) => (
            <button
              key={key}
              type="button"
              data-active={activeMetric === key}
              className="data-[active=true]:bg-muted/60 flex flex-1 flex-col justify-center gap-1 border-r px-4 py-3 text-left text-muted-foreground transition last:border-r-0 sm:px-6 sm:py-4"
              onClick={() => setActiveMetric(key)}
            >
              <span className="text-xs">{chartConfig[key].label}</span>
              <span className="text-lg font-semibold leading-none text-foreground sm:text-2xl">
                {totals[key].toLocaleString()}
              </span>
            </button>
          ))}
        </ItemActions>
      </ItemHeader>
      <ItemContent className="mt-4 flex-1 px-0 pb-4 pr-2 sm:px-0 sm:pb-6 sm:pr-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={trendData}
            margin={{ top: 12, right: 12, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Bar
              dataKey={activeMetric}
              fill={`var(--color-${activeMetric})`}
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ChartContainer>
      </ItemContent>
    </Item>
  )
}
