import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { caseFeaturedData } from './case-featured.data'

export function CaseFeatured() {
  return (
    <SectionContainer aria-labelledby="case-featured-heading">
      <ItemGroup className="gap-8">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id="case-featured-heading" className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {caseFeaturedData.client}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {caseFeaturedData.industry}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item
          variant="outline"
          className="flex flex-col gap-6 rounded-2xl border border-border/70 bg-background/60 p-6 lg:flex-row lg:items-stretch"
          aria-labelledby="case-featured-snapshot"
        >
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-col gap-4 lg:w-1/2">
              <ItemTitle id="case-featured-snapshot" className="text-base font-semibold">
                Project snapshot
              </ItemTitle>
              <ItemDescription className="line-clamp-none text-sm text-muted-foreground">
                {caseFeaturedData.summary}
              </ItemDescription>
              <ItemGroup className="flex flex-wrap gap-2" aria-label="Services provided">
                {caseFeaturedData.services.map((service) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </ItemGroup>
              <ItemGroup
                className="gap-3 sm:grid sm:grid-cols-3"
                aria-label="Project impact metrics"
              >
                {caseFeaturedData.metrics.map((metric) => (
                  <Item
                    key={metric.label}
                    variant="muted"
                    className="flex-col items-center gap-2 rounded-lg bg-muted/40 p-4 text-center"
                  >
                    <ItemTitle className="text-2xl font-semibold text-foreground">
                      {metric.value}
                    </ItemTitle>
                    <ItemContent className="items-center">
                      <Badge variant="outline">{metric.label}</Badge>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            </div>
            <div className="space-y-3 lg:w-1/2">
              <ItemTitle className="text-base font-semibold text-foreground">
                Client perspective
              </ItemTitle>
              <ItemDescription className="line-clamp-none italic text-muted-foreground">
                {caseFeaturedData.testimonial.quote}
              </ItemDescription>
              <p className="text-sm font-medium text-foreground">
                {caseFeaturedData.testimonial.author}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {caseFeaturedData.testimonial.role}
              </p>
            </div>
          </div>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
