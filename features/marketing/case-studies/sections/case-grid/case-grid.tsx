import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { caseGridData } from './case-grid.data'

export function CaseGrid() {
  return (
    <SectionContainer aria-labelledby="case-grid-heading">
      <ItemGroup className="gap-8">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id="case-grid-heading" className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {caseGridData.heading}
              </span>
            </ItemTitle>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-4 md:grid-cols-2" aria-label="Case study grid">
            {caseGridData.cases.map((item) => (
              <Item
                key={item.id}
                variant="outline"
                className="flex h-full flex-col items-start gap-4 rounded-xl bg-background/60 p-6 text-left"
                aria-labelledby={`case-${item.id}-title`}
              >
                <div className="flex items-start gap-3">
                  {item.icon ? (
                    <>
                      <ItemMedia variant="icon" aria-hidden="true">
                        <item.icon className="size-5" aria-hidden="true" />
                      </ItemMedia>
                      <span className="sr-only">{item.iconLabel}</span>
                    </>
                  ) : null}
                  <ItemContent className="gap-2">
                    <ItemTitle id={`case-${item.id}-title`}>{item.name}</ItemTitle>
                    <Badge variant="outline" className="w-fit">
                      {item.industry}
                    </Badge>
                  </ItemContent>
                </div>
                <ItemDescription className="line-clamp-none text-sm text-muted-foreground">
                  {item.summary}
                </ItemDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  {item.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </Item>
            ))}
          </ItemGroup>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
