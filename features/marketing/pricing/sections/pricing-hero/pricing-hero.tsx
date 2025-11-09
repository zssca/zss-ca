import { SectionContainer } from '@/components/layout/shared'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { pricingHeroData } from './pricing-hero.data'

export function PricingHero() {
  const headingId = 'pricing-hero-heading'

  return (
    <SectionContainer aria-labelledby={headingId}>
      <ItemGroup className="gap-8 text-center">
        <Item
          className="flex w-full flex-col items-center border-0 p-0 text-center"
          aria-labelledby={headingId}
        >
          <ItemContent className="max-w-3xl items-center gap-4 text-center">
            <ItemTitle id={headingId} className="justify-center">
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {pricingHeroData.heading}
              </h1>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {pricingHeroData.description}
            </ItemDescription>
            <ItemGroup className="w-full gap-2 text-left" aria-label="Pricing guarantees">
              {pricingHeroData.bullets.map((bullet) => (
                <Item key={bullet} className="items-start border-0 p-0">
                  <ItemDescription className="text-sm text-muted-foreground">
                    {bullet}
                  </ItemDescription>
                </Item>
              ))}
            </ItemGroup>
          </ItemContent>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
