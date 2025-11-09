import { SectionContainer } from '@/components/layout/shared'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { serviceOfferingsData } from './service-offerings.data'

export function ServiceOfferings() {
  return (
    <SectionContainer aria-labelledby="service-offerings-heading">
      <ItemGroup className="gap-8">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id="service-offerings-heading" className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {serviceOfferingsData.heading}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              We own the full lifecycle so you have one partner for everything web.
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-4 md:grid-cols-3" aria-label="Service offerings">
            {serviceOfferingsData.cards.map((card) => (
              <Item
                key={card.id}
                variant="outline"
                className="flex h-full flex-col gap-4 rounded-xl bg-background/60 p-6 text-left"
                aria-labelledby={`service-offering-${card.id}`}
              >
                <ItemHeader className="items-start gap-3">
                  {card.icon ? (
                    <>
                      <ItemMedia variant="icon" aria-hidden="true">
                        <card.icon className="size-5" aria-hidden="true" />
                      </ItemMedia>
                      <span className="sr-only">{card.iconLabel}</span>
                    </>
                  ) : null}
                  <ItemTitle id={`service-offering-${card.id}`}>{card.title}</ItemTitle>
                </ItemHeader>
                <ItemContent className="gap-3">
                  <ItemDescription className="line-clamp-none text-sm text-muted-foreground">
                    {card.summary}
                  </ItemDescription>
                  <ItemGroup className="gap-2" aria-label={`${card.title} inclusions`}>
                    {card.features.map((feature) => (
                      <Item
                        key={feature.title}
                        variant="muted"
                        className="items-start gap-3 rounded-lg border border-border/50 bg-muted/40 p-3"
                      >
                        <ItemContent className="gap-1">
                          <ItemTitle className="text-sm font-semibold text-foreground">
                            {feature.title}
                          </ItemTitle>
                          <ItemDescription className="line-clamp-none text-sm text-muted-foreground">
                            {feature.description}
                          </ItemDescription>
                        </ItemContent>
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
