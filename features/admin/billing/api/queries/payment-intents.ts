import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export type PaymentIntentWithDetails = {
  id: string
  profile_id: string
  invoice_id: string | null
  subscription_id: string | null
  stripe_payment_intent_id: string
  amount: number
  amount_received: number | null
  currency: string
  status: string
  cancellation_reason: string | null
  last_payment_error: Record<string, unknown> | null
  created_at: string
  updated_at: string
  profile: {
    id: string
    contact_name: string | null
    contact_email: string | null
    company_name: string | null
  } | null
  invoice: {
    id: string
    invoice_number: string | null
    total: number
  } | null
}

/**
 * Get all payment intents with details
 */
export const getPaymentIntents = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payment_intent')
    .select(`
      id,
      profile_id,
      invoice_id,
      subscription_id,
      stripe_payment_intent_id,
      amount,
      amount_received,
      currency,
      status,
      cancellation_reason,
      last_payment_error,
      created_at,
      updated_at,
      profile:profile_id (
        id,
        contact_name,
        contact_email,
        company_name
      ),
      invoice:invoice_id (
        id,
        invoice_number,
        total
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching payment intents:', error)
    throw error
  }

  return (data as PaymentIntentWithDetails[]) || []
})

/**
 * Get failed payment attempts
 */
export const getFailedPayments = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payment_intent')
    .select(`
      id,
      profile_id,
      invoice_id,
      subscription_id,
      stripe_payment_intent_id,
      amount,
      currency,
      status,
      cancellation_reason,
      last_payment_error,
      created_at,
      updated_at,
      profile:profile_id (
        id,
        contact_name,
        contact_email,
        company_name,
        contact_phone
      ),
      invoice:invoice_id (
        id,
        invoice_number,
        total,
        due_date
      ),
      subscription:subscription_id (
        id,
        status,
        plan:plan_id (
          name,
          slug
        )
      )
    `)
    .in('status', ['requires_payment_method', 'canceled'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching failed payments:', error)
    throw error
  }

  return data || []
})

/**
 * Get payment intent statistics
 */
export const getPaymentStats = cache(async () => {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payment_intent')
    .select('status, amount, amount_received')

  if (!payments) {
    return {
      totalPayments: 0,
      succeededPayments: 0,
      failedPayments: 0,
      processingPayments: 0,
      totalProcessed: 0,
      totalFailed: 0,
    }
  }

  const stats = {
    totalPayments: payments.length,
    succeededPayments: payments.filter((p) => p.status === 'succeeded').length,
    failedPayments: payments.filter((p) =>
      ['requires_payment_method', 'canceled'].includes(p.status)
    ).length,
    processingPayments: payments.filter((p) =>
      ['processing', 'requires_confirmation', 'requires_action'].includes(p.status)
    ).length,
    totalProcessed: payments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + (p.amount_received || p.amount || 0), 0),
    totalFailed: payments
      .filter((p) => ['requires_payment_method', 'canceled'].includes(p.status))
      .reduce((sum, p) => sum + (p.amount || 0), 0),
  }

  return stats
})
