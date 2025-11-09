import { SectionContainer } from '@/components/layout/shared'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { caseHeroData } from './case-hero.data'

export function CaseHero() {
  const headingId = 'case-hero-heading'

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
                {caseHeroData.heading}
              </h1>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {caseHeroData.description}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-4 sm:grid-cols-3" aria-label="Case study highlights">
            {caseHeroData.highlights.map((highlight) => (
              <Item key={highlight.label} variant="outline" className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-background/80 p-5 text-center">
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
