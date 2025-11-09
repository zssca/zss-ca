import Link from 'next/link'
import { Check } from 'lucide-react'
import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/lib/constants/routes'
import { siteConfig } from '@/lib/config/site.config'
import { getPlansForPreview } from '@/features/marketing/pricing/api/queries'
import { pricingPreviewData } from './pricing-preview.data'

type PlanFeature = {
  name: string
  description: string
  included: boolean
}

export async function PricingPreview() {
  const plans = await getPlansForPreview()

  if (plans.length === 0) {
    return null
  }

  return (
    <SectionContainer
      badge={pricingPreviewData.pill}
      heading={pricingPreviewData.heading}
      description={pricingPreviewData.subheading}
    >
      <ItemGroup className="grid grid-cols-1 gap-6 md:grid-cols-3" aria-label="Plan preview">
            {plans.map((plan, index) => {
              const features = Array.isArray(plan.features)
                ? (plan.features as PlanFeature[])
                : []
              const isPopular = index === 1

              return (
                <Item
                  key={plan.id}
                  variant="outline"
                  className="h-full flex-col gap-6 rounded-2xl border border-border/70 bg-background/80 p-6"
                  aria-labelledby={`pricing-preview-${plan.id}`}
                >
                  <ItemHeader className="items-center justify-between gap-2">
                    <ItemTitle id={`pricing-preview-${plan.id}`}>{plan.name}</ItemTitle>
                    {isPopular && <Badge variant="default">Popular</Badge>}
                  </ItemHeader>
                  <ItemContent className="gap-4">
                    <ItemDescription className="text-muted-foreground">
                      {plan.description}
                    </ItemDescription>
                    <div className="space-y-2" aria-live="polite">
                      {plan.priceMonthly ? (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                          {plan.priceYearly && (
                            <p className="text-sm text-muted-foreground">
                              or ${plan.priceYearly}/year
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-2xl font-bold">Contact for pricing</div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {plan.page_limit ? `${plan.page_limit} pages` : 'Unlimited pages'}
                        {plan.revision_limit ? ` • ${plan.revision_limit} revisions/mo` : ''}
                      </p>
                    </div>
                    <Separator />
                    <ItemGroup className="gap-2">
                      {features
                        .filter((feature) => feature.included)
                        .slice(0, 5)
                        .map((feature) => (
                          <Item key={feature.name} className="items-start gap-3 p-3">
                            <ItemMedia variant="icon" aria-hidden="true">
                              <Check className="size-4 text-primary" aria-hidden="true" />
                            </ItemMedia>
                            <ItemContent className="gap-1">
                              <ItemTitle className="text-sm font-medium text-foreground">
                                {feature.name}
                              </ItemTitle>
                              {feature.description ? (
                                <ItemDescription className="line-clamp-none text-xs text-muted-foreground">
                                  {feature.description}
                                </ItemDescription>
                              ) : null}
                            </ItemContent>
                          </Item>
                        ))}
                    </ItemGroup>
                  </ItemContent>
                  <ItemFooter>
                    <ItemActions className="w-full">
                      <Button asChild variant={isPopular ? 'default' : 'outline'} className="w-full">
                        <Link className="block w-full" href={ROUTES.PRICING}>
                          Get Started
                        </Link>
                      </Button>
                    </ItemActions>
                  </ItemFooter>
                </Item>
              )
            })}
      </ItemGroup>

      <ItemGroup className="grid gap-4 md:grid-cols-3" aria-label="What every plan includes">
            {pricingPreviewData.guarantees.map((guarantee) => (
              <Item
                key={guarantee.id}
                variant="outline"
                className="flex h-full flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-6 text-left"
              >
                <ItemTitle className="text-lg font-semibold">{guarantee.title}</ItemTitle>
                <ItemDescription className="text-sm text-muted-foreground">
                  {guarantee.description}
                </ItemDescription>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {guarantee.helper}
                </p>
              </Item>
            ))}
      </ItemGroup>

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href={pricingPreviewData.cta.href}>{pricingPreviewData.cta.label}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={pricingPreviewData.cta.secondaryHref}>
              {pricingPreviewData.cta.secondaryLabel}
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Need enterprise scope? Email{' '}
          <a className="underline" href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>{' '}
          for a custom SLA.
        </p>
      </div>
    </SectionContainer>
  )
}
