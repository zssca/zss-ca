import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { serviceHeroData } from './service-hero.data'

export function ServiceHero() {
  const headingId = 'services-hero-heading'

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
                {serviceHeroData.heading}
              </h1>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {serviceHeroData.description}
            </ItemDescription>
            <ButtonGroup>
              <Button asChild size="lg">
                <Link href={serviceHeroData.cta.primary.href}>{serviceHeroData.cta.primary.label}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={serviceHeroData.cta.secondary.href}>{serviceHeroData.cta.secondary.label}</Link>
              </Button>
            </ButtonGroup>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-4 md:grid-cols-3" aria-label="Service promises">
            {serviceHeroData.bullets.map((bullet) => (
              <Item key={bullet.title} variant="outline" className="flex h-full flex-col gap-2 rounded-2xl border-dashed p-5 text-left">
                <ItemTitle className="text-base font-semibold">{bullet.title}</ItemTitle>
                <ItemDescription className="text-sm text-muted-foreground">
                  {bullet.description}
                </ItemDescription>
              </Item>
            ))}
          </ItemGroup>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
