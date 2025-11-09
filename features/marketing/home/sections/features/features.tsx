import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ROUTES } from '@/lib/constants/routes'
import { featuresData } from './features.data'

export function Features() {
  return (
    <SectionContainer
      badge="What every plan includes"
      heading={featuresData.heading}
      description={featuresData.subheading}
    >
      <ItemGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Platform features">
        {featuresData.features.map((feature) => (
          <Item
            key={feature.id}
            variant="outline"
            className="flex-col items-start gap-4 p-6"
            aria-labelledby={`feature-${feature.id}-title`}
          >
            <ItemHeader className="items-start gap-3">
              <ItemMedia variant="icon" aria-hidden="true">
                <span aria-hidden role="img" className="text-lg">
                  {feature.icon}
                </span>
              </ItemMedia>
              <span className="sr-only">{feature.iconLabel}</span>
            </ItemHeader>
            <ItemContent className="gap-2">
              <ItemTitle id={`feature-${feature.id}-title`}>{feature.title}</ItemTitle>
              <ItemDescription>{feature.description}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>

      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-base text-muted-foreground">
          Need a deeper breakdown of what lands in each sprint? Explore our services or read the latest case studies.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href={ROUTES.SERVICES}>Explore services</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={ROUTES.CASE_STUDIES}>View case studies</Link>
          </Button>
        </div>
      </div>
    </SectionContainer>
  )
}
