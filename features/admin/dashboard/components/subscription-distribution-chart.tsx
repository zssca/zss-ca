'use client'

import * as React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Item,
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils/index'

interface SubscriptionDistributionChartProps {
  planDistribution: Record<string, number>
  className?: string
}

const chartConfig = {
  count: {
    label: 'Subscriptions',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function SubscriptionDistributionChart({
  planDistribution,
  className,
}: SubscriptionDistributionChartProps): React.JSX.Element {
  const planChartData = Object.entries(planDistribution).map(([name, count]) => ({ name, count }))

  const hasData = planChartData.length > 0

  return (
    <Item
      role="listitem"
      variant="outline"
      aria-label="Subscription distribution chart"
      className={cn('h-full flex flex-col', className)}
    >
      <ItemHeader className="flex-col items-start gap-1">
        <ItemTitle className="text-base font-semibold sm:text-lg">Subscription Distribution</ItemTitle>
        <ItemDescription>Breakdown of active subscriptions by plan</ItemDescription>
      </ItemHeader>
      <ItemContent className="mt-4 flex-1 px-0 pb-4 pr-2 sm:pr-4">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={planChartData}
              layout="vertical"
              margin={{ top: 12, right: 20, left: 24, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" width={110} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'var(--muted)' }} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[0, 4, 4, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <Empty className="flex h-[280px] flex-col items-center justify-center text-center">
            <EmptyHeader>
              <EmptyTitle>No subscription data</EmptyTitle>
              <EmptyDescription>No active subscriptions to visualise right now.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </ItemContent>
    </Item>
  )
}
