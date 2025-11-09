import Link from 'next/link'
import { NotebookPen } from 'lucide-react'
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
import { resourcesCtaData } from './resources-cta.data'

export function ResourcesCta() {
  return (
    <SectionContainer aria-labelledby="resources-cta-heading">
      <ItemGroup className="gap-8">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id="resources-cta-heading" className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {resourcesCtaData.heading}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {resourcesCtaData.description}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <Empty className="border border-dashed border-primary/40 bg-primary/5">
            <EmptyHeader>
              <EmptyMedia variant="icon" aria-hidden="true">
                <NotebookPen className="size-6" aria-hidden="true" />
              </EmptyMedia>
              {resourcesCtaData.supporting ? (
                <EmptyDescription>{resourcesCtaData.supporting}</EmptyDescription>
              ) : null}
            </EmptyHeader>
            <EmptyContent>
              <ButtonGroup aria-label={resourcesCtaData.ariaLabel}>
                <Button asChild>
                  <Link href={resourcesCtaData.primary.href}>{resourcesCtaData.primary.label}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={resourcesCtaData.secondary.href}>{resourcesCtaData.secondary.label}</Link>
                </Button>
              </ButtonGroup>
            </EmptyContent>
          </Empty>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
