import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { contactLocationIcon, contactOverviewData } from './contact-overview.data'

export function ContactOverview() {
  const LocationIcon = contactLocationIcon
  const headingId = 'contact-overview-heading'

  return (
    <SectionContainer aria-labelledby={headingId}>
      <ItemGroup className="gap-10">
        <Item
          className="flex w-full flex-col items-center border-0 p-0 text-center"
          aria-labelledby={headingId}
        >
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id={headingId} className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {contactOverviewData.heading}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {contactOverviewData.subheading}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-6 md:grid-cols-2" aria-label="Contact options">
            <Item
              variant="outline"
              className="flex h-full flex-col gap-6 rounded-2xl border border-border/70 bg-background/80 p-6"
              aria-labelledby="contact-overview-team"
            >
              <ItemContent className="gap-2">
                <ItemTitle id="contact-overview-team" className="text-lg font-semibold">
                  Talk with our team
                </ItemTitle>
                <ItemDescription className="text-base text-muted-foreground">
                  Reach out and we&apos;ll respond within one business day.
                </ItemDescription>
              </ItemContent>

              <ItemGroup className="gap-3">
                {contactOverviewData.channels.map((channel) => (
                  <Item
                    key={channel.label}
                    variant="muted"
                    className="items-start gap-3 rounded-lg border border-border/40 bg-muted/40 p-3"
                    aria-label={channel.label}
                  >
                    <ItemMedia variant="icon" aria-hidden="true">
                      <channel.icon className="size-4" aria-hidden="true" />
                    </ItemMedia>
                    <ItemContent className="gap-1">
                      <ItemTitle className="text-sm font-medium text-foreground">
                        {channel.label}
                      </ItemTitle>
                      <ItemDescription className="line-clamp-none text-sm text-muted-foreground">
                        <a href={channel.href}>{channel.value}</a>
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>

              <Button asChild className="w-full">
                <Link
                  aria-label={contactOverviewData.cta.ariaLabel}
                  href={contactOverviewData.cta.href}
                >
                  {contactOverviewData.cta.label}
                </Link>
              </Button>
            </Item>

            <Item
              variant="outline"
              className="flex h-full flex-col gap-6 rounded-2xl border border-border/70 bg-background/80 p-6"
              aria-labelledby="contact-overview-office"
            >
              <ItemContent className="gap-2">
                <ItemTitle id="contact-overview-office" className="text-lg font-semibold">
                  Visit our studio
                </ItemTitle>
                <ItemDescription className="text-sm text-muted-foreground">
                  {contactOverviewData.office.hours}
                </ItemDescription>
              </ItemContent>

              <Item
                variant="muted"
                className="items-start gap-3 rounded-lg border border-border/40 bg-muted/40 p-3 text-left"
                aria-label="Office location"
              >
                <ItemMedia variant="icon" aria-hidden="true">
                  <LocationIcon className="size-4" aria-hidden="true" />
                </ItemMedia>
                <ItemContent className="gap-1 text-sm text-foreground">
                  {contactOverviewData.office.addressLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </ItemContent>
              </Item>
              {contactOverviewData.office.note ? (
                <p className="text-xs text-muted-foreground">{contactOverviewData.office.note}</p>
              ) : null}
            </Item>
          </ItemGroup>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
