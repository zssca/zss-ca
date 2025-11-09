import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { caseStudiesPreviewData } from './case-studies-preview.data'

export function CaseStudiesPreview() {
  return (
    <SectionContainer
      heading={caseStudiesPreviewData.heading}
      description={caseStudiesPreviewData.subheading}
      textAlign="center"
      headerMaxWidth="4xl"
    >
      <ItemGroup className="grid gap-4 md:grid-cols-3" aria-label="Case study highlights">
        {caseStudiesPreviewData.cases.map((study) => (
          <Item
            key={study.id}
            variant="outline"
            className="flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-background/60 p-6 text-left"
            aria-labelledby={`case-study-${study.id}`}
          >
            <Badge variant="outline" className="w-fit">
              {study.industry}
            </Badge>
            <ItemContent className="gap-3">
              <ItemTitle id={`case-study-${study.id}`} className="text-xl font-semibold">
                {study.client}
              </ItemTitle>
              <ItemDescription className="line-clamp-none text-sm text-muted-foreground">
                {study.summary}
              </ItemDescription>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold text-foreground">{study.metric.value}</span>
                <span className="text-sm text-muted-foreground">{study.metric.label}</span>
              </div>
              <ItemGroup className="flex-wrap gap-2" aria-label={`${study.client} services`}>
                {study.services.map((service) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </ItemGroup>
            </ItemContent>
            <ItemActions className="mt-auto pt-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={study.href} aria-label={`Read the ${study.client} case study`}>
                  Read story
                </Link>
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>

      <div className="flex justify-center">
        <Button asChild size="lg" variant="outline">
          <Link href={caseStudiesPreviewData.cta.href} aria-label={caseStudiesPreviewData.cta.ariaLabel}>
            {caseStudiesPreviewData.cta.label}
          </Link>
        </Button>
      </div>
    </SectionContainer>
  )
}
