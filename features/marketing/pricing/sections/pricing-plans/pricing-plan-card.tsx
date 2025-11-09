'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Check, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { siteConfig } from '@/lib/config/site.config'
import { cn } from '@/lib/utils'
import { pricingPlansData } from './pricing-plans.data'
import { getPlanFeatures, getMonthlyRate, getYearlyRate, YEARLY_DISCOUNT } from './utils/pricing-plans'
import type { BillingInterval, PricingPlan } from './pricing-plans.types'

type CheckoutButtonProps = {
  planId: string
  planName: string
  billingInterval: BillingInterval
  isAuthenticated: boolean
  hasSubscription: boolean
  variant?: 'default' | 'outline'
}

const CheckoutButton = dynamic<CheckoutButtonProps>(
  () => import('@/features/admin/subscription').then((mod) => mod.CheckoutButton),
  { ssr: false },
)

type PricingPlanCardProps = {
  plan: PricingPlan
  isPopular: boolean
  interval: BillingInterval
  isAuthenticated: boolean
  hasSubscription: boolean
}

export function PricingPlanCard({
  plan,
  isPopular,
  interval,
  isAuthenticated,
  hasSubscription,
}: PricingPlanCardProps) {
  const features = getPlanFeatures(plan)
  const monthlyRate = getMonthlyRate(plan)
  const yearlyRate = getYearlyRate(plan)
  const yearlyTotal = yearlyRate > 0 ? yearlyRate : Math.round(monthlyRate * 12 * YEARLY_DISCOUNT * 100) / 100
  const displayRate = interval === 'yearly' && yearlyTotal > 0 ? yearlyTotal / 12 : monthlyRate
  const setupFee = typeof plan.setup_fee_cents === 'number' ? plan.setup_fee_cents / 100 : 0
  const contactEmail = siteConfig.contact.email

  return (
    <Item
      variant="outline"
      className={cn(
        'flex h-full flex-col gap-6 rounded-2xl border border-border/70 bg-background/80 p-6',
        isPopular && 'border-primary/60 ring-1 ring-primary/20',
      )}
      aria-labelledby={`pricing-plan-${plan.id}`}
    >
      <ItemHeader className="items-start gap-2">
        <ItemTitle id={`pricing-plan-${plan.id}`} className="text-xl font-semibold">
          {plan.name}
        </ItemTitle>
        {isPopular && <Badge>{pricingPlansData.popularLabel}</Badge>}
      </ItemHeader>
      <ItemContent className="gap-4">
        {plan.description ? (
          <ItemDescription className="text-sm text-muted-foreground">
            {plan.description}
          </ItemDescription>
        ) : null}
        <div className="space-y-1" aria-live="polite">
          {monthlyRate > 0 ? (
            <p className="flex items-baseline gap-1 text-3xl font-bold">
              ${displayRate.toFixed(2)}
              <span className="text-base font-medium text-muted-foreground">/mo</span>
            </p>
          ) : (
            <p className="text-2xl font-bold text-foreground">Contact for pricing</p>
          )}
          {interval === 'yearly' && monthlyRate > 0 ? (
            <p className="text-xs text-muted-foreground">
              ${yearlyTotal.toFixed(2)} billed annually (20% savings)
            </p>
          ) : null}
          {setupFee > 0 ? (
            <p className="text-xs text-muted-foreground">
              One-time setup fee of ${setupFee.toFixed(2)} waived for annual plans.
            </p>
          ) : null}
          {monthlyRate > 0 ? (
            <TooltipProvider>
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {plan.page_limit ? `${plan.page_limit} pages` : 'Unlimited pages'}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex"
                        aria-label="What counts as a page?"
                      >
                        <Info className="size-3 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">
                        Each unique URL path counts as one page. Blog posts, landing pages,
                        and service pages all count separately.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span aria-hidden="true">•</span>
                <span className="flex items-center gap-1">
                  {plan.revision_limit ? `${plan.revision_limit} revisions/mo` : 'Unlimited revisions'}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex"
                        aria-label="What are revisions?"
                      >
                        <Info className="size-3 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">
                        Revisions are changes to existing pages. Each request to update content,
                        images, or layout counts as one revision.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </span>
              </p>
            </TooltipProvider>
          ) : null}
        </div>
      </ItemContent>
      {features.length > 0 ? (
        <ItemGroup className="gap-2" aria-label={`${plan.name} features`}>
          {features
            .filter((feature) => feature.included)
            .map((feature) => (
              <Item key={feature.name} className="items-start gap-3 rounded-lg bg-muted/40 p-3">
                <ItemMedia variant="icon" aria-hidden="true">
                  <Check className="size-4 text-primary" aria-hidden="true" />
                </ItemMedia>
                <ItemContent className="gap-1">
                  <ItemTitle className="text-sm font-medium text-foreground">{feature.name}</ItemTitle>
                  {feature.description ? (
                    <ItemDescription className="line-clamp-none text-xs text-muted-foreground">
                      {feature.description}
                    </ItemDescription>
                  ) : null}
                </ItemContent>
              </Item>
            ))}
        </ItemGroup>
      ) : null}
      <ItemFooter className="mt-auto pt-2">
        <ItemActions className="w-full">
          {monthlyRate > 0 ? (
            <Suspense
              fallback={
                <Button disabled variant={isPopular ? 'default' : 'outline'} className="w-full">
                  Preparing checkout...
                </Button>
              }
            >
              <CheckoutButton
                planId={plan.id}
                planName={plan.name}
                billingInterval={interval}
                isAuthenticated={isAuthenticated}
                hasSubscription={hasSubscription}
                variant={isPopular ? 'default' : 'outline'}
              />
            </Suspense>
          ) : (
            <Button asChild variant={isPopular ? 'default' : 'outline'} className="w-full">
              <a className="block w-full" href={`mailto:${contactEmail}`}>
                Talk to sales
              </a>
            </Button>
          )}
        </ItemActions>
      </ItemFooter>
    </Item>
  )
}
