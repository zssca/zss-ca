/**
 * Zod schemas for runtime validation of database join results
 * Replaces unsafe type casting with validated transformations
 *
 * @see docs/rules/02-typescript.md - Pattern 4: Zod Schema Type Inference
 * @see docs/rules/05-database.md - Pattern 2: Optimized RLS Policies
 */

import { z } from 'zod'

/**
 * Profile schema for joins
 * Partial fields since joins may return subset of columns
 */
export const ProfileJoinSchema = z.object({
  id: z.string().uuid(),
  contact_name: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  company_name: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
}).passthrough() // Allow additional fields

/**
 * Invoice schema for joins
 */
export const InvoiceJoinSchema = z.object({
  id: z.string().uuid(),
  invoice_number: z.string().nullable().optional(),
  total: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
}).passthrough()

/**
 * Payment Intent schema for joins
 */
export const PaymentIntentJoinSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
}).passthrough()

/**
 * Plan schema for joins
 */
export const PlanJoinSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().nullable().optional(),
  interval: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
}).passthrough()

/**
 * Billing Alert with details schema
 * Used in: features/admin/billing/api/queries/billing-alerts.ts
 */
export const BillingAlertWithDetailsSchema = z.object({
  // Base billing_alert fields
  id: z.string().uuid(),
  profile_id: z.string().uuid().nullable(),
  invoice_id: z.string().uuid().nullable(),
  payment_intent_id: z.string().uuid().nullable(),
  alert_type: z.string(),
  severity: z.string(),
  status: z.string(),
  message: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),

  // Joined relations
  profile: ProfileJoinSchema.nullable().optional(),
  invoice: InvoiceJoinSchema.nullable().optional(),
  payment_intent: PaymentIntentJoinSchema.nullable().optional(),
}).passthrough()

export type BillingAlertWithDetails = z.infer<typeof BillingAlertWithDetailsSchema>

/**
 * Subscription Timeline Event schema
 * Used in: features/admin/billing/api/queries/subscription-history.ts
 */
export const SubscriptionTimelineEventSchema = z.object({
  // Base subscription_history fields
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  event_type: z.string(),
  from_plan_id: z.string().uuid().nullable(),
  to_plan_id: z.string().uuid().nullable(),
  from_status: z.string().nullable(),
  to_status: z.string().nullable(),
  mrr_change: z.number().nullable(),
  arr_change: z.number().nullable(),
  occurred_at: z.string(),
  reason: z.string().nullable(),
  changed_by: z.string().nullable(),
  prorated_amount: z.number().nullable(),

  // Joined relations
  from_plan: PlanJoinSchema.nullable().optional(),
  to_plan: PlanJoinSchema.nullable().optional(),
  profile: ProfileJoinSchema.nullable().optional(),
}).passthrough()

export type SubscriptionTimelineEvent = z.infer<typeof SubscriptionTimelineEventSchema>

/**
 * Ticket with Profile schema
 * Used in: features/admin/support/api/queries/tickets.ts
 */
export const TicketWithProfileSchema = z.object({
  // Base ticket fields
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  subject: z.string(),
  status: z.string(),
  priority: z.string(),
  category: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  resolved_at: z.string().nullable(),
  last_reply_at: z.string().nullable(),
  sla_due_at: z.string().nullable(),

  // Joined relations
  profile: ProfileJoinSchema.nullable().optional(),
}).passthrough()

export type TicketWithProfile = z.infer<typeof TicketWithProfileSchema>

/**
 * Audit Log with Profiles schema
 * Used in: features/admin/audit-logs/api/queries/audit-logs.ts
 */
export const AuditLogWithProfilesSchema = z.object({
  // Base audit_log fields
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  action: z.string(),
  resource_type: z.string().nullable(),
  resource_id: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),

  // Joined relations
  user_profile: ProfileJoinSchema.nullable().optional(),
  target_profile: ProfileJoinSchema.nullable().optional(),
}).passthrough()

