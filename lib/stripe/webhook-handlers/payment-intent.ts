import 'server-only'

import Stripe from 'stripe'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Handle payment_intent.succeeded event
 * Records successful payment attempts in the payment_intent table
 */
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  const supabase = await createClient()

  // Cast payment intent to access optional properties
  const pi = paymentIntent as unknown as {
    customer?: string
    invoice?: string
  }

  // Get profile_id from stripe_customer_id
  const { data: profile } = await supabase
    .from('profile')
    .select('id')
    .eq('stripe_customer_id', pi.customer || '')
    .single()

  if (!profile) {
    console.error('PaymentIntent webhook error: Customer not found', {
      stripeCustomerId: pi.customer,
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  // Get invoice_id if this payment is for an invoice
  let invoiceId: string | null = null
  if (pi.invoice) {
    const { data: invoice } = await supabase
      .from('invoice')
      .select('id')
      .eq('stripe_invoice_id', pi.invoice)
      .single()

    invoiceId = invoice?.id || null
  }

  // Get subscription_id if available in metadata
  let subscriptionId: string | null = null
  const metadataSubscriptionId = paymentIntent.metadata?.['subscription_id'];
  if (metadataSubscriptionId && typeof metadataSubscriptionId === 'string') {
    const { data: subscription } = await supabase
      .from('subscription')
      .select('id')
      .eq('stripe_subscription_id', metadataSubscriptionId)
      .single()

    subscriptionId = subscription?.id || null
  }

  // Upsert payment_intent record
  const { error } = await supabase.from('payment_intent').upsert(
    {
      profile_id: profile.id,
      invoice_id: invoiceId,
      subscription_id: subscriptionId,
      stripe_payment_intent_id: paymentIntent.id,

      // Amount details
      amount: paymentIntent.amount,
      amount_capturable: paymentIntent.amount_capturable || null,
      amount_received: paymentIntent.amount_received || null,
      currency: paymentIntent.currency,

      // Status tracking
      status: paymentIntent.status,
      capture_method: paymentIntent.capture_method,
      confirmation_method: paymentIntent.confirmation_method,

      // Payment method
      payment_method_id: paymentIntent.payment_method as string | null,
      payment_method_types: paymentIntent.payment_method_types || [],

      // Dates
      canceled_at: paymentIntent.canceled_at
        ? new Date(paymentIntent.canceled_at * 1000).toISOString()
        : null,

      // Error tracking (null for successful payments)
      last_payment_error_code: null,
      last_payment_error_message: null,

      // Metadata
      description: paymentIntent.description || null,
      statement_descriptor: paymentIntent.statement_descriptor || null,
      metadata: paymentIntent.metadata || {},

      created_at: new Date(paymentIntent.created * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'stripe_payment_intent_id',
    }
  )

  if (error) {
    console.error(
      'PaymentIntent webhook error: Failed to create/update payment intent',
      {
        paymentIntentId: paymentIntent.id,
        errorCode: error.code,
        errorMessage: error.message,
      }
    )
    return
  }

  // Revalidate cache
  revalidateTag('payment-intents', 'max')
  revalidateTag(`payment-intents:${profile.id}`, 'max')
  if (invoiceId) {
    revalidateTag(`payment-intents:invoice:${invoiceId}`, 'max')
  }
}

/**
 * Handle payment_intent.payment_failed event
 * Records failed payment attempts and creates billing alerts
 */
export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
) {
  const supabase = await createClient()

  // Cast payment intent to access optional properties
  const pi = paymentIntent as unknown as {
    customer?: string
    invoice?: string
  }

  // Get profile_id from stripe_customer_id
  const { data: profile } = await supabase
    .from('profile')
    .select('id')
    .eq('stripe_customer_id', pi.customer || '')
    .single()

  if (!profile) {
    console.error('PaymentIntent webhook error: Customer not found', {
      stripeCustomerId: pi.customer,
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  // Get invoice_id if this payment is for an invoice
  let invoiceId: string | null = null
  if (pi.invoice) {
    const { data: invoice } = await supabase
      .from('invoice')
      .select('id')
      .eq('stripe_invoice_id', pi.invoice)
      .single()

    invoiceId = invoice?.id || null
  }

  // Get subscription_id if available in metadata
  let subscriptionId: string | null = null
  const metadataSubscriptionId = paymentIntent.metadata?.['subscription_id'];
  if (metadataSubscriptionId && typeof metadataSubscriptionId === 'string') {
    const { data: subscription } = await supabase
      .from('subscription')
      .select('id')
      .eq('stripe_subscription_id', metadataSubscriptionId)
      .single()

    subscriptionId = subscription?.id || null
  }

  // Extract error details
  const errorCode = paymentIntent.last_payment_error?.code || null
  const errorMessage = paymentIntent.last_payment_error?.message || null

  // Upsert payment_intent record with error details
  const { error: updateError } = await supabase.from('payment_intent').upsert(
    {
      profile_id: profile.id,
      invoice_id: invoiceId,
      subscription_id: subscriptionId,
      stripe_payment_intent_id: paymentIntent.id,

      // Amount details
      amount: paymentIntent.amount,
      amount_capturable: paymentIntent.amount_capturable || null,
      amount_received: paymentIntent.amount_received || null,
      currency: paymentIntent.currency,

      // Status tracking
      status: paymentIntent.status,
      capture_method: paymentIntent.capture_method,
      confirmation_method: paymentIntent.confirmation_method,

      // Payment method
      payment_method_id: paymentIntent.payment_method as string | null,
      payment_method_types: paymentIntent.payment_method_types || [],

      // Dates
      canceled_at: paymentIntent.canceled_at
        ? new Date(paymentIntent.canceled_at * 1000).toISOString()
        : null,

      // Error tracking
      last_payment_error_code: errorCode,
      last_payment_error_message: errorMessage,

      // Metadata
      description: paymentIntent.description || null,
      statement_descriptor: paymentIntent.statement_descriptor || null,
      metadata: paymentIntent.metadata || {},

      created_at: new Date(paymentIntent.created * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'stripe_payment_intent_id',
    }
  )

  if (updateError) {
    console.error(
      'PaymentIntent webhook error: Failed to update failed payment intent',
      {
        paymentIntentId: paymentIntent.id,
        errorCode: updateError.code,
        errorMessage: updateError.message,
      }
    )
  }

  // Create billing alert for failed payment
  const alertMessage = errorMessage
    ? `Payment failed: ${errorMessage}`
    : 'Payment attempt failed. Please update your payment method.'

  const { error: alertError } = await supabase.from('billing_alert').insert({
    profile_id: profile.id,
    subscription_id: subscriptionId,
    alert_type: 'payment_failed',
    severity: 'high',
    title: 'Payment Attempt Failed',
    message: alertMessage,
    metadata: {
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      error_code: errorCode,
      error_message: errorMessage,
    },
    is_resolved: false,
  })

  if (alertError) {
    console.error(
      'PaymentIntent webhook error: Failed to create billing alert',
      {
        paymentIntentId: paymentIntent.id,
        errorCode: alertError.code,
        errorMessage: alertError.message,
      }
    )
  }

  // Revalidate cache
  revalidateTag('payment-intents', 'max')
  revalidateTag(`payment-intents:${profile.id}`, 'max')
  revalidateTag('billing-alerts', 'max')
  revalidateTag(`billing-alerts:${profile.id}`, 'max')
  if (invoiceId) {
    revalidateTag(`payment-intents:invoice:${invoiceId}`, 'max')
  }
}
