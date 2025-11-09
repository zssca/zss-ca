import 'server-only'

import Stripe from 'stripe'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendSubscriptionCanceledEmail } from '@/lib/email/send'

export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription
) {
  const supabase = await createClient()

  const sub = subscription as unknown as {
    id: string
    status: string
    current_period_start: number
    current_period_end: number
  }

  const { error, data: updatedSub } = await supabase
    .from('subscription')
    .update({
      status: sub.status as 'active' | 'past_due' | 'canceled' | 'trialing',
      current_period_start: new Date(
        sub.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        sub.current_period_end * 1000
      ).toISOString(),
    })
    .eq('stripe_subscription_id', sub.id)
    .select('id, profile_id, plan_id')
    .single()

  if (error) {
    console.error('Webhook error: Failed to update subscription', {
      subscriptionId: sub.id,
      status: sub.status,
      errorCode: error.code
    })
    return
  }

  // Record subscription change in history table for audit trail
  if (updatedSub) {
    // Get plan details
    const { data: plan } = await supabase
      .from('plan')
      .select('price_monthly_cents, price_yearly_cents')
      .eq('id', updatedSub.plan_id)
      .single()

    // Determine MRR based on subscription interval
    const items = subscription.items?.data || []
    const priceId = items[0]?.price?.id || null
    const interval = items[0]?.price?.recurring?.interval || 'month'

    // MRR calculation (for future use in analytics)
    let _mrr = 0
    if (plan) {
      if (interval === 'year' && plan.price_yearly_cents) {
        _mrr = Math.round(plan.price_yearly_cents / 12)
      } else if (plan.price_monthly_cents) {
        _mrr = plan.price_monthly_cents
      }
    }

    // Record in subscription_history
    const { error: historyError } = await supabase.from('subscription_history').insert({
      subscription_id: updatedSub.id,
      profile_id: updatedSub.profile_id,
      plan_id: updatedSub.plan_id,
      event_type: 'status_change',
      old_status: null, // We don't have the old status in this context
      new_status: sub.status as 'active' | 'past_due' | 'canceled' | 'trialing',
      mrr_change: 0, // Calculated in MRR tracking functions
      effective_date: new Date().toISOString(),
      metadata: {
        stripe_subscription_id: sub.id,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        interval,
        price_id: priceId,
      },
    })

    if (historyError) {
      console.error('Webhook error: Failed to record subscription history', {
        subscriptionId: sub.id,
        errorCode: historyError.code,
        errorMessage: historyError.message,
      })
    }

    // ✅ Next.js 15+: Revalidate cache after subscription update (background refresh)
    revalidateTag('subscriptions', 'max')
    revalidateTag('subscription-history', 'max')
    revalidateTag(`subscription:${updatedSub.profile_id}`, 'max')
    revalidateTag(`subscription-history:${updatedSub.profile_id}`, 'max')
    revalidateTag(`profile:${updatedSub.profile_id}`, 'max')
  }
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const supabase = await createClient()

  const { error, data: sub } = await supabase
    .from('subscription')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
    .select('profile_id, plan_id')
    .single()

  if (error) {
    console.error('Webhook error: Failed to cancel subscription', {
      subscriptionId: subscription.id,
      errorCode: error.code
    })
    return
  }

  if (sub) {
    const { data: profile } = await supabase
      .from('profile')
      .select('contact_email, contact_name')
      .eq('id', sub.profile_id)
      .single()

    const { data: plan } = await supabase
      .from('plan')
      .select('name')
      .eq('id', sub.plan_id)
      .single()

    if (profile?.contact_email && profile?.contact_name && plan?.name) {
      await sendSubscriptionCanceledEmail(
        profile.contact_email,
        profile.contact_name,
        plan.name
      )
    }

    // ✅ Next.js 15+: Revalidate cache after subscription deletion (background refresh)
    revalidateTag('subscriptions', 'max')
    revalidateTag(`subscription:${sub.profile_id}`, 'max')
    revalidateTag(`profile:${sub.profile_id}`, 'max')
  }
}
