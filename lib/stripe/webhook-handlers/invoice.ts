import 'server-only'

import Stripe from 'stripe'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Handle invoice.created event
 * Creates or updates an invoice record when Stripe generates a new invoice
 */
export async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  const supabase = await createClient()

  // Cast invoice to access optional properties
  const inv = invoice as unknown as {
    customer?: string
    subscription?: string
    payment_intent?: string
    tax?: number | null
  }

  // Get profile_id from stripe_customer_id
  const { data: profile } = await supabase
    .from('profile')
    .select('id')
    .eq('stripe_customer_id', inv.customer || '')
    .single()

  if (!profile) {
    console.error('Invoice webhook error: Customer not found', {
      stripeCustomerId: inv.customer,
      invoiceId: invoice.id,
    })
    return
  }

  // Get subscription_id if this invoice is for a subscription
  let subscriptionId: string | null = null
  if (inv.subscription) {
    const { data: subscription } = await supabase
      .from('subscription')
      .select('id')
      .eq('stripe_subscription_id', inv.subscription)
      .single()

    subscriptionId = subscription?.id || null
  }

  // Upsert invoice record
  const { error } = await supabase.from('invoice').upsert(
    {
      profile_id: profile.id,
      subscription_id: subscriptionId,
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: inv.payment_intent || null,

      // Invoice details
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      amount_remaining: invoice.amount_remaining,
      currency: invoice.currency,

      // Status tracking
      status: invoice.status || 'draft',
      collection_method: invoice.collection_method,

      // URLs and identifiers
      invoice_pdf_url: invoice.invoice_pdf || null,
      hosted_invoice_url: invoice.hosted_invoice_url || null,
      invoice_number: invoice.number || null,

      // Billing period
      period_start: invoice.period_start
        ? new Date(invoice.period_start * 1000).toISOString()
        : null,
      period_end: invoice.period_end
        ? new Date(invoice.period_end * 1000).toISOString()
        : null,

      // Financial breakdown
      subtotal: invoice.subtotal,
      total: invoice.total,
      tax: inv.tax || null,
      discount_amount: invoice.total_discount_amounts?.reduce(
        (sum, discount) => sum + discount.amount,
        0
      ) || null,

      // Attempt tracking
      attempt_count: invoice.attempt_count || 0,
      next_payment_attempt: invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000).toISOString()
        : null,

      // Metadata
      description: invoice.description || null,
      statement_descriptor: invoice.statement_descriptor || null,
      metadata: invoice.metadata || {},

      // Timestamps
      due_date: invoice.due_date
        ? new Date(invoice.due_date * 1000).toISOString()
        : null,
      created_at: new Date(invoice.created * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'stripe_invoice_id',
    }
  )

  if (error) {
    console.error('Invoice webhook error: Failed to create/update invoice', {
      invoiceId: invoice.id,
      errorCode: error.code,
      errorMessage: error.message,
    })
    return
  }

  // Revalidate cache
  revalidateTag('invoices', 'max')
  revalidateTag(`invoices:${profile.id}`, 'max')
  if (subscriptionId) {
    revalidateTag(`invoices:subscription:${subscriptionId}`, 'max')
  }
}

/**
 * Handle invoice.paid event
 * Updates invoice status when payment succeeds
 */
export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = await createClient()

  // Update invoice status to paid
  const { error, data: updatedInvoice } = await supabase
    .from('invoice')
    .update({
      status: 'paid',
      amount_paid: invoice.amount_paid,
      amount_remaining: 0,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id)
    .select('profile_id, subscription_id')
    .single()

  if (error) {
    console.error('Invoice webhook error: Failed to mark invoice as paid', {
      invoiceId: invoice.id,
      errorCode: error.code,
      errorMessage: error.message,
    })
    return
  }

  if (updatedInvoice) {
    // Revalidate cache
    revalidateTag('invoices', 'max')
    revalidateTag(`invoices:${updatedInvoice.profile_id}`, 'max')
    if (updatedInvoice.subscription_id) {
      revalidateTag(`invoices:subscription:${updatedInvoice.subscription_id}`, 'max')
    }
  }
}

/**
 * Handle invoice.payment_failed event
 * Updates invoice status and creates billing alert when payment fails
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = await createClient()

  // Cast invoice to access optional properties
  const inv = invoice as unknown as {
    customer?: string
    subscription?: string
  }

  // Get profile_id from stripe_customer_id
  const { data: profile } = await supabase
    .from('profile')
    .select('id')
    .eq('stripe_customer_id', inv.customer || '')
    .single()

  if (!profile) {
    console.error('Invoice webhook error: Customer not found', {
      stripeCustomerId: inv.customer,
      invoiceId: invoice.id,
    })
    return
  }

  // Update invoice status
  const { error: invoiceError } = await supabase
    .from('invoice')
    .update({
      status: invoice.status || 'open',
      attempt_count: invoice.attempt_count || 0,
      next_payment_attempt: invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id)

  if (invoiceError) {
    console.error('Invoice webhook error: Failed to update failed invoice', {
      invoiceId: invoice.id,
      errorCode: invoiceError.code,
      errorMessage: invoiceError.message,
    })
  }

  // Get subscription_id if this invoice is for a subscription
  let subscriptionId: string | null = null
  if (inv.subscription) {
    const { data: subscription } = await supabase
      .from('subscription')
      .select('id')
      .eq('stripe_subscription_id', inv.subscription)
      .single()

    subscriptionId = subscription?.id || null
  }

  // Create billing alert for failed payment
  const { error: alertError } = await supabase.from('billing_alert').insert({
    profile_id: profile.id,
    subscription_id: subscriptionId,
    alert_type: 'payment_failed',
    severity: 'high',
    title: 'Payment Failed',
    message: `Payment failed for invoice ${invoice.number || invoice.id}. Amount due: ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`,
    metadata: {
      invoice_id: invoice.id,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      attempt_count: invoice.attempt_count,
      next_payment_attempt: invoice.next_payment_attempt,
    },
    is_resolved: false,
  })

  if (alertError) {
    console.error('Invoice webhook error: Failed to create billing alert', {
      invoiceId: invoice.id,
      errorCode: alertError.code,
      errorMessage: alertError.message,
    })
  }

  // Revalidate cache
  revalidateTag('invoices', 'max')
  revalidateTag(`invoices:${profile.id}`, 'max')
  revalidateTag('billing-alerts', 'max')
  revalidateTag(`billing-alerts:${profile.id}`, 'max')
  if (subscriptionId) {
    revalidateTag(`invoices:subscription:${subscriptionId}`, 'max')
  }
}
