# Accessibility Checklist (2025-11-07)

| Area | Issue | Evidence | Fix |
| --- | --- | --- | --- |
| Support SLA | SLA warnings rely on color-only badges | `features/admin/support/components/support-stats.tsx` (Badges lack sr text) | Wrap badge text in `<span className="sr-only">` describing trend; add `aria-live` for breach alerts. |
| Billing tables | Failed payments table lacks row selection/focus summary | `features/admin/billing/components/failed-payments-dashboard.tsx:61` | Add `scope="row"`, focusable summary buttons, and inline action descriptions. |
| Notifications | Bulk send forms lack error summaries | `features/admin/notifications/components/create-notification-form.tsx` | Add `<div role="alert">` that aggregates `state.fieldErrors` and focus first error via `useFocusFirstError`. |
| Client sites | Cards show deployment status visually only | `features/client/sites/components/site-card.tsx` | Add `aria-live` updates when deployment dates change and a textual status pill (e.g., "Status: Live"). |
| Subscription | Pricing uses dollars w/o currency for screen readers | `features/client/subscription/components/subscription-card.tsx:67` | Wrap price with `<span aria-label="... Canadian dollars per month">`. |
| Analytics | Charts have no text fallback | `features/admin/analytics/components/plan-distribution-chart.tsx` | Add `<figcaption>` summarizing dataset and fallback table for screen readers. |
| Tables > mobile | Horizontal scroll lacks instructions | `features/admin/billing/components/billing-page-feature.tsx` (ScrollArea) | Add visually hidden hint `aria-describedby` explaining horizontal scroll. |
| Keyboard flows | Ticket reply `Clear` button no confirmation | `features/client/support/components/reply-form.tsx` | Add `type="button"` handler that confirms before wiping text when value length > 0. |
| Auth flows | Login announcements missing `role="alert"` for lockouts | `features/auth/login/components/login-form.tsx` | Add `role="alert"` to rate-limit message container so screen readers immediately announce. |
| Admin DB screen | Suspense fallback only spinner | `features/admin/database/database-monitoring-feature.tsx` | Provide descriptive text for screen readers (e.g., "Loading database health" with `aria-live`). |
