# UX Pattern Library — Database Bridge (2025-11-07)

A concise reference for UX flows that must stay in lockstep with Supabase tables, views, and functions.

## 1. SLA-Aware Support Threads
- **Tables**: `support_ticket`, `ticket_reply`, `sla_policy`.
- **Functions**: `check_sla_status`, `get_tickets_at_risk` (unused today).
- **Pattern**: Pair every ticket detail view with the new `SlaCountdownCard`, contextual timeline chips, and inline escalation controls. Show remaining minutes, breach states, and the assigned agent. Trigger `check_sla_status` inside the ticket Server Component and pipe JSON into the component props.

## 2. Billing Recovery Workspace
- **Tables**: `payment_intent`, `charge`, `refund`, `payment_method`, `billing_alert`.
- **Functions**: `calculate_mrr_growth`, `calculate_revenue_by_plan`.
- **Pattern**: Convert failed-payment tables into an actionable queue (filters for amount, age, customer). Add inline actions for retry, refund, and “Send dunning email” triggers that call server actions writing to `billing_alert` / `notification`.

## 3. Security Telemetry HUD
- **Tables**: `account_lockouts`, `login_attempts`, `rate_limit_violations`, `webhook_events`.
- **Pattern**: Mount `SecurityEventFeed` on the admin settings dashboard. Allow acknowledgement + unlock actions that mutate `account_lockouts` and log resolution in `audit_log`.

## 4. Data Lifecycle Coach
- **Tables**: `data_retention_policy`, `backup_catalog`, `verification_reminders`, `user_activity_log`.
- **Pattern**: Highlight purge cadences during export, deletion, and retention settings flows. Use the `DataRetentionBanner` ahead of destructive actions and link to export actions that read from `backup_catalog`.

## 5. Analytics Drilldowns
- **Tables**: `site_analytics`, `site_analytics_events`, `profile`, `client_site`.
- **Functions**: `rollup_site_analytics`, `refresh_analytics_mrr`.
- **Pattern**: Replace single-number cards with zoomable trend charts. Provide filters powered by Supabase query params (site, date range, UTM). Offer per-event timelines that join daily rollups with `site_analytics_events` records.

## 6. Subscription Storyboards
- **Tables**: `subscription`, `subscription_history`, `plan`, `plan_pricing`, `notification`.
- **Pattern**: Show lifecycle steps (trial → active → pause → cancel) using timeline UI. Each step should reflect `subscription_history` data, embed plan entitlements from `plan.features`, and surface pending notifications the system has queued.

## 7. Notification Evidence Center
- **Tables**: `notification`, `notification_history`, `user_preferences`.
- **Pattern**: Provide read receipts, channel info, and user preference overrides per notification. When admins send bulk notices, show recipients, failure reasons, and compliance status referencing `notification_history`.

## 8. Marketing Funnel Intelligence
- **Tables**: `contact_submission`, `plan_pricing`, `profile`.
- **Functions**: `identify_high_value_customers`, `calculate_customer_segments`.
- **Pattern**: Connect marketing leads to plan interest + pricing experiments. Offer segmentation filters (plan slug, monthly budget) and pipe structured feedback to `plan_pricing` view for live pricing tables.

## 9. Automation Health Panel
- **Tables**: `webhook_events`, `backup_catalog`, `rate_limit_violations`, `verification_reminders`.
- **Pattern**: Present job/cron state with retry + “mark complete” controls. Provide diff between expected reminders (function `get_unverified_users_for_reminders`) and actual `verification_reminders` rows.

## 10. Mobile Resilience
- **All tables**: apply responsive tables w/ `aria-describedby`, sticky headers, virtual scrolling via `@tanstack/react-virtual` for `support_ticket`, `payment_intent`, `contact_submission` lists.
