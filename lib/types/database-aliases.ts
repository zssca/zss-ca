import type {
  Database,
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from './database.types'

type PublicTable = keyof Database['public']['Tables']
type PublicEnum = keyof Database['public']['Enums']

export type TableRow<TableName extends PublicTable> = Tables<TableName>
export type TableInsert<TableName extends PublicTable> = TablesInsert<TableName>
export type TableUpdate<TableName extends PublicTable> = TablesUpdate<TableName>
export type EnumValue<EnumName extends PublicEnum> = Enums<EnumName>

// ---------------------------------------------------------------------------
// Database row aliases
// ---------------------------------------------------------------------------

// Core user and account management
export type ProfileRow = TableRow<'profile'>
export type AccountLockoutRow = TableRow<'account_lockouts'>
export type LoginAttemptRow = TableRow<'login_attempts'>
export type RateLimitViolationRow = TableRow<'rate_limit_violations'>
export type OtpAttemptLogRow = TableRow<'otp_attempt_log'>
export type OtpVerificationRow = TableRow<'otp_verification'>
export type VerificationReminderRow = TableRow<'verification_reminders'>
export type UserActivityLogRow = TableRow<'user_activity_log'>
export type UserPreferencesRow = TableRow<'user_preferences'>

// Plans and subscriptions
export type PlanRow = TableRow<'plan'>
export type SubscriptionRow = TableRow<'subscription'>
export type SubscriptionHistoryRow = TableRow<'subscription_history'>

// Sites and analytics
export type ClientSiteRow = TableRow<'client_site'>
export type SiteAnalyticsRow = TableRow<'site_analytics'>
export type SiteAnalyticsEventRow = TableRow<'site_analytics_events'>

// Support and tickets
export type SupportTicketRow = TableRow<'support_ticket'>
export type TicketReplyRow = TableRow<'ticket_reply'>
export type SlaPolicyRow = TableRow<'sla_policy'>

// Billing and payments
export type InvoiceRow = TableRow<'invoice'>
export type PaymentIntentRow = TableRow<'payment_intent'>
export type ChargeRow = TableRow<'charge'>
export type PaymentMethodRow = TableRow<'payment_method'>
export type RefundRow = TableRow<'refund'>
export type BillingAlertRow = TableRow<'billing_alert'>

// Notifications and communication
export type NotificationRow = TableRow<'notification'>
export type NotificationHistoryRow = TableRow<'notification_history'>
export type ContactSubmissionRow = TableRow<'contact_submission'>

// Webhooks and integrations
export type WebhookEventRow = TableRow<'webhook_events'>

// Audit and compliance
export type AuditLogRow = TableRow<'audit_log'>

// ---------------------------------------------------------------------------
// Database insert aliases
// ---------------------------------------------------------------------------

// Core user and account management
export type ProfileInsert = TableInsert<'profile'>
export type AccountLockoutInsert = TableInsert<'account_lockouts'>
export type LoginAttemptInsert = TableInsert<'login_attempts'>
export type RateLimitViolationInsert = TableInsert<'rate_limit_violations'>
export type OtpAttemptLogInsert = TableInsert<'otp_attempt_log'>
export type OtpVerificationInsert = TableInsert<'otp_verification'>
export type VerificationReminderInsert = TableInsert<'verification_reminders'>
export type UserActivityLogInsert = TableInsert<'user_activity_log'>
export type UserPreferencesInsert = TableInsert<'user_preferences'>

// Plans and subscriptions
export type PlanInsert = TableInsert<'plan'>
export type SubscriptionInsert = TableInsert<'subscription'>
export type SubscriptionHistoryInsert = TableInsert<'subscription_history'>

// Sites and analytics
export type ClientSiteInsert = TableInsert<'client_site'>
export type SiteAnalyticsInsert = TableInsert<'site_analytics'>
export type SiteAnalyticsEventInsert = TableInsert<'site_analytics_events'>

// Support and tickets
export type SupportTicketInsert = TableInsert<'support_ticket'>
export type TicketReplyInsert = TableInsert<'ticket_reply'>
export type SlaPolicyInsert = TableInsert<'sla_policy'>

// Billing and payments
export type InvoiceInsert = TableInsert<'invoice'>
export type PaymentIntentInsert = TableInsert<'payment_intent'>
export type ChargeInsert = TableInsert<'charge'>
export type PaymentMethodInsert = TableInsert<'payment_method'>
export type RefundInsert = TableInsert<'refund'>
export type BillingAlertInsert = TableInsert<'billing_alert'>

// Notifications and communication
export type NotificationInsert = TableInsert<'notification'>
export type NotificationHistoryInsert = TableInsert<'notification_history'>
export type ContactSubmissionInsert = TableInsert<'contact_submission'>

// Webhooks and integrations
export type WebhookEventInsert = TableInsert<'webhook_events'>

// Audit and compliance
export type AuditLogInsert = TableInsert<'audit_log'>

// ---------------------------------------------------------------------------
// Database update aliases
// ---------------------------------------------------------------------------

// Core user and account management
export type ProfileUpdate = TableUpdate<'profile'>
export type AccountLockoutUpdate = TableUpdate<'account_lockouts'>
export type LoginAttemptUpdate = TableUpdate<'login_attempts'>
export type RateLimitViolationUpdate = TableUpdate<'rate_limit_violations'>
export type OtpAttemptLogUpdate = TableUpdate<'otp_attempt_log'>
export type OtpVerificationUpdate = TableUpdate<'otp_verification'>
export type VerificationReminderUpdate = TableUpdate<'verification_reminders'>
export type UserActivityLogUpdate = TableUpdate<'user_activity_log'>
export type UserPreferencesUpdate = TableUpdate<'user_preferences'>

// Plans and subscriptions
export type PlanUpdate = TableUpdate<'plan'>
export type SubscriptionUpdate = TableUpdate<'subscription'>
export type SubscriptionHistoryUpdate = TableUpdate<'subscription_history'>

// Sites and analytics
export type ClientSiteUpdate = TableUpdate<'client_site'>
export type SiteAnalyticsUpdate = TableUpdate<'site_analytics'>
export type SiteAnalyticsEventUpdate = TableUpdate<'site_analytics_events'>

// Support and tickets
export type SupportTicketUpdate = TableUpdate<'support_ticket'>
export type TicketReplyUpdate = TableUpdate<'ticket_reply'>
export type SlaPolicyUpdate = TableUpdate<'sla_policy'>

// Billing and payments
export type InvoiceUpdate = TableUpdate<'invoice'>
export type PaymentIntentUpdate = TableUpdate<'payment_intent'>
export type ChargeUpdate = TableUpdate<'charge'>
export type PaymentMethodUpdate = TableUpdate<'payment_method'>
export type RefundUpdate = TableUpdate<'refund'>
export type BillingAlertUpdate = TableUpdate<'billing_alert'>

// Notifications and communication
export type NotificationUpdate = TableUpdate<'notification'>
export type NotificationHistoryUpdate = TableUpdate<'notification_history'>
export type ContactSubmissionUpdate = TableUpdate<'contact_submission'>

// Webhooks and integrations
export type WebhookEventUpdate = TableUpdate<'webhook_events'>

// Audit and compliance
export type AuditLogUpdate = TableUpdate<'audit_log'>

// ---------------------------------------------------------------------------
// Enum aliases
// ---------------------------------------------------------------------------

export type UserRole = EnumValue<'user_role'>
export type SubscriptionStatus = EnumValue<'subscription_status'>
export type SiteStatus = EnumValue<'site_status'>
export type TicketStatus = EnumValue<'ticket_status'>
export type TicketPriority = EnumValue<'ticket_priority'>
export type TicketCategory = EnumValue<'ticket_category'>
export type NotificationType = EnumValue<'notification_type'>
