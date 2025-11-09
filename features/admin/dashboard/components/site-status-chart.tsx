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

interface SiteStatusChartProps {
  statusDistribution: Record<string, number>
  className?: string
}

const chartConfig = {
  count: {
    label: 'Sites',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

export function SiteStatusChart({
  statusDistribution,
  className,
}: SiteStatusChartProps): React.JSX.Element {
  const statusChartData = Object.entries(statusDistribution).map(([name, count]) => ({ name, count }))

  const hasData = statusChartData.length > 0

  return (
    <Item
      role="listitem"
      variant="outline"
      aria-label="Site status distribution chart"
      className={cn('h-full flex flex-col', className)}
    >
      <ItemHeader className="flex-col items-start gap-1">
        <ItemTitle className="text-base font-semibold sm:text-lg">Site Status Distribution</ItemTitle>
        <ItemDescription>Current deployment status across the portfolio</ItemDescription>
      </ItemHeader>
      <ItemContent className="mt-4 flex-1 px-0 pb-4 pr-2 sm:pr-4">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={statusChartData}
              layout="vertical"
              margin={{ top: 12, right: 20, left: 24, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={false} />
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
              <EmptyTitle>No site data</EmptyTitle>
              <EmptyDescription>No site deployments to visualise right now.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </ItemContent>
    </Item>
  )
}
