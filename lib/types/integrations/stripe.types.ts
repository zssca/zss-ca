import type Stripe from 'stripe'
import type {
  ChargeRow,
  InvoiceRow,
  PaymentIntentRow,
  PlanRow,
  ProfileRow,
  RefundRow,
  SubscriptionRow,
} from '../database-aliases'

export type StripeWebhookEvent =
  | 'customer.created'
  | 'customer.updated'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'charge.succeeded'
  | 'charge.refunded'
  | 'price.created'
  | 'price.updated'

export interface StripeCustomerWithProfile {
  customer: Stripe.Customer
  profile: ProfileRow
}

export interface StripeSubscriptionWithPlan {
  subscription: Stripe.Subscription
  plan: PlanRow
  profile: ProfileRow
}

export interface StripeInvoiceWithData {
  invoice: Stripe.Invoice
  profile: ProfileRow
  subscription?: SubscriptionRow | null
}

export interface StripeChargeWithInvoice {
  charge: Stripe.Charge
  invoice?: InvoiceRow | null
}

export interface StripePaymentIntentWithInvoice {
  paymentIntent: Stripe.PaymentIntent
  invoice?: InvoiceRow | null
}

export interface WebhookHandlerContext {
  event: Stripe.Event
  stripe: Stripe
}

export type WebhookHandler<TPayload = unknown> = (
  payload: TPayload,
  context: WebhookHandlerContext
) => Promise<void>

export interface StripeSyncResult {
  entity:
    | 'customer'
    | 'subscription'
    | 'invoice'
    | 'payment_intent'
    | 'charge'
    | 'refund'
  stripeId: string
  recordId?: string
  status: 'created' | 'updated' | 'skipped' | 'failed'
  error?: string
}

export interface StripeToDatabaseMapping {
  invoice?: InvoiceRow
  paymentIntent?: PaymentIntentRow
  charge?: ChargeRow
  refund?: RefundRow
}
