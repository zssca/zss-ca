import type { Database as _Database } from '@/lib/types/database.types'
import type { PlanWithPrices } from '../../api'

export type PricingPlan = PlanWithPrices

export type BillingInterval = 'monthly' | 'yearly'

export interface PricingPlansProps {
  plans: PricingPlan[]
  isAuthenticated: boolean
  hasSubscription: boolean
}

export interface PricingPlansCopy {
  ctaAuthenticated: string
  ctaUnauthenticated: string
  popularLabel: string
}
