import type { PricingPlan } from '../pricing-plans.types'

export type PlanFeature = {
  name: string
  description?: string | null
  included: boolean
}

export const YEARLY_DISCOUNT = 0.8

export function getPlanFeatures(plan: PricingPlan): PlanFeature[] {
  if (!plan.features || !Array.isArray(plan.features)) {
    return []
  }
  return plan.features.filter((feature): feature is PlanFeature => {
    return Boolean(feature && typeof feature === 'object' && 'name' in feature)
  })
}

export function getMonthlyRate(plan: PricingPlan): number {
  return plan.monthlyPrice ?? 0
}

export function getYearlyRate(plan: PricingPlan): number {
  return plan.yearlyPrice ?? 0
}
