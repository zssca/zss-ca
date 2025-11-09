import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { partnersData } from './partners.data'

export function Partners() {
  return (
    <SectionContainer
      badge={partnersData.eyebrow}
      heading={partnersData.heading}
      description={partnersData.subheading}
      textAlign="left"
      headerMaxWidth="5xl"
      background="muted"
      padding="lg"
      rounded
      separator="bottom"
    >
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Representative client segments
          </p>
          <ItemGroup className="grid gap-4 md:grid-cols-2" aria-label="Representative client segments">
            {partnersData.companies.map((company) => (
              <Item
                key={company.id}
                variant="outline"
                className="flex h-full flex-col gap-5 rounded-2xl border border-border/60 bg-background/80 p-6 text-left shadow-sm"
                aria-labelledby={`partner-${company.id}`}
              >
                <div className="flex flex-col gap-3">
                  <Badge variant="outline" className="w-fit">
                    {company.industry}
                  </Badge>
                  <ItemTitle id={`partner-${company.id}`} className="text-xl font-semibold">
                    {company.name}
                  </ItemTitle>
                  <ItemDescription className="line-clamp-none text-sm text-muted-foreground">
                    {company.detail}
                  </ItemDescription>
                </div>
                <ItemActions className="mt-auto flex flex-col gap-1 text-left">
                  <p className="text-sm font-semibold text-foreground">{company.impact}</p>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Result</span>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Delivery metrics</p>
            <p className="text-sm text-muted-foreground">
              Proof points from the retainers we currently run across regulated industries, retail networks, and high-growth SaaS teams.
            </p>
          </div>
          <ItemGroup className="flex flex-col gap-4" aria-label="Partnership performance metrics">
            {partnersData.highlights.map((highlight) => (
              <Item
                key={highlight.id}
                variant="muted"
                className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-background p-5 text-left"
              >
                <ItemTitle className="text-3xl font-semibold text-foreground">{highlight.value}</ItemTitle>
                <ItemDescription className="line-clamp-none text-sm font-medium text-foreground">
                  {highlight.label}
                </ItemDescription>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{highlight.helper}</p>
              </Item>
            ))}
          </ItemGroup>
          <div className="rounded-2xl border border-border/70 bg-background/90 p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {partnersData.cta.description ?? 'Review the engagement model, onboarding plan, and weekly reporting cadence.'}
            </p>
            <div className="mt-4">
              <Button asChild size="lg" variant="outline" className="w-full justify-center">
                <Link href={partnersData.cta.href} aria-label={partnersData.cta.ariaLabel}>
                  {partnersData.cta.label}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
