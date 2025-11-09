import 'server-only'

import { cache } from 'react'
import { stripe } from '@/lib/stripe/server'
import type { Database } from '@/lib/types/database.types'

type Plan = Database['public']['Tables']['plan']['Row'] & {
  price_monthly_cents?: number | null
  price_yearly_cents?: number | null
}

export interface PlanWithPrices extends Plan {
  monthlyPrice?: number // Price in dollars
  yearlyPrice?: number // Price in dollars
  monthlyPriceId?: string | null
  yearlyPriceId?: string | null
}

/**
 * Sync prices from Stripe to database (called by webhook or manual sync)
 * This function updates the database with the latest prices from Stripe
 */
export const syncPricesFromStripe = async (productId: string) => {
  try {
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 10,
    })

    let monthlyPrice: number | null = null
    let yearlyPrice: number | null = null

    for (const price of prices.data) {
      if (price.recurring?.interval === 'month') {
        monthlyPrice = price.unit_amount || null
      } else if (price.recurring?.interval === 'year') {
        yearlyPrice = price.unit_amount || null
      }
    }

    // Use the Supabase function to update prices
    if (monthlyPrice !== null || yearlyPrice !== null) {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      await supabase.rpc('sync_stripe_prices', {
        p_product_id: productId,
        p_monthly_price: monthlyPrice ?? 0,
        p_yearly_price: yearlyPrice ?? 0,
      })
    }
  } catch (error) {
    console.error(`Failed to sync prices for product ${productId}:`, error)
  }
}

/**
 * Get plans with their prices (database-first approach)
 * Uses database prices primarily, only fetches from Stripe if missing
 */
export const getPlansWithPrices = cache(async (plans: Plan[]): Promise<PlanWithPrices[]> => {
  // Transform plans with database prices
  const plansWithPrices = plans.map((plan) => {
    // Use database prices if available (convert cents to dollars)
    const monthlyPrice =
      typeof plan.price_monthly_cents === 'number'
        ? plan.price_monthly_cents / 100
        : undefined
    const yearlyPrice =
      typeof plan.price_yearly_cents === 'number'
        ? plan.price_yearly_cents / 100
        : undefined

    return {
      ...plan,
      monthlyPrice,
      yearlyPrice,
      monthlyPriceId: plan.stripe_price_id_monthly,
      yearlyPriceId: plan.stripe_price_id_yearly,
    }
  })

  // Check if any plans are missing prices
  const plansNeedingSync = plansWithPrices.filter(
    plan => !plan.monthlyPrice || !plan.yearlyPrice
  )

  // Only sync from Stripe if we have missing prices and Stripe is configured
  if (plansNeedingSync.length > 0 &&
      process.env['STRIPE_SECRET_KEY'] &&
      process.env['STRIPE_SECRET_KEY'] !== 'sk_test_placeholder') {

    // Sync missing prices in the background (don't wait)
    Promise.all(
      plansNeedingSync
        .filter(plan => plan.stripe_product_id)
        .map(plan => syncPricesFromStripe(plan.stripe_product_id!))
    ).catch(error => {
      console.error('Background price sync failed:', error)
    })
  }

  return plansWithPrices
})
