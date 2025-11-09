import Link from 'next/link'
import { BriefcaseBusiness } from 'lucide-react'
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
import { caseCtaData } from './case-cta.data'

export function CaseCta() {
  return (
    <SectionContainer aria-labelledby="case-cta-heading">
      <ItemGroup className="gap-8">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id="case-cta-heading" className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {caseCtaData.heading}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {caseCtaData.description}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <Empty className="border border-dashed border-primary/40 bg-primary/5">
            <EmptyHeader>
              <EmptyMedia variant="icon" aria-hidden="true">
                <BriefcaseBusiness className="size-6" aria-hidden="true" />
              </EmptyMedia>
              {caseCtaData.supporting ? (
                <EmptyDescription>{caseCtaData.supporting}</EmptyDescription>
              ) : null}
            </EmptyHeader>
            <EmptyContent>
              {caseCtaData.bullets ? (
                <ul className="text-left text-sm text-muted-foreground">
                  {caseCtaData.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <ButtonGroup aria-label={caseCtaData.ariaLabel}>
                <Button asChild>
                  <Link href={caseCtaData.primary.href}>{caseCtaData.primary.label}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={caseCtaData.secondary.href}>{caseCtaData.secondary.label}</Link>
                </Button>
              </ButtonGroup>
            </EmptyContent>
          </Empty>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
