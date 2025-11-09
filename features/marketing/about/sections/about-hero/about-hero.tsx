import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { aboutHeroData } from './about-hero.data'

export function AboutHero() {
  const headingId = 'about-hero-heading'

  return (
    <SectionContainer aria-labelledby={headingId}>
      <ItemGroup className="gap-8 text-center">
        <Item
          className="flex w-full flex-col items-center border-0 p-0 text-center"
          aria-labelledby={headingId}
        >
          <ItemContent className="max-w-3xl items-center gap-4 text-center">
            <Badge variant="outline">{aboutHeroData.tagline}</Badge>
            <ItemTitle id={headingId} className="justify-center">
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {aboutHeroData.heading}
              </h1>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {aboutHeroData.subheading}
            </ItemDescription>
            <ButtonGroup>
              <Button asChild size="lg">
                <Link href={aboutHeroData.cta.primary.href}>{aboutHeroData.cta.primary.label}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={aboutHeroData.cta.secondary.href}>{aboutHeroData.cta.secondary.label}</Link>
              </Button>
            </ButtonGroup>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-4 sm:grid-cols-3" aria-label="Team highlights">
            {aboutHeroData.highlights.map((highlight) => (
              <Item key={highlight.label} variant="outline" className="flex flex-col items-center gap-2 rounded-2xl border-dashed p-6 text-center">
                <ItemTitle className="text-3xl font-semibold">{highlight.value}</ItemTitle>
                <ItemDescription className="text-sm font-medium text-foreground">
                  {highlight.label}
                </ItemDescription>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {highlight.helper}
                </p>
              </Item>
            ))}
          </ItemGroup>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
