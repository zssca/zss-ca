import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { hasServerSupabaseEnv } from '@/lib/supabase/env'
import { getActivePlans, getPlansWithPrices } from './api'
import { PricingHero, PricingPlans } from './sections'
import { serviceSchema, generateBreadcrumbSchema } from '@/lib/config/structured-data'
import { siteConfig } from '@/lib/config/site.config'

export async function PricingPage() {
  const supabaseReady = hasServerSupabaseEnv()
  let user = null
  let hasSubscription = false

  if (supabaseReady) {
    const supabase = await createClient()
    const {
      data: { user: authedUser },
    } = await supabase.auth.getUser()
    user = authedUser

    if (user) {
      const { data: subscription } = await supabase
        .from('subscription')
        .select('id')
        .eq('profile_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .maybeSingle()

      hasSubscription = Boolean(subscription)
    }
  }

  const basePlans = await getActivePlans()
  const plans = await getPlansWithPrices(basePlans)

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Pricing', url: `${siteConfig.url}/pricing` },
  ])

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto flex flex-col gap-16 px-4 py-16 md:py-24">
        <PricingHero />
        <PricingPlans
          plans={plans}
          isAuthenticated={Boolean(user)}
          hasSubscription={hasSubscription}
        />
      </div>
    </>
  )
}
