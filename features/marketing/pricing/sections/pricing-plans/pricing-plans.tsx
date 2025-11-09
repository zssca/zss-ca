'use client'

import { useState } from 'react'
import { SectionContainer } from '@/components/layout/shared'
import { Item, ItemGroup } from '@/components/ui/item'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader } from '@/components/ui/empty'
import { BillingIntervalToggle } from './billing-interval-toggle'
import { PricingPlanCard } from './pricing-plan-card'
import type { PricingPlansProps, BillingInterval } from './pricing-plans.types'

export function PricingPlans({ plans, isAuthenticated, hasSubscription }: PricingPlansProps) {
  const [interval, setInterval] = useState<BillingInterval>('monthly')

  if (plans.length === 0) {
    return (
      <SectionContainer aria-label="Pricing plans empty state">
        <Empty>
          <EmptyHeader>
            <EmptyDescription>No plans available right now.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            Reach out to our team and we will prepare a custom proposal for you.
          </EmptyContent>
        </Empty>
      </SectionContainer>
    )
  }

  return (
    <SectionContainer aria-label="Pricing plans">
      <ItemGroup className="gap-8">
        <Item className="border-0 p-0">
          <BillingIntervalToggle value={interval} onChange={setInterval} />
        </Item>
        <Item className="w-full flex-col">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {plans.map((plan, index) => {
              const isPopular = index === 1
              return (
                <PricingPlanCard
                  key={plan.id}
                  plan={plan}
                  isPopular={isPopular}
                  interval={interval}
                  isAuthenticated={isAuthenticated}
                  hasSubscription={hasSubscription}
                />
              )
            })}
          </div>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
