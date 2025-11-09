import { NextRequest, NextResponse } from 'next/server'
import {
  verifyWebhookSignature,
  handleCheckoutCompleted,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
  handlePaymentSucceeded,
  handlePaymentFailed,
  handlePriceUpdate,
  handleInvoiceCreated,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleChargeSucceeded,
  handleChargeRefunded,
} from '@/lib/stripe'
import {
  checkWebhookIdempotency,
  createWebhookEvent,
  markWebhookCompleted,
  markWebhookFailed,
  retryWithBackoff,
  sendWebhookFailureAlert,
} from '@/lib/stripe/webhook-tracking'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// ✅ Next.js 15+: Route handlers are not cached by default
// Explicitly set dynamic for clarity on POST endpoints (webhooks must never cache)
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let eventId: string | undefined

  try {
    const body = await req.text()
    const event = await verifyWebhookSignature(body)
    eventId = event.id

    // Check for duplicate events (idempotency)
    const existingEvent = await checkWebhookIdempotency(event.id)
    if (existingEvent) {
      console.log(
        `Webhook event ${event.id} already processed with status: ${existingEvent.status}`
      )
      // Return success to acknowledge receipt, but don't reprocess
      return NextResponse.json({
        received: true,
        status: 'already_processed',
        event_id: event.id,
      })
    }

    // Create webhook event record to track processing
    await createWebhookEvent(event)

    // Process webhook with retry logic and exponential backoff
    // Max 3 retries with delays: 1s, 2s, 4s
    await retryWithBackoff(
      async () => {
        switch (event.type) {
          case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
            break

          case 'customer.subscription.created':
          case 'customer.subscription.updated':
            await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
            break

          case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
            break

          // Invoice events
          case 'invoice.created':
            await handleInvoiceCreated(event.data.object as Stripe.Invoice)
            break

          case 'invoice.paid':
            await handleInvoicePaid(event.data.object as Stripe.Invoice)
            break

          case 'invoice.payment_succeeded':
            // Handle both invoice.paid and invoice.payment_succeeded
            await handleInvoicePaid(event.data.object as Stripe.Invoice)
            await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
            break

          case 'invoice.payment_failed':
            // Handle both invoice webhook and legacy payment failed handler
            await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
            await handlePaymentFailed(event.data.object as Stripe.Invoice)
            break

          // Payment Intent events
          case 'payment_intent.succeeded':
            await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
            break

          case 'payment_intent.payment_failed':
            await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
            break

          // Charge events
          case 'charge.succeeded':
            await handleChargeSucceeded(event.data.object as Stripe.Charge)
            break

          case 'charge.refunded':
            await handleChargeRefunded(event.data.object as Stripe.Charge)
            break

          // Price events
          case 'price.created':
          case 'price.updated':
            await handlePriceUpdate(event.data.object as Stripe.Price)
            break

          default:
            console.log(`Unhandled event type: ${event.type}`)
        }
      },
      event.id,
      3, // max retries
      1000 // initial delay 1s
    )

    // Mark webhook as successfully completed
    await markWebhookCompleted(event.id)

    return NextResponse.json({ received: true, event_id: eventId })
  } catch (error: unknown) {
    // Type guard for Error instances
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Mark as failed if we have the event ID
    if (eventId) {
      await markWebhookFailed(eventId, errorMessage)

      // Get the webhook event to check retry count
      const supabase = await createClient()
      const { data: webhookEvent } = await supabase
        .from('webhook_events')
        .select('retry_count, event_type')
        .eq('stripe_event_id', eventId)
        .single()

      // Send alert to admin after final retry failure
      if (webhookEvent) {
        await sendWebhookFailureAlert(
          eventId,
          webhookEvent.event_type,
          errorMessage,
          webhookEvent.retry_count || 0
        )
      }
    }

    if (error instanceof Error) {
      console.error('Webhook error:', error.message, error.stack)
    } else {
      console.error('Webhook error:', String(error))
    }
    // Don't expose internal error details to Stripe
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 })
  }
}
