# 06-api Compact Rules
Source: docs/rules/06-api.md
Created: November 10, 2025

## Summary
- Prioritize Server Actions for mutations with Zod validation, Supabase auth checks, caching hooks, and friendly error responses.
- Use Route Handlers for external APIs/webhooks, streaming responses, and non-POST HTTP verbs with signature verification and rate limiting.
- Handle validation, sanitization, file uploads, rate limiting, idempotency, retries, and feature flags inside backend modules.
- Apply structured error handling, logging, monitoring, and testing (unit, integration, e2e) to guarantee reliability.
- Run detection commands to ensure awaits, directives, validation, auth guards, and security measures remain enforced.
- **Security**: See **12-security.md** for input validation, injection prevention, CSRF protection, sensitive data handling, and audit logging.

## Checklist
1. Default to Server Actions for all app-initiated mutations; reserve Route Handlers for external clients or non-POST verbs.
2. Place Server Actions in `features/*/api/mutations.ts` with `'use server'` on the first line.
3. Place queries in `features/*/api/queries.ts` and import `'server-only'` to avoid client bundling.
4. Validate every payload with Zod (`safeParse` or `safeParseAsync` for async refinements) before touching Supabase.
5. Map `FormData` fields into plain objects before passing to Zod for better type inference.
6. Flatten Zod errors (`error.flatten().fieldErrors`) so UI components can highlight individual fields.
7. Await `createClient()` each time (cookies are async in Next.js 15+).
8. Await `supabase.auth.getUser()` and reject unauthorized requests immediately.
9. Keep Server Action return types consistent (`{ error, data?, fieldErrors?, code?, retryable? }`).
10. Use typed unions (`ActionResult`, `ActionError`, `ActionSuccess`) plus `isActionError` guards for predictability.
11. Avoid throwing in Server Actions; return structured errors instead so forms can recover gracefully.
12. Apply `updateTag()` for immediate consistency (read-your-writes) and `revalidateTag()` for background refresh.
13. Use `revalidatePath()` sparingly for large page refreshes; pair with targeted tag invalidation when possible.
14. Use `redirect()` to navigate after successful Server Actions; rely on return objects otherwise.
15. Extract rate limiting helpers (`rateLimit`) and invoke before expensive mutations to prevent abuse.
16. Enforce idempotency on critical operations (payments/booking) by requiring an `idempotency_key`.
17. Cache expensive reads inside Server Components using `cache()` or `'use cache'` plus Next.js tags.
18. Sanitize user-generated HTML using libraries like `sanitize-html` before storing or returning content.
19. Validate file uploads via Zod `.instanceof(File)` with size/type refinements before sending to storage.
20. Delete uploaded files if subsequent metadata writes fail to keep storage clean.
21. Use cookies from `next/headers` via `await cookies()` for multi-step flow state (draft IDs).
22. Store draft IDs in HTTP-only cookies with secure attributes for stepper flows.
23. Use `FormData` + Server Actions for progressive enhancement, optionally swapping to `next/form` for transitions.
24. Keep Server Actions pure; delegate repeated logic (rate limiting, sanitization, Supabase helpers) to shared utilities.
25. Apply exponential backoff wrappers around flaky external API calls to improve resilience.
26. Wrap Supabase calls in try/catch and map specific Postgres errors (23505, 23503) to friendly messages.
27. Store audit logs for sensitive actions (cancellations, payments) via helper functions writing to `audit_logs`.
28. Use `logError` helpers that report to Sentry (production) and `console.error` (development).
29. Include action name, user ID, and metadata when logging errors for better traceability.
30. Use `ActionResult` `code` values (`UNAUTHORIZED`, `VALIDATION_ERROR`, etc.) to drive UI messaging.
31. Provide `retryable` and `retryAfter` metadata so clients know whether to show retry buttons.
32. Sanitize text inputs using regex/filters to strip spam, URLs, or scripts before storing.
33. Guard spam by checking for suspicious keywords or patterns before inserting user comments.
34. Keep `sanitizeHtml` allowed tags minimal (or empty) for purely textual content.
35. Leverage Next.js built-in CSRF protection through Server Actions; only manual-check in Route Handlers.
36. Use Supabase RPCs for heavy operations (bulk updates) and call them from Server Actions for atomic transactions.
37. Invalidate per-record cache tags when performing bulk updates to keep dashboards accurate.
38. Use `Promise.allSettled` inside actions fetching multiple datasets to prevent full failure when one query fails.
39. Pass `metadata` to caching/logging helpers (record counts, durations) for observability dashboards.
40. Wrap long-running sequences with performance tracking (`trackPerformance`) to log durations per action.
41. Use `retryWithBackoff` helpers for external API calls prone to transient failure.
42. Abort retries after a capped number of attempts and return friendly “service unavailable” errors.
43. Always sanitize `reason` strings or similar free-text before saving to avoid injection/XSS in logs.
44. Call `updateTag` for each entity touched by a mutation (appointment, staff schedule, etc.).
45. Queue background jobs (notifications/emails) after DB success but before redirect when needed.
46. Keep Server Actions synchronous regarding database operations; offload asynchronous tasks to queues.
47. Use `FormData.get('services')` JSON parsing cautiously; wrap in try/catch with error messaging.
48. Delete multi-step drafts upon finalization and clear associated cookies.
49. Guard multi-step flows by checking draft ownership on each step (user ID vs draft user ID).
50. Use `cookies().delete` to clean stale state when finishing multi-step forms.
51. Use `safeParseAsync` when schemas depend on async validations (e.g., uniqueness checks).
52. Use discriminated unions in Zod for complex workflows requiring variant-specific validation.
53. Use `zod` refinements to enforce password strength, numeric ranges, or cross-field constraints.
54. Replace manual regex/length checks with Zod definitions for consistency.
55. For file uploads, confirm Supabase Storage policies enforce Tenancy; verify bucket policies align with application RLS.
56. Use `supabase.storage.from(...).remove([fileName])` to roll back uploaded files when metadata writes fail.
57. Limit upload size (e.g., ≤5MB) and permitted MIME types via Zod refinements.
58. Verify user ownership (salon, tenant) before associating resources with the uploaded file.
59. Use multi-step forms storing intermediate data in dedicated draft tables, not local storage.
60. Use cookies for draft IDs with `httpOnly` and `secure` flags to mitigate XSS.
61. Keep multi-step forms idempotent; allow restarts from step 1 when drafts missing/expired.
62. Use Next.js `cookies()` (awaited) instead of relying on request headers or context for cookies.
63. Keep validation logic in `schema.ts` files per feature for centralization.
64. Share TypeScript types derived from Zod via `z.infer<typeof schema>` so actions and UI stay in sync.
65. Run unit tests for actions by mocking Supabase clients and cache APIs.
66. Run integration tests against Supabase test instances to ensure real DB behavior.
67. Run Playwright e2e tests covering entire flows (login -> create appointment) with assertions on UI results.
68. Mock Next.js `redirect` in tests to catch navigation behavior.
69. Use `vi.mock('next/cache')` to intercept cache invalidation calls in tests.
70. Use `Promise.allSettled` when fetching multiple resources in actions to avoid cascading failures.
71. Batch operations via Supabase RPC or single SQL calls to reduce round trips.
72. Use streaming Route Handlers with `ReadableStream` + SSE for realtime updates when needed.
73. Keep streaming responses alive with keepalive comments (`: keepalive`).
74. Clean up realtime channels when request aborts by listening to `request.signal`.
75. Use `NextResponse.json({ data }, { status })` consistently for responses with JSON bodies.
76. In Route Handlers, always `await context.params` in Next.js 15+ dynamic routes.
77. Validate request bodies with Zod inside Route Handlers just like Server Actions.
78. Return 401/403/404 appropriately and avoid exposing DB error details in JSON.
79. Use `NextRequest` for reading headers, cookies, and query params in Route Handlers.
80. For SSE/streaming, set headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`).
81. Implement webhook Route Handlers that verify signatures (`stripe-signature`, `x-supabase-signature`) before processing payloads.
82. Use `crypto.timingSafeEqual` to compare HMAC digests for webhook verification.
83. Always parse webhook bodies as raw text before signature verification; avoid `request.json()` first.
84. Handle Stripe events by type and update Supabase tables accordingly, logging unexpected event types.
85. Use Next.js caching APIs within webhook handlers to update relevant tags after database writes.
86. Provide safe fallback for unknown webhook events to prevent crashes.
87. Implement Supabase webhook signature verification using shared secrets stored server-side.
88. Keep helper functions (`sendAppointmentNotification`) behind `'use server'` to use Supabase clients securely.
89. Use rate limiting libs (Upstash) for Server Actions requiring abuse prevention (messages, reviews).
90. Gracefully report rate-limit errors with `code: 'RATE_LIMIT_EXCEEDED'` and instruct the user to wait.
91. Implement idempotency by storing `idempotency_key` columns and checking for existing records before inserts.
92. Use hashed user IDs or membership functions to control experiment/feature flag rollouts.
93. Store feature flag configs in Supabase tables and evaluate per user via hashed assignment.
94. Track experiment events (`checkout_started`, `checkout_completed`) to measure conversions per variant.
95. Wrap variant logic in functions per variant (`processBookingVariantA`) for clarity.
96. Hash user IDs deterministically (simple string hash) to assign experiment variants consistently.
97. Log experiment events with metadata (errors, values) for detailed analysis.
98. Use `ActionResult` to propagate experiment-specific outcomes while keeping API consistent.
99. Expose typed error codes to the UI for localized or context-specific messaging.
100. Keep user-friendly error message constants (`ERROR_MESSAGES`) for consistent display text.
101. Provide `getErrorMessage(code, custom)` utility to map codes to localized strings.
102. Use `retryable` flags to decide when to show “Try again” buttons or disable CTAs.
103. Use `retryAfter` hints to power countdown UI for rate limits.
104. Use `Promise.allSettled` to degrade gracefully when optional data fetches fail (e.g., analytics).
105. Always sanitize `JSON.parse(formData.get(...))` operations with try/catch.
106. Use RBC (read-before-check) patterns for verifying user ownership (e.g., verifying salon belongs to user).
107. When upserting, prefer `.upsert([...], { onConflict: 'id' })` to avoid manual duplicates.
108. Use `.select().single()` after inserts when you need returned data (IDs, timestamps).
109. Guard `FormData` values using `z.string().uuid()` etc. to ensure valid IDs before DB queries.
110. Convert numeric strings to numbers (`Number(formData.get('amount'))`) before validation to catch NaN.
111. Clean `FormData` by converting `''` to `undefined` when needed to differentiate optional fields.
112. Use `z.boolean()` by mapping `'on'` or `'true'` values from forms.
113. Inject sanitized metadata (IP, user-agent) into audit logs for compliance.
114. Reuse `logAuditEvent` helper whenever the event warrants traceability (delete/cancel/payment).
115. Keep `metadata` objects small; store larger payloads in dedicated tables.
116. Use `cookies()` to store ephemeral state (wizard IDs), not sensitive tokens.
117. Use `httpOnly` cookies for server-managed state to prevent tampering.
118. Clean up cookies after finishing flows to reduce leftover state.
119. Use RBC gating (load record by ID and user ID) before performing updates/deletes.
120. Use `.eq('business_id', user.id)` even on views to benefit from indexes and skip policy evaluation when possible.
121. Build SSE endpoints using `ReadableStream` and `request.signal` to cancel gracefully.
122. Send keepalive comments every 30 seconds to maintain SSE connections.
123. Remove Supabase realtime channels when SSE request aborts to avoid leaks.
124. Ensure streaming responses set `Cache-Control: no-cache` and disable CDN caching.
125. Wrap `fetch` to external APIs with `await` and handle `.ok` checks before decoding JSON.
126. Provide fallback data structures when `Promise.allSettled` returns rejected promises.
127. Use `.maybeSingle()` when results can legitimately be absent; handle `null`.
128. Return 404 JSON responses when data missing in Route Handlers.
129. Use `NextResponse.json({ error }, { status })` to send consistent API errors.
130. For streaming endpoints, respond with `new Response(stream, { headers })` as shown.
131. Document each API route’s supported methods (GET/POST/DELETE) to avoid unintended verbs.
132. Use Next.js `RouteContext` types with `params: Promise<{ id: string }>` and consistently `await context.params`.
133. Use `request.json()` only after verifying method and content-type to avoid exceptions.
134. Implement signature verification for all third-party webhooks (Stripe, Supabase, etc.).
135. Use `process.env` secrets for webhook verification; never hardcode.
136. Log unhandled webhook event types for later instrumentation.
137. Avoid running heavy logic in webhook handlers; dispatch jobs or RPC when needed.
138. Use server-only modules for queueing or background tasks triggered by actions/webhooks.
139. Use `ActionResult` wrappers for protective states (pending, success) with React forms.
140. Pair `useActionState` with action return shapes to show errors inline.
141. Use `useFormStatus` to disable submit buttons during server submission.
142. Use `useOptimistic` for immediate UI updates when actions update data lists.
143. Extract sanitization utilities (e.g., `sanitizeHtml`) into shared helpers for reuse.
144. Keep minimal dependencies inside Server Actions to reduce bundle size.
145. Use detection commands to ensure `'use server'`/`'use client'` directives remain at top of files.
146. Use detection commands to ensure `formData.get('file')` occurrences include Zod validation.
147. Use detection commands to ensure server code doesn’t import browser Supabase clients.
148. Use detection commands to ensure server code references `getUser()` rather than `getSession()`.
149. Use detection commands to ensure actions include rate limiting for spam-prone endpoints.
150. Use detection commands to ensure `.safeParse` exists near every `FormData.get` cluster.
151. Use detection commands to ensure route handlers wrap Supabase errors with friendly responses.
152. Use detection commands to ensure `createClient()` and `cookies()` are awaited in all contexts.
153. Use detection commands to ensure `context.params` is awaited in route handlers.
154. Use detection commands to ensure `.throw new Error` does not appear inside Server Actions.
155. Use detection commands to ensure `sanitizeHtml` or comparable sanitization is applied to comment/review fields.
156. Use detection commands to confirm `idempotency_key` usage in payment/booking logic.
157. Use detection commands to identify streaming endpoints lacking keepalive messages.
158. Use detection commands to ensure SSE handlers clean up channels on abort signals.
159. Use detection commands to ensure webhook handlers validate signatures.
160. Use detection commands to ensure Rate limiting libraries are referenced where expected.
161. Integrate logging for every critical mutation with context (user ID, resource ID) for observability.
162. Use `logAuditEvent` to capture compliance-sensitive actions (appointment cancel, payment process).
163. Keep audit logs in append-only tables with timestamps and optional metadata JSON.
164. Avoid logging raw secrets or sensitive payloads; redact before logging.
165. Combine feature flags and experiments with Server Actions to gradually roll out new flows.
166. Hash user IDs consistently to assign variants and share assignments via Supabase tables.
167. Track experiment events (start, success, fail) in dedicated tables for later analysis.
168. Always check feature flags before calling variant-specific implementations (V1 vs V2).
169. Provide fallbacks for disabled features to avoid runtime errors when flags off.
170. Build monitoring dashboards for action durations, success rates, and error codes to catch regressions.
171. Use typed error codes in analytics to correlate UI states with backend failures.
172. Expose human-readable error messages via constants to keep messaging cohesive.
173. Keep detection command outputs documented so developers run them after major edits.
174. Document API decisions (when to use Server Actions vs Route Handlers) for new contributors.
175. Add README sections describing rate limiting, idempotency, sanitization, and logging expectations.
176. Review detection command list quarterly and update to cover new anti-patterns.
177. Run detection commands via CI pipeline to block merges that violate API rules.
178. Manage secrets (`STRIPE_SECRET_KEY`, `SUPABASE_WEBHOOK_SECRET`) via environment variables, not code.
179. Use `NextResponse.json` with `status` codes set appropriately (200, 201, 400, 401, 403, 404, 409, 429, 500).
180. Provide `retry-after` headers or payload fields when returning rate-limit errors to help clients back off.
181. Structure SSE event payloads as JSON strings preceded by `data:`.
182. Use `updateTag` after webhook updates to sync in-app dashboards immediately.
183. Use `.channel().on('broadcast'...)` pattern for realtime updates; remove old `postgres_changes` usage.
184. Keep SSE and realtime channel names namespaced by tenant/room for security.
185. Build `retryWithBackoff` utilities that respect maximum attempt counts to avoid runaway retries.
186. Document idempotency requirements for critical forms and ensure UI supplies unique keys.
187. Use `FormData` hidden fields for idempotency keys when necessary.
188. Provide fallback messaging for `EXTERNAL_SERVICE_ERROR` codes instructing user to try later.
189. Ensure Next.js 15 asynchronous APIs (cookies, headers, params) are awaited in every action/handler.
190. Prefer `NextRequest`/`NextResponse` over native `Request`/`Response` for Next.js features (cookies, rewrites).
191. Use `ReadableStream` only when necessary; prefer Server Actions for simpler flows.
192. Keep server-only helper modules (`rate-limit`, `audit`, `feature-flags`) under `lib/`.
193. Reuse shared Zod schemas across Server Actions and Route Handlers to avoid duplication.
194. Document server action dependencies (Supabase tables touched, tags invalidated) for maintainability.
195. Ensure server actions interact with Next.js caching (tags, revalidate) to keep UI in sync.
196. Provide fallback caching strategies (updateTag, revalidateTag) for route handlers affecting cached data.
197. Keep API secrets rotated and stored securely; avoid copying into config files.
198. Monitor telemetry (Sentry, logs, analytics) for repeated error codes and address root causes promptly.
199. Cross-reference architecture, React, Next.js, database, forms, UI, and auth rules before altering backend APIs.
200. Revisit this checklist for every new Server Action, Route Handler, or webhook to ensure compliance.