export type AuditLogWithProfiles = z.infer<typeof AuditLogWithProfilesSchema>

/**
 * Subscription with Plan schema
 * Used in: features/admin/subscription/api/queries/subscription.ts
 */
export const SubscriptionWithPlanSchema = z.object({
  // Base subscription fields
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  plan_id: z.string().uuid().nullable(),
  status: z.string(),
  current_period_start: z.string().nullable(),
  current_period_end: z.string().nullable(),
  cancel_at_period_end: z.boolean().nullable(),
  canceled_at: z.string().nullable(),
  trial_start: z.string().nullable(),
  trial_end: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  stripe_subscription_id: z.string().nullable(),

  // Joined relations
  plan: PlanJoinSchema.nullable().optional(),
  profile: ProfileJoinSchema.nullable().optional(),
}).passthrough()

export type SubscriptionWithPlan = z.infer<typeof SubscriptionWithPlanSchema>

/**
 * Notification with Profile schema
 * Used in: features/admin/notifications/api/queries/notifications.ts
 */
export const NotificationWithProfileSchema = z.object({
  // Base notification fields
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  created_at: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable(),

  // Joined relations
  profile: ProfileJoinSchema.nullable().optional(),
}).passthrough()

export type NotificationWithProfile = z.infer<typeof NotificationWithProfileSchema>

/**
 * Client with Profile schema
 * Used in: features/admin/clients/api/queries/clients.ts
 */
export const ClientWithDetailsSchema = z.object({
  // Base profile fields
  id: z.string().uuid(),
  contact_name: z.string().nullable(),
  contact_email: z.string().email().nullable(),
  company_name: z.string().nullable(),
  contact_phone: z.string().nullable(),
  created_at: z.string(),

  // Joined subscription data
  subscription: SubscriptionWithPlanSchema.nullable().optional(),

  // Aggregated fields
  total_tickets: z.number().nullable().optional(),
  open_tickets: z.number().nullable().optional(),
}).passthrough()

export type ClientWithDetails = z.infer<typeof ClientWithDetailsSchema>

/**
 * Dashboard Stats schema
 * Used in: features/admin/dashboard/api/queries/dashboard.ts
 */
export const DashboardTicketSchema = z.object({
  id: z.string().uuid(),
  subject: z.string(),
  status: z.string(),
  priority: z.string(),
  created_at: z.string(),
  profile: ProfileJoinSchema.nullable().optional(),
}).passthrough()

export type DashboardTicket = z.infer<typeof DashboardTicketSchema>

/**
 * Analytics data schemas
 * Used in: features/client/analytics/api/queries/analytics.ts
 */
export const AnalyticsDataSchema = z.object({
  total_tickets: z.number().nullable().optional(),
  open_tickets: z.number().nullable().optional(),
  resolved_tickets: z.number().nullable().optional(),
  avg_resolution_time: z.number().nullable().optional(),
}).passthrough()

export type AnalyticsData = z.infer<typeof AnalyticsDataSchema>

/**
 * Helper function to validate array of items
 */
export function validateArray<T>(
  schema: z.ZodType<T>,
  data: unknown,
  errorMessage?: string
): T[] {
  if (!Array.isArray(data)) {
    throw new Error(`${errorMessage ?? 'Invalid data structure'}: expected array`)
  }

  return data.map((item, index) => {
    const result = schema.safeParse(item)
    if (!result.success) {
      console.error(`Validation error at index ${index}:`, result.error)
      throw new Error(`${errorMessage ?? 'Invalid data structure'}: item at index ${index} failed validation`)
    }
    return result.data
  })
}

/**
 * Helper function to validate single item
 */
export function validateItem<T>(
  schema: z.ZodType<T>,
  data: unknown,
  errorMessage?: string
): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    console.error('Validation error:', result.error)
    throw new Error(`${errorMessage ?? 'Invalid data structure'}: ${result.error.message}`)
  }
  return result.data
}
