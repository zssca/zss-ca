import 'server-only'

import Stripe from 'stripe'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Handle charge.succeeded event
 * Records successful charge in the charge table
 */
export async function handleChargeSucceeded(charge: Stripe.Charge) {
  const supabase = await createClient()

  // Cast charge to access optional properties
  const ch = charge as unknown as {
    customer?: string
    invoice?: string
  }

  // Get profile_id from stripe_customer_id
  const { data: profile } = await supabase
    .from('profile')
    .select('id')
    .eq('stripe_customer_id', ch.customer || '')
    .single()

  if (!profile) {
    console.error('Charge webhook error: Customer not found', {
      stripeCustomerId: ch.customer,
      chargeId: charge.id,
    })
    return
  }

  // Get invoice_id if this charge is for an invoice
  let invoiceId: string | null = null
  if (ch.invoice) {
    const { data: invoice } = await supabase
      .from('invoice')
      .select('id')
      .eq('stripe_invoice_id', ch.invoice)
      .single()

    invoiceId = invoice?.id || null
  }

  // Get payment_intent_id if available
  let paymentIntentId: string | null = null
  if (charge.payment_intent) {
    const { data: paymentIntent } = await supabase
      .from('payment_intent')
      .select('id')
      .eq('stripe_payment_intent_id', charge.payment_intent as string)
      .single()

    paymentIntentId = paymentIntent?.id || null
  }

  // Upsert charge record
  const { error } = await supabase.from('charge').upsert(
    {
      profile_id: profile.id,
      invoice_id: invoiceId,
      payment_intent_id: paymentIntentId,
      stripe_charge_id: charge.id,

      // Amount details
      amount: charge.amount,
      amount_captured: charge.amount_captured,
      amount_refunded: charge.amount_refunded,
      currency: charge.currency,

      // Status tracking
      status: charge.status,
      paid: charge.paid,
      refunded: charge.refunded,
      captured: charge.captured,

      // Payment method details
      payment_method_id: charge.payment_method as string | null,
      payment_method_type: charge.payment_method_details?.type || null,
      card_brand: charge.payment_method_details?.card?.brand || null,
      card_last4: charge.payment_method_details?.card?.last4 || null,
      card_exp_month: charge.payment_method_details?.card?.exp_month || null,
      card_exp_year: charge.payment_method_details?.card?.exp_year || null,

      // Billing details
      billing_email: charge.billing_details?.email || null,
      billing_name: charge.billing_details?.name || null,

      // Financial details
      application_fee_amount: charge.application_fee_amount || null,
      fee_amount: charge.balance_transaction
        ? ((charge.balance_transaction as Stripe.BalanceTransaction).fee || null)
        : null,
      net_amount: charge.balance_transaction
        ? ((charge.balance_transaction as Stripe.BalanceTransaction).net || null)
        : null,

      // Receipt details
      receipt_email: charge.receipt_email || null,
      receipt_url: charge.receipt_url || null,

      // Metadata
      description: charge.description || null,
      statement_descriptor: charge.statement_descriptor || null,
      metadata: charge.metadata || {},

      created_at: new Date(charge.created * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'stripe_charge_id',
    }
  )

  if (error) {
    console.error('Charge webhook error: Failed to create/update charge', {
      chargeId: charge.id,
      errorCode: error.code,
      errorMessage: error.message,
    })
    return
  }

  // Revalidate cache
  revalidateTag('charges', 'max')
  revalidateTag(`charges:${profile.id}`, 'max')
  if (invoiceId) {
    revalidateTag(`charges:invoice:${invoiceId}`, 'max')
  }
}

/**
 * Handle charge.refunded event
 * Updates charge record and creates refund entries
 */
export async function handleChargeRefunded(charge: Stripe.Charge) {
  const supabase = await createClient()

  // Cast charge to access optional properties
  const ch = charge as unknown as {
    customer?: string
  }

  // Get profile_id from stripe_customer_id
  const { data: profile } = await supabase
    .from('profile')
    .select('id')
    .eq('stripe_customer_id', ch.customer || '')
    .single()

  if (!profile) {
    console.error('Charge webhook error: Customer not found', {
      stripeCustomerId: ch.customer,
      chargeId: charge.id,
    })
    return
  }

  // Get the charge record
  const { data: chargeRecord } = await supabase
    .from('charge')
    .select('id, invoice_id, payment_intent_id')
    .eq('stripe_charge_id', charge.id)
    .single()

  if (!chargeRecord) {
    console.error('Charge webhook error: Charge record not found', {
      chargeId: charge.id,
    })
    return
  }

  // Update charge record with refund status
  const { error: updateError } = await supabase
    .from('charge')
    .update({
      refunded: true,
      amount_refunded: charge.amount_refunded,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_charge_id', charge.id)

  if (updateError) {
    console.error('Charge webhook error: Failed to update refunded charge', {
      chargeId: charge.id,
      errorCode: updateError.code,
      errorMessage: updateError.message,
    })
  }

  // Create refund records for each refund
  if (charge.refunds?.data) {
    for (const refund of charge.refunds.data) {
      const { error: refundError } = await supabase.from('refund').upsert(
        {
          profile_id: profile.id,
          charge_id: chargeRecord.id,
          payment_intent_id: chargeRecord.payment_intent_id,
          stripe_refund_id: refund.id,

          // Amount details
          amount: refund.amount,
          currency: refund.currency,

          // Status tracking
          status: refund.status || 'succeeded',
          reason: refund.reason || null,

          // Metadata
          description: refund.description || null,
          metadata: refund.metadata || {},

          created_at: new Date(refund.created * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'stripe_refund_id',
        }
      )

      if (refundError) {
        console.error('Charge webhook error: Failed to create refund record', {
          chargeId: charge.id,
          refundId: refund.id,
          errorCode: refundError.code,
          errorMessage: refundError.message,
        })
      }
    }
  }

  // Create billing alert for refund
  const { error: alertError } = await supabase.from('billing_alert').insert({
    profile_id: profile.id,
    subscription_id: null,
    alert_type: 'refund_processed',
    severity: 'medium',
    title: 'Refund Processed',
    message: `A refund of ${(charge.amount_refunded / 100).toFixed(2)} ${charge.currency.toUpperCase()} has been processed for charge ${charge.id}`,
    metadata: {
      charge_id: charge.id,
      amount_refunded: charge.amount_refunded,
      currency: charge.currency,
      refund_count: charge.refunds?.data?.length || 0,
    },
    is_resolved: false,
  })

  if (alertError) {
    console.error('Charge webhook error: Failed to create billing alert', {
      chargeId: charge.id,
      errorCode: alertError.code,
      errorMessage: alertError.message,
    })
  }

  // Revalidate cache
  revalidateTag('charges', 'max')
  revalidateTag(`charges:${profile.id}`, 'max')
  revalidateTag('refunds', 'max')
  revalidateTag(`refunds:${profile.id}`, 'max')
  revalidateTag('billing-alerts', 'max')
  revalidateTag(`billing-alerts:${profile.id}`, 'max')
  if (chargeRecord.invoice_id) {
    revalidateTag(`charges:invoice:${chargeRecord.invoice_id}`, 'max')
  }
}
