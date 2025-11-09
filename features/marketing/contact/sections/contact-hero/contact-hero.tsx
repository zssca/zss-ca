import { SectionContainer } from '@/components/layout/shared'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { contactHeroData } from './contact-hero.data'

export function ContactHero() {
  const headingId = 'contact-hero-heading'

  return (
    <SectionContainer aria-labelledby={headingId}>
      <ItemGroup className="gap-8 text-center">
        <Item
          className="flex w-full flex-col items-center border-0 p-0 text-center"
          aria-labelledby={headingId}
        >
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id={headingId} className="justify-center">
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {contactHeroData.heading}
              </h1>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {contactHeroData.description}
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-4 sm:grid-cols-3" aria-label="Contact guarantees">
            {contactHeroData.bullets.map((bullet) => (
              <Item key={bullet.label} variant="outline" className="flex flex-col items-center gap-1 rounded-2xl border-dashed p-5 text-center">
                <ItemTitle className="text-sm font-semibold uppercase tracking-wide">
                  {bullet.label}
                </ItemTitle>
                <ItemDescription className="text-base text-foreground">
                  {bullet.helper}
                </ItemDescription>
              </Item>
            ))}
          </ItemGroup>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
