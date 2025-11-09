import 'server-only'

import type Stripe from 'stripe'
import { createClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Handle price created or updated events from Stripe
 * Syncs the price to the database for faster access
 */
export async function handlePriceUpdate(price: Stripe.Price) {
  try {
    // Only process recurring subscription prices
    if (!price.recurring || price.type !== 'recurring') {
      console.log(`Skipping non-recurring price: ${price.id}`)
      return
    }

    // Get the product ID
    const productId = typeof price.product === 'string' ? price.product : price.product?.id

    if (!productId) {
      console.error('Price has no associated product:', price.id)
      return
    }

    const supabase = createClient()

    // Find the plan by product ID
    const { data: plan, error: planError } = await supabase
      .from('plan')
      .select('id, stripe_product_id')
      .eq('stripe_product_id', productId)
      .single()

    if (planError || !plan) {
      console.log(`No plan found for product ${productId}`)
      return
    }

    // Determine if this is monthly or yearly based on interval
    const isMonthly = price.recurring.interval === 'month'
    const isYearly = price.recurring.interval === 'year'

    if (!isMonthly && !isYearly) {
      console.log(`Skipping price with unsupported interval: ${price.recurring.interval}`)
      return
    }

    // Update the appropriate price field
    const updateData: {
      updated_at: string
      price_monthly_cents?: number | null
      stripe_price_id_monthly?: string | null
      price_yearly_cents?: number | null
      stripe_price_id_yearly?: string | null
    } = {
      updated_at: new Date().toISOString(),
    }

    if (isMonthly) {
      updateData.price_monthly_cents = price.unit_amount
      updateData.stripe_price_id_monthly = price.id
    } else {
      updateData.price_yearly_cents = price.unit_amount
      updateData.stripe_price_id_yearly = price.id
    }

    const { error: updateError } = await supabase
      .from('plan')
      .update(updateData)
      .eq('id', plan.id)

    if (updateError) {
      console.error('Failed to update plan prices:', updateError)
      return
    }

    console.log(`✅ Updated ${isMonthly ? 'monthly' : 'yearly'} price for plan ${plan.id}`)

    // Revalidate pricing pages
    revalidatePath('/pricing', 'page')
    revalidatePath('/', 'page') // Homepage might show pricing

  } catch (error) {
    console.error('Error handling price update:', error)
    throw error
  }
}