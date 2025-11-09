import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { metricsData } from './metrics.data'

export function Metrics() {
  return (
    <SectionContainer
      heading={metricsData.heading}
      description={metricsData.subheading}
      background="muted"
    >
      <ItemGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Impact metrics">
        {metricsData.metrics.map((metric) => (
          <Item
            key={metric.label}
            variant="outline"
            className="flex-col items-center gap-4 p-6 text-center"
          >
            <Badge variant="outline">{metric.label}</Badge>
            <ItemContent className="items-center gap-2">
              <ItemTitle className="text-4xl font-semibold tracking-tight">
                {metric.value}
              </ItemTitle>
              <ItemDescription className="text-sm text-muted-foreground">
                {metric.helper}
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </SectionContainer>
  )
}
