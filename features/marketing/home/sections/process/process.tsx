import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { processData } from './process.data'

export function Process() {
  return (
    <SectionContainer
      heading={processData.heading}
      description={processData.subheading}
      textAlign="center"
      headerMaxWidth="3xl"
    >
      <ItemGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Engagement process">
        {processData.steps.map((step) => (
          <Item
            key={step.id}
            variant="outline"
            className="flex-col items-start gap-3 p-6"
            aria-labelledby={`process-step-${step.id}`}
          >
            <Badge variant="outline">{step.label}</Badge>
            <ItemContent className="gap-3">
              <ItemTitle id={`process-step-${step.id}`}>{step.title}</ItemTitle>
              <ItemDescription>{step.description}</ItemDescription>
              <div className="rounded-lg border border-dashed p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Timeline
                </p>
                <p className="text-sm font-medium text-foreground">{step.duration}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Output
                </p>
                <p className="text-sm text-foreground/90">{step.outcome}</p>
              </div>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </SectionContainer>
  )
}
