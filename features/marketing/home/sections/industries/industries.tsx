import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { industriesData } from './industries.data'

export function Industries() {
  return (
    <SectionContainer
      heading={industriesData.heading}
      description={industriesData.subheading}
      textAlign="center"
      headerMaxWidth="3xl"
    >
      <ItemGroup className="grid gap-4 sm:grid-cols-2" aria-label="Industries served">
        {industriesData.industries.map((industry) => (
          <Item
            key={industry.id}
            variant="outline"
            className="flex-col items-start gap-4 p-6"
            aria-labelledby={`industry-${industry.id}-title`}
          >
            <ItemHeader className="items-start gap-3">
              <ItemMedia variant="icon" aria-hidden="true">
                <industry.icon className="size-5" aria-hidden="true" />
              </ItemMedia>
              <span className="sr-only">{industry.iconLabel}</span>
            </ItemHeader>
            <ItemContent className="gap-3">
              <ItemTitle id={`industry-${industry.id}-title`}>{industry.name}</ItemTitle>
              <ItemDescription>{industry.description}</ItemDescription>
              <Badge variant="outline">
                {industry.stat}
                <span className="ml-2 text-muted-foreground text-xs">{industry.statHelper}</span>
              </Badge>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </SectionContainer>
  )
}
