import Link from 'next/link'
import { Sparkles } from 'lucide-react'
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/components/ui/empty'
import { serviceCtaData } from './service-cta.data'

export function ServiceCta() {
  return (
    <SectionContainer aria-labelledby="services-cta-heading">
      <ItemGroup className="gap-8">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id="services-cta-heading" className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {serviceCtaData.heading}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {serviceCtaData.description}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <Empty className="border border-dashed border-primary/40 bg-primary/5">
            <EmptyHeader>
              <EmptyMedia variant="icon" aria-hidden="true">
                <Sparkles className="size-6" aria-hidden="true" />
              </EmptyMedia>
              {serviceCtaData.supporting ? (
                <EmptyDescription>{serviceCtaData.supporting}</EmptyDescription>
              ) : null}
            </EmptyHeader>
            <EmptyContent>
              {serviceCtaData.bullets ? (
                <ul className="text-left text-sm text-muted-foreground">
                  {serviceCtaData.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <ButtonGroup aria-label={serviceCtaData.ariaLabel}>
                <Button asChild>
                  <Link href={serviceCtaData.primary.href}>{serviceCtaData.primary.label}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={serviceCtaData.secondary.href}>{serviceCtaData.secondary.label}</Link>
                </Button>
              </ButtonGroup>
            </EmptyContent>
          </Empty>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
