import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { resourcesHeroData } from './resources-hero.data'

export function ResourcesHero() {
  const headingId = 'resources-hero-heading'

  return (
    <SectionContainer aria-labelledby={headingId}>
      <ItemGroup className="gap-8 text-center">
        <Item
          className="flex w-full flex-col items-center border-0 p-0 text-center"
          aria-labelledby={headingId}
        >
          <ItemContent className="max-w-4xl items-center gap-3 text-center">
            <ItemTitle id={headingId} className="justify-center">
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {resourcesHeroData.heading}
              </h1>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {resourcesHeroData.description}
            </ItemDescription>
            <Button asChild size="lg">
              <Link href={resourcesHeroData.cta.href}>{resourcesHeroData.cta.label}</Link>
            </Button>
          </ItemContent>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
