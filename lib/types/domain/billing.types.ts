import type {
  BillingAlertRow,
  ChargeRow,
  InvoiceRow,
  PaymentIntentRow,
  PaymentMethodRow,
  ProfileRow,
  RefundRow,
  SubscriptionRow,
} from '../database-aliases'

export type Invoice = InvoiceRow
export type PaymentIntent = PaymentIntentRow
export type Charge = ChargeRow
export type Refund = RefundRow
export type BillingAlert = BillingAlertRow
export type PaymentMethod = PaymentMethodRow

export interface InvoiceLineItem {
  id: string
  description: string
  amount: number
  quantity: number
  proration: boolean
  productId?: string | null
  metadata?: Record<string, unknown>
}

export interface InvoiceWithRelations extends InvoiceRow {
  customer: ProfileRow
  subscription?: SubscriptionRow | null
  paymentIntents: PaymentIntentRow[]
  charges: ChargeRow[]
  refunds: RefundRow[]
  lineItems?: InvoiceLineItem[]
}

export interface PaymentHistory {
  invoices: InvoiceRow[]
  paymentIntents: PaymentIntentRow[]
  refunds: RefundRow[]
  totalPaidCents: number
  totalRefundedCents: number
}

export interface BillingDashboard {
  currentInvoice?: InvoiceRow | null
  upcomingInvoice?: InvoiceRow | null
  paymentMethod?: PaymentMethodRow | null
  billingHistory: InvoiceRow[]
  alerts: BillingAlertRow[]
}

export interface RevenueMetrics {
  mrr: number
  arr: number
  customerCount: number
  arpu: number
  churnRate: number
  ltv: number
}

export interface RevenueByPlan {
  planId: string
  planName: string
  customerCount: number
  mrr: number
  arr: number
  percentage: number
}

export interface BillingAlertSummary extends BillingAlertRow {
  acknowledgedBy?: ProfileRow | null
}
