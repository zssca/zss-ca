import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
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
import { supportData } from './support.data'

export function Support() {
  return (
    <SectionContainer
      heading={supportData.heading}
      description={supportData.subheading}
      textAlign="center"
      headerMaxWidth="3xl"
    >
      <ItemGroup className="grid gap-4 sm:grid-cols-2 md:grid-cols-3" aria-label="Support highlights">
        {supportData.highlights.map((highlight) => {
          const highlightId = `support-${highlight.id}`
          return (
            <Item
              key={highlight.id}
              variant="outline"
              className="flex-col items-start gap-4 p-6"
              aria-labelledby={highlightId}
            >
              <ItemHeader className="items-start gap-3">
                {highlight.icon ? (
                  <>
                    <ItemMedia variant="icon" aria-hidden="true">
                      <highlight.icon className="size-5" aria-hidden="true" />
                    </ItemMedia>
                    <span className="sr-only">{highlight.iconLabel}</span>
                  </>
                ) : null}
                <ItemContent className="gap-2">
                  {highlight.eyebrow ? <Badge variant="outline">{highlight.eyebrow}</Badge> : null}
                  <ItemTitle id={highlightId}>{highlight.title}</ItemTitle>
                  <ItemDescription>{highlight.description}</ItemDescription>
                  {highlight.helper ? (
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {highlight.helper}
                    </p>
                  ) : null}
                </ItemContent>
              </ItemHeader>
            </Item>
          )
        })}
      </ItemGroup>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link aria-label={supportData.cta.ariaLabel} href={supportData.cta.href}>
            {supportData.cta.label}
          </Link>
        </Button>
      </div>
    </SectionContainer>
  )
}
