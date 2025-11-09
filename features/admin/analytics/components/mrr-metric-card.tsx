import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'
import { cn } from '@/lib/utils'

interface MRRMetricCardProps {
  title: string
  value: number
  trend: number
  format: 'currency' | 'number' | 'percentage'
  description?: string
}

/**
 * MRR Metric Card
 * Displays a single metric with trend indicator
 */
export function MRRMetricCard({
  title,
  value,
  trend,
  format,
  description,
}: MRRMetricCardProps) {
  const formattedValue = formatValue(value, format)
  const trendIndicator = getTrendIndicator(trend)

  return (
    <Item>
      <ItemHeader>
        <ItemTitle>{title}</ItemTitle>
        {description && <ItemDescription>{description}</ItemDescription>}
      </ItemHeader>
      <ItemContent>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold">{formattedValue}</div>
          {trend !== 0 && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                trendIndicator.color
              )}
              aria-label={`Trend: ${trend > 0 ? 'up' : 'down'} ${Math.abs(trend).toFixed(1)}%`}
            >
              {trendIndicator.icon}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </ItemContent>
    </Item>
  )
}

/**
 * Format value based on type
 */
function formatValue(value: number, format: MRRMetricCardProps['format']): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)

    case 'percentage':
      return `${value.toFixed(1)}%`

    case 'number':
      return new Intl.NumberFormat('en-CA').format(value)

    default:
      return value.toString()
  }
}

/**
 * Get trend indicator icon and color
 */
function getTrendIndicator(trend: number): {
  icon: React.ReactNode
  color: string
} {
  if (trend > 0) {
    return {
      icon: <ArrowUp className="h-4 w-4" aria-hidden="true" />,
      color: 'text-green-600 dark:text-green-400',
    }
  }

  if (trend < 0) {
    return {
      icon: <ArrowDown className="h-4 w-4" aria-hidden="true" />,
      color: 'text-red-600 dark:text-red-400',
    }
  }

  return {
    icon: <Minus className="h-4 w-4" aria-hidden="true" />,
    color: 'text-muted-foreground',
  }
}
