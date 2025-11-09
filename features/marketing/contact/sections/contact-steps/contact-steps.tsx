import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { contactStepsData } from './contact-steps.data'

export function ContactSteps() {
  const headingId = 'contact-steps-heading'

  return (
    <SectionContainer aria-labelledby={headingId}>
      <ItemGroup className="gap-8">
        <Item
          className="flex w-full flex-col items-center border-0 p-0 text-center"
          aria-labelledby={headingId}
        >
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id={headingId} className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {contactStepsData.heading}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              Here&apos;s how we turn your idea into a live website.
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup
            className="grid gap-6 md:grid-cols-3"
            aria-label="Engagement steps"
          >
            {contactStepsData.steps.map((step) => (
              <Item
                key={step.id}
                variant="outline"
                className="flex h-full flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-6"
                aria-labelledby={`contact-step-${step.id}`}
              >
                <Badge variant="outline">{step.label}</Badge>
                <ItemContent className="gap-2">
                  <ItemTitle id={`contact-step-${step.id}`}>{step.title}</ItemTitle>
                  <ItemDescription>{step.description}</ItemDescription>
                  {step.helper ? (
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {step.helper}
                    </p>
                  ) : null}
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
