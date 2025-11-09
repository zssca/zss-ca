import type { PlanRow, SubscriptionRow } from '../database-aliases'

/**
 * Business domain types for plans and subscriptions.
 * Database aliases live in ../database-aliases.
 */

/**
 * Structured feature definition for plans.
 */
export interface PlanFeature {
  name: string
  description?: string | null
  included: boolean
  value?: string | number | null
  tooltip?: string | null
}

/**
 * Domain Plan extends the database row with structured features.
 * Note: price_monthly_cents and price_yearly_cents already exist in PlanRow
 */
export interface Plan extends Omit<PlanRow, 'features'> {
  features: PlanFeature[]
}

export interface PlanWithPricing extends Plan {
  monthlyPrice: number
  yearlyPrice: number
  yearlySavings: number
  yearlySavingsPercent: number
}

export interface SubscriptionWithPlan extends SubscriptionRow {
  plan: Plan
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  isActive: boolean
}

export type BillingInterval = 'monthly' | 'yearly'

export interface PlanLimits {
  pageLimit: number | null
  revisionLimit: number | null
  supportResponseTime: string
  customIntegrations: boolean
  ecommerceProducts: number | null
  multiLanguage: boolean
  dedicatedManager: boolean
  slaUptime?: number
}

export function getPlanLimits(plan: Plan): PlanLimits {
  const features = plan.features || []

  const findFeature = (name: string): PlanFeature | undefined =>
    features.find(feature =>
      feature.name.toLowerCase().includes(name.toLowerCase())
    )

  return {
    pageLimit: plan.page_limit,
    revisionLimit: plan.revision_limit,
    supportResponseTime:
      (findFeature('response time')?.value as string) || '48 hours',
    customIntegrations: findFeature('custom integration')?.included ?? false,
    ecommerceProducts:
      (findFeature('e-commerce')?.value as number) ?? null,
    multiLanguage: findFeature('multi-language')?.included ?? false,
    dedicatedManager: findFeature('dedicated manager')?.included ?? false,
    slaUptime: findFeature('uptime')?.value as number | undefined,
  }
}

export function hasFeature(plan: Plan, featureName: string): boolean {
  const feature = plan.features?.find(
    f => f.name.toLowerCase() === featureName.toLowerCase()
  )
  return feature?.included ?? false
}

export function formatPrice(
  cents: number,
  currency: string = 'CAD'
): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(dollars)
}

export function getMonthlyRate(yearlyPriceCents: number): number {
  return Math.round(yearlyPriceCents / 12)
}

export function calculateSavings(
  monthlyPriceCents: number,
  yearlyPriceCents: number
): { amount: number; percent: number } {
  const yearlyFromMonthly = monthlyPriceCents * 12
  const amount = yearlyFromMonthly - yearlyPriceCents
  const percent = Math.round((amount / yearlyFromMonthly) * 100)

  return { amount, percent }
}
