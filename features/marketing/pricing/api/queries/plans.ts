import 'server-only'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { hasServerSupabaseEnv } from '@/lib/supabase/env'
import type { Database } from '@/lib/types/database.types'

type Plan = Database['public']['Tables']['plan']['Row'] & {
  price_monthly_cents?: number | null
  price_yearly_cents?: number | null
}

export interface PlanWithPricing extends Plan {
  priceMonthly?: number
  priceYearly?: number
}

// ✅ Next.js 15+: Use React cache() for request deduplication
// For marketing pages, use dynamic = 'force-static' with revalidate at page level
// This deduplicates multiple calls within same render (e.g., pricing page + homepage)
export const getActivePlans = cache(async (): Promise<Plan[]> => {
  if (!hasServerSupabaseEnv()) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('plan')
    .select(`
      id,
      name,
      slug,
      description,
      currency_code,
      page_limit,
      revision_limit,
      features,
      is_active,
      sort_order,
      setup_fee_cents,
      price_monthly_cents,
      price_yearly_cents,
      stripe_product_id,
      stripe_price_id_monthly,
      stripe_price_id_yearly,
      created_at,
      updated_at
    `)
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('Error fetching plans:', error)
    return []
  }

  return data ?? []
})

// ✅ Next.js 15+: Use React cache() for request deduplication
// Preview plans for marketing pages - page-level caching via ISR
export const getPlansForPreview = cache(async (): Promise<PlanWithPricing[]> => {
  if (!hasServerSupabaseEnv()) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('plan')
    .select(`
      id,
      name,
      slug,
      description,
      currency_code,
      page_limit,
      revision_limit,
      features,
      is_active,
      sort_order,
      setup_fee_cents,
      price_monthly_cents,
      price_yearly_cents,
      stripe_product_id,
      stripe_price_id_monthly,
      stripe_price_id_yearly,
      created_at,
      updated_at
    `)
    .eq('is_active', true)
    .order('sort_order')
    .limit(3)

  if (error) {
    console.error('Error fetching plans:', error)
    return []
  }

  return (
    data?.map((plan) => ({
      ...plan,
      priceMonthly:
        typeof plan.price_monthly_cents === 'number'
          ? plan.price_monthly_cents / 100
          : undefined,
      priceYearly:
        typeof plan.price_yearly_cents === 'number'
          ? plan.price_yearly_cents / 100
          : undefined,
    })) ?? []
  )
})
