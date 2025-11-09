import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { serviceProcessData } from './service-process.data'

export function ServiceProcess() {
  return (
    <SectionContainer aria-labelledby="service-process-heading">
      <ItemGroup className="gap-8">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id="service-process-heading" className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {serviceProcessData.heading}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {serviceProcessData.subheading}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-4 md:grid-cols-3" aria-label="Project phases">
            {serviceProcessData.phases.map((phase) => (
              <Item
                key={phase.id}
                variant="outline"
                className="flex h-full flex-col items-start gap-3 rounded-xl bg-background/60 p-6 text-left"
                aria-labelledby={`service-phase-${phase.id}`}
              >
                <Badge variant="outline">{phase.label}</Badge>
                <ItemContent className="gap-2 pt-1">
                  <ItemTitle id={`service-phase-${phase.id}`}>{phase.title}</ItemTitle>
                  <ItemDescription className="line-clamp-none">
                    {phase.description}
                  </ItemDescription>
                  <ItemGroup className="gap-1" aria-label={`${phase.title} deliverables`}>
                    {phase.deliverables.map((deliverable) => (
                      <Item key={deliverable} className="w-full items-start gap-2 border-0 bg-transparent p-0">
                        <Badge variant="secondary">{deliverable}</Badge>
                      </Item>
                    ))}
                  </ItemGroup>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
