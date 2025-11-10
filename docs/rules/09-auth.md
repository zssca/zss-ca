# 09-auth Compact Rules
Source: docs/rules/09-auth.md
Created: November 10, 2025
Last Updated: November 10, 2025
Stack Version: Supabase Auth (latest), Next.js 16+, Node.js 20+

## Summary
- Manage Supabase Auth sessions via official SSR helpers (`createServerClient`, `updateSession` proxy) with zero custom refresh logic.
- Enforce authentication in Server Components, Server Actions, Route Handlers, and middleware using `auth.getUser()`/`getClaims()`.
- Integrate RLS policies, JWT claims (aal, amr), MFA, SSO, and anonymous auth to secure multi-tenant, role-based applications.
- Handle login/signup/passwordless/OTP/MFA flows with Server Actions, keeping rate limiting, account enumeration prevention, and GDPR compliance in place.
- Implement rate limiting for authentication endpoints (signup, token refresh, MFA) to prevent brute-force and DoS attacks.
- Run detection commands and audits to prevent deprecated APIs, misconfigured middleware, missing auth guards, or insecure patterns.
- **Security**: See **12-security.md** for authentication security, session management, password requirements, MFA, CSRF protection, and rate limiting patterns.

## Recent Updates (November 2025)
- **Token Refresh Rate Limits**: 1800 req/hour per IP with 30-req burst protection
- **MFA Challenge/Verify**: Rate limited at per-IP level; requires TOTP or phone verification
- **Email Rate Limits**: Combined email sending capped at hourly limits; signup/reset per-user throttled
- **RLS MFA Enforcement**: Use `(select auth.jwt()->>'aal') = 'aal2'` with `as restrictive` keyword for mandatory MFA
- **Session Management**: Supports refresh token rotation (`GOTRUE_SECURITY_REFRESH_TOKEN_ROTATION_ENABLED`)
- **Authenticator Assurance Levels (AAL)**: aal1 (password only), aal2 (MFA verified); embed in RLS policies
- **Authenticator Method Reference (AMR)**: Track auth methods (password, totp, phone) with timestamps for audit trails
- **RLS Email Extraction**: Migrate from deprecated `auth.email()` to `auth.jwt() ->> 'email'` for policy consistency
- **OAuth/SSO/Web3**: Rate limiting per provider; CAPTCHA support via hCaptcha or Turnstile

## Checklist
1. Use Supabase Auth exclusively; do not integrate Auth0, Clerk, NextAuth, or other providers.
2. Target Node.js 20+ for all projects; Node.js 18 is EOL and unsupported by Supabase SSR.
3. Place server client factory in `lib/supabase/server.ts` using `createServerClient` from `@supabase/ssr`.
4. Await `cookies()` before creating the server client to access the latest cookie store.
5. Implement `setAll` with try/catch to avoid crashes when running inside Server Components.
6. Never execute any logic between `createServerClient()` and `auth.getUser()` in middleware/proxy; doing so corrupts sessions.
7. Use `proxy.ts` (Next.js 16+) or `middleware.ts` (Next.js 15) to refresh sessions by calling `updateSession(request)`.
8. Return the exact `supabaseResponse` from proxy/middleware; do not wrap or mutate cookies manually afterward.
9. Exclude static assets in proxy config (`/_next/static`, `/_next/image`, `favicon.ico`, file extensions) to avoid unnecessary refreshes.
10. Use `createClient()` helper in Server Components, Server Actions, and Route Handlers to ensure consistent cookie handling.
11. Wrap `cookiesToSet` mutations in try/catch so Server Components can still read sessions even though they cannot set cookies.
12. Create a singleton browser client in `lib/supabase/client.ts` via `createBrowserClient` for client-side usage.
13. Instantiate the browser client once at module scope and reuse it inside client components to avoid duplicate listeners.
14. Always unsubscribe from `supabase.auth.onAuthStateChange` in client components to prevent memory leaks.
15. Use `updateSession(request)` helper to refresh sessions server-side and forward the updated `NextResponse`.
16. Redirect unauthenticated users in proxy/middleware by checking `request.nextUrl.pathname` after `getUser()`.
17. Redirect authenticated users away from `/login` or `/auth` routes to prevent loops.
18. In Server Components, call `auth.getUser()` immediately and `redirect('/login')` if user is null.
19. Never run RLS queries before verifying the authenticated user; unauthorized users should be redirected quickly.
20. Use `redirect()` rather than conditional rendering of “Unauthorized” to keep Next.js navigation consistent.
21. In Server Actions, call `auth.getUser()` first and return `{ error: 'Unauthorized' }` if user is absent.
22. Apply auth guards to every mutation to prevent cross-tenant writes even when RLS is misconfigured.
23. In Route Handlers, check `getUser()` and return `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })` when needed.
24. Cache user context in Server Components using local variables; avoid re-calling `getUser()` multiple times.
25. Prefer `auth.getClaims()` when only JWT claims are required; it avoids an Auth server call.
26. Use `auth.getSession()` only on the client for display logic; never rely on it server-side.
27. Wrap Supabase queries with explicit `.eq('user_id', user.id)` even when RLS enforces the same filter for performance.
28. Always enable RLS on tables and write policies referencing `auth.uid()` or JWT claims.
29. Wrap `auth.uid()` in `(select auth.uid())` inside policies for plan caching and performance.
30. Use JWT claim extraction (`auth.jwt() ->> 'role'`, `'tenant_id'`, `'aal'`) for role-based or MFA-aware policies.
31. Replace deprecated `auth.email()` policies with `auth.jwt() ->> 'email'`.
32. Store user metadata (role, permissions, tenant) in a table (e.g., `user_profiles`) and expose via Custom Access Token Hook.
33. Build RLS policies checking `auth.jwt()->>'tenant_id'` for tenant isolation.
34. Use restrictive policies layered with role/permission checks for sensitive tables.
35. Always enable Supabase proxy/middleware session refresh; Server Components rely on fresh cookies per request.
36. Use `revalidatePath('/', 'layout')` or tag invalidation after login, signup, or logout to clear cached data.
37. Use `supabase.auth.signInWithPassword`, `signInWithOAuth`, `signInWithOtp`, `signInAnonymously`, or `signInWithSSO` (new names only).
38. Validate login/signup form inputs with Zod before calling Supabase Auth to prevent malformed requests.
39. Always provide absolute URLs (e.g., `${APP_URL}/auth/callback`) for OAuth or magic link redirects.
40. Exchange OAuth codes via Route Handler (`exchangeCodeForSession`) before redirecting users to the app.
41. Use `supabase.auth.signOut()` server-side followed by cache revalidation and `redirect('/login')`.
42. Offer “Continue as guest” by calling `supabase.auth.signInAnonymously()` and storing `is_anonymous` claim in state.
43. Provide upgrade flows that call `auth.updateUser({ email, password })` to link anonymous accounts to permanent credentials.
44. Implement phone auth/MFA flows using E.164 formatted numbers (`+1234567890`) and the `phone` provider.
45. Use `auth.mfa.enroll`, `auth.mfa.challenge`, and `auth.mfa.verify` to manage TOTPs or phone-based MFA.
46. Store `factorId` returned by enrollment to manage verification or unenrollment later.
47. Use `auth.mfa.listFactors()` and `auth.mfa.unenroll()` to build device management UIs.
48. Expose `MFAEnrollment`, `MFALogin`, and `MFAManagement` client components for TOTPs and phone factors.
49. Use JWT AAL claim (`auth.jwt()->>'aal'`) to authorize access to sensitive tables only after MFA verification.
50. Require recent password auth by inspecting `amr[0].method` for “password” when gating financial operations.
51. Enable refresh token rotation via `GOTRUE_SECURITY_REFRESH_TOKEN_ROTATION_ENABLED=true` to protect against stolen refresh tokens.
52. Do not write custom refresh loops; let middleware handle rotation and cookie updates automatically.
53. Configure session timeboxing (`GOTRUE_SESSIONS_TIMEBOX`) and inactivity timeouts (`GOTRUE_SESSIONS_INACTIVITY_TIMEOUT`) for automatic logout policies.
54. Listen for `SIGNED_OUT` events client-side to redirect users to `/login?reason=session_expired`.
55. Use `router.refresh()` on `TOKEN_REFRESHED` events so Server Components get fresh cookies.
56. Provide configuration toggles for single-session enforcement via `GOTRUE_SESSIONS_SINGLE_PER_USER`.
57. Use Supabase auth rate limits and complement them with custom rate limiting for login/signup/resets.
58. Return generic error messages (“Unable to log in”) during auth flows to avoid account enumeration.
59. Always respond with success on password reset requests regardless of whether the email exists.
60. Store login failure attempts (email, IP) to detect brute-force patterns and block offending IPs.
61. Use `supabase.auth.signInWithOAuth` for social providers and handle callbacks through `/auth/callback`.
62. Validate `code` in callback route and call `auth.exchangeCodeForSession` before redirecting to the app.
63. Support domain-based SSO via `signInWithSSO({ domain })` and redirect to provider-supplied URLs.
64. Configure SAML providers via `supabase sso add` and store metadata securely.
65. Use absolute `redirectTo` URLs for all OAuth/SSO operations; relative paths break in production.
66. Provide `next` query parameter during login to redirect the user back to their original destination.
67. Use `NextResponse.redirect(new URL(next, request.url))` for safe redirects after callback processing.
68. Always sanitize and validate `next` URLs to prevent open-redirect vulnerabilities (e.g., enforce same origin).
69. Implement “remember me” by adjusting Supabase session settings, not custom cookies.
70. Use `GOTRUE_MAILER_AUTOCONFIRM` only for internal/dev environments; keep production flows double-opt-in.
71. For passwordless magic links, call `supabase.auth.signInWithOtp` and send users to `/auth/callback`.
72. For email OTPs, call `verifyOtp({ email, token, type: 'email' })` to complete login after code entry.
73. Display “Check your email for the link/code” messages without revealing whether the address exists.
74. For phone OTP login, call `signInWithOtp({ phone })` and `verifyOtp({ phone, token })` similarly.
75. Build OTP entry forms using shadcn `InputOTP` component rather than plain inputs for consistent UX.
76. Provide fallback login options when MFA fails (e.g., backup codes) if supported by Supabase features.
77. Store `factorId` for each MFA device; show friendly names (“iPhone”, “YubiKey”) in management UI.
78. Allow users to unenroll compromised MFA factors via `auth.mfa.unenroll`.
79. Require reauthentication (nonce) before sensitive actions like password changes or account deletion.
80. Trigger `supabase.auth.reauthenticate()` to send re-verification codes for high-risk flows.
81. Keep all auth-related environment variables (`NEXT_PUBLIC_SUPABASE_*`, `GOTRUE_*`) documented in `.env.example`.
82. Never expose service-role keys to the client; restrict them to server-side contexts or Edge Functions.
83. Use service-role clients only in secure server contexts (Edge Functions, background jobs) with RLS bypass requirements.
84. Log auth-related errors with context (user ID, IP, action) using centralized logging (e.g., Sentry, pino).
85. Avoid logging sensitive data (passwords, tokens); redact before writing to logs.
86. Use Next.js `cookies()` or `headers()` for server auth checks; avoid relying on request objects in Server Components.
87. On client sign-out, call `supabase.auth.signOut()` and let Server Actions redirect/revalidate to clean caches.
88. Provide `onAuthStateChange` handlers to update UI (navbars, avatars) instantly when session changes.
89. Call `router.refresh()` after sign-in/sign-out to ensure server-rendered sections update.
90. Use Supabase monitoring and logs to track unusual auth activity (failed logins, MFA enrollments).
91. Store per-login metadata (IP, user agent) for auditing and anomaly detection.
92. Save data export and deletion actions in audit tables to satisfy GDPR/CCPA requirements.
93. Provide “Download my data” flows before account deletion using server-side exports.
94. Delete PII via `delete_user_data` RPCs that cascade across related tables.
95. Anonymize analytics tables instead of deleting rows outright when legal retention is required.
96. Always delete auth user via `supabase.auth.admin.deleteUser` after cleaning associated data.
97. Restrict `delete_user_data` RPC execution to service-role contexts or authenticated functions.
98. Provide clear user messaging when deleting accounts (irreversible, timeline, exports).
99. Support session timeout warnings in UI when using inactivity timeouts.
100. Redirect timed-out users to `/login?reason=session_expired` to explain why they were signed out.
101. Use Supabase CLI (`supabase functions deploy`) for secure server-side operations requiring service role access.
102. Keep CLI and supabase-js packages updated (`pnpm up supabase-js --latest`) to receive auth fixes.
103. Reference Supabase release notes when new MFA/SSO features are added to ensure compatibility.
104. Document auth flows (login, signup, passwordless, MFA) in feature READMEs for onboarding clarity.
105. Provide fallback login methods (password + magic link) for multi-device scenarios.
106. Validate phone numbers and emails before submission to reduce bounce or SMS failure rates.
107. Queue background workers (Edge Functions) for post-signup tasks (welcome email, default data seeding).
108. Use `auth.admin.listUsers` only from admin dashboards with service role keys and additional access checks.
109. Avoid exposing admin RPCs to client components; wrap them in secure Server Actions with role checks.
110. Parse `event.data` inside Custom Access Token Hook carefully; handle missing metadata gracefully.
111. Grant `supabase_auth_admin` execute access on custom token hook functions and any referenced tables.
112. Use Custom Access Token Hook to inject `user_role`, `permissions`, and `tenant_id` claims for instant RBAC.
113. Access custom claims client-side via `session.user.app_metadata`.
114. Update RLS policies to check `auth.jwt()->>'user_role'` or `permissions`.
115. Add `tenant_id` claims to enforce multi-tenant isolation entirely at the database level.
116. Use `auth.jwt()->'permissions' ? 'view_analytics'` syntax to check array membership inside policies.
117. Keep JWT payloads lean by removing unused claims to improve SSR performance.
118. Implement `signInWithSSO` domain detection by parsing email domain (`foo@company.com -> company.com`).
119. Provide text inputs for SSO domain and fall back to default login if SSO not configured.
120. Ensure `/auth/callback` handles codes from OAuth, SSO, and magic link flows unifiedly.
121. Propagate `next` query parameters through login flows to maintain post-login navigation.
122. Validate `next` parameters server-side to confirm they target same-origin paths.
123. Use `NextResponse.redirect(new URL(next, request.url))` to avoid messing with base paths.
124. Cache `user` data in React Query or SWR only after successful server validation; revalidate on sign-in/out.
125. Use suspense boundaries to handle loading states that depend on user context.
126. In client dashboards, render skeleton placeholders until `getSession()` resolves.
127. Use `supabase.auth.getUserIdentities()` when exposing linked providers for account settings.
128. Provide UI to link/unlink OAuth providers (Google, GitHub) to existing accounts.
129. Use `auth.admin.inviteUserByEmail` for admin-driven invites and handle acceptance via `auth/callback`.
130. Send welcome emails or onboarding tasks after successful invite acceptance.
131. For server-to-server jobs, instantiate Supabase clients with service-role keys and no cookie handling.
132. Keep service-role environments separate from public envs; never expose them to the browser.
133. Use Edge Functions for webhook receivers (e.g., Stripe) that require service-role operations.
134. Validate webhook signatures before calling Supabase admin functions to prevent abuse.
135. Document the list of privileged RPCs and ensure they require admin or service-role access.
136. Use `requireAdmin()` helpers in Server Actions to guard admin-only flows.
137. Map roles (`admin`, `staff`, `customer`) to allowed routes and enforce via middleware+RLS.
138. Use `auth.getClaims()` when only `role`/`tenant_id` needed to reduce auth server load at scale.
139. Cache `auth.getClaims()` results per request when multiple components need the same info.
140. Reuse auth guard utilities across Server Components, Server Actions, and Route Handlers to reduce duplication.
141. Log authentication events (sign in, sign out, MFA enroll) to analytics for security monitoring.
142. Alert admins on suspicious activity (multiple failed logins, MFA removals) using webhook/notification systems.
143. Use `supabase.auth.admin.generateLink` to create magic links for support staff assisting users.
144. Send password reset emails via `supabase.auth.resetPasswordForEmail` and direct users to a dedicated reset page.
145. Validate reset tokens server-side by calling `supabase.auth.verifyOtp` before allowing password updates.
146. Keep password reset forms separate from login forms to simplify logic and messaging.
147. Provide “resend verification email” buttons for unverified users by calling `supabase.auth.resend`.
148. Display banner notifications prompting unverified users to confirm their email before accessing sensitive features.
149. Block access to admin features until `user.email_confirmed_at` exists.
150. Use `auth.admin.updateUserById` only from secure admin contexts for manual fixes (role changes, metadata).
151. Use `supabase.auth.admin.inviteUserByEmail` to send onboarding invitations with optional metadata payload.
152. Store `invited_by` metadata to audit who created each user account.
153. For background jobs, sign JWTs with service role to call REST endpoints while bypassing RLS safely.
154. Never store plaintext passwords or tokens in logs, analytics, or support dashboards.
155. Use environment variable references (`process.env.NEXT_PUBLIC_*`) rather than inline strings to keep secrets centralized.
156. Confirm environment variables exist at startup by throwing descriptive errors if undefined.
157. Keep `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` identical across client and server to avoid mismatched API keys.
158. Store Supabase project ref and keys securely in deployment platform secrets (Vercel env vars).
159. Avoid referencing `supabase.auth.session()` (deprecated); use `getSession()` instead.
160. Update old code paths referencing `login`, `signup`, `logout` to `signIn`, `signUp`, `signOut`.
161. Ensure all Route Handlers use async `context.params` (await) in Next.js 15+ to access dynamic segments.
162. Use `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })` for API responses lacking auth.
163. Avoid returning raw Supabase errors to clients; map them to friendly generic messages.
164. Use `revalidatePath('/', 'layout')` after login/logout to purge caches across the app shell.
165. Tag user-specific caches (`updateTag('user:${id}')`) and invalidate them after auth events.
166. For SSR pages requiring user data, use streaming with fallback skeletons while `getUser()` resolves.
167. Use suspense boundaries around components that fetch Supabase data to keep UI responsive.
168. Use `router.prefetch` for post-login destinations (dashboard) to shorten perceived load time once logged in.
169. Provide `auth/callback` route to handle magic links, OAuth, and SSO uniformly.
170. Log unexpected callback errors and show user-friendly fallback pages (“Unable to sign in, please try again”).
171. Provide “resend verification” UI and throttle via rate limiting to avoid abuse.
172. Display banners for partially verified accounts prompting email confirmation or MFA enrollment.
173. Use `auth.admin.updateUserById` only in secure admin contexts; log who triggered each change.
174. Mirror Supabase Auth provider configuration between environments to prevent auth drift.
175. Keep end-to-end tests updated for all auth flows (password, magic link, OAuth, MFA).
176. Mock Supabase clients in unit tests by stubbing `createClient` and returning deterministic responses.
177. Use `supabase.auth.getUserIdentities()` to present linked provider list in account settings UI.
178. Encourage multi-provider linking to reduce lockouts; allow unlinking via server-guarded actions.
179. Provide backup codes (when available) and secure storage/regeneration flows for MFA users.
180. Require reauthentication (nonce) before destructive operations such as deleting accounts or rotating keys.
181. Document all auth flows, rate limits, MFA requirements, and SSO providers in the project wiki/README.
182. Audit auth logs for anomalies weekly and respond to suspicious patterns with remediation plans.
183. Keep Supabase CLI and auth libraries up to date to receive security patches promptly.
184. Use detection commands to ensure `supabase.auth.session()` is absent and only modern APIs remain.
185. Run `rg "getSession\(" --type ts --type tsx` to confirm it’s only used client-side.
186. Run `rg "auth.email()"` and replace matches with `auth.jwt() ->> 'email'`.
187. Run `rg "createClient\(\)"` to ensure server helpers await cookies and include try/catch.
188. Run `rg "supabase.auth.onAuthStateChange" --type tsx` to verify cleanups exist for subscriptions.
189. Run `rg "refreshSession"` to confirm no manual refresh loops remain.
190. Run `rg "login\(" --type ts` etc. to ensure deprecated method names are gone.
191. Run `rg "auth\.getSession\(\)" --type ts` to catch server-side misuse.
192. Run `rg "auth\.jwt\(\).*email"` to confirm modern claim extraction patterns.
193. Verify `proxy.ts` exists and `middleware.ts` is removed for Next.js 16 apps.
194. Run `rg "createBrowserClient" --type ts` to ensure singleton pattern is used (no duplicate instantiations).
195. Maintain `supabase/auth` test users for QA to exercise signup/login/MFA flows.
196. Provide environment-specific login credentials for QA and staging while keeping production secure.
197. Keep `supabase.auth.admin.*` usage audited; only server-side admin dashboards or scripts may call them.
198. Implement logging/alerting when `auth.admin.deleteUser` or `auth.admin.updateUserById` is executed.
199. Train teammates on MFA, session rotation, and SSO patterns by referencing this checklist before touching auth code.
200. Revisit this checklist before shipping auth-related changes to ensure alignment with Supabase best practices.

## Rate Limiting & Abuse Prevention (Latest Patterns)

### Rate Limit Configuration
```bash
# Update rate limits via Supabase Management API
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rate_limit_anonymous_users": 10,
    "rate_limit_email_sent": 10,
    "rate_limit_sms_sent": 10,
    "rate_limit_verify": 10,
    "rate_limit_token_refresh": 10,
    "rate_limit_otp": 10,
    "rate_limit_web3": 10
  }'
```

### Default Supabase Rate Limits (per endpoint)
- **Token Refresh** (`/auth/v1/token`): 1800 req/hour per IP (burst: 30)
- **Email Signup** (`/auth/v1/signup`): Per-user signup confirmation throttle + combined email limit
- **Password Reset** (`/auth/v1/recover`): Per-user reset throttle + combined email limit
- **MFA Challenge/Verify** (`/auth/v1/factors/:id/challenge|verify`): Per-IP limit + burst protection
- **OTP Verification** (`/auth/v1/verify`): Per-user throttle + combined email/SMS limits
- **Anonymous Sign-in** (`/auth/v1/signup` without email): Per-IP anonymous rate limit
- **Web3 Operations**: Per-IP limits (customizable via `config.toml`)

### Custom Rate Limiting in Server Actions
```typescript
// lib/rate-limit/auth-limiter.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Per-IP rate limiter for login attempts
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 attempts per hour
  analytics: true,
  prefix: "ratelimit:login",
});

// Per-email rate limiter for signup
export const signupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "24 h"), // 3 signups per day
  analytics: true,
  prefix: "ratelimit:signup",
});
```

### CAPTCHA Integration (Cloudflare Turnstile)
```typescript
// app/api/auth/signup/route.ts
export async function POST(request: Request) {
  const { email, password, turnstileToken } = await request.json();

  // Verify CAPTCHA server-side
  const turnstileResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    }
  );

  const { success, error_codes } = await turnstileResponse.json();

  if (!success) {
    return Response.json(
      { error: "CAPTCHA verification failed" },
      { status: 400 }
    );
  }

  // Continue with signup
  // ...
}
```

### Brute-Force Detection
```typescript
// lib/auth/brute-force.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function recordFailedLogin(email: string, ip: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    cookies: { getAll: () => [], setAll: () => {} },
  });

  // Log failed attempt
  await supabase.from("auth_failed_attempts").insert({
    email,
    ip_address: ip,
    attempted_at: new Date().toISOString(),
  });

  // Check for brute force (e.g., 5+ failures in 15 minutes)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const { count } = await supabase
    .from("auth_failed_attempts")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .gt("attempted_at", fifteenMinutesAgo.toISOString());

  if ((count ?? 0) > 5) {
    // Block login, notify admin
    await notifySecurityTeam(`Brute force attempt on ${email}`);
    return false;
  }

  return true;
}
```

## Session Management & Token Refresh

### Refresh Token Rotation (Recommended)
```bash
# Enable in supabase/config.toml
[auth]
GOTRUE_SECURITY_REFRESH_TOKEN_ROTATION_ENABLED = true
GOTRUE_SECURITY_REFRESH_TOKEN_REUSE_INTERVAL = 10
```

### Session Timeboxing & Inactivity Timeouts
```bash
# supabase/config.toml
[auth]
GOTRUE_SESSIONS_TIMEBOX = "1h"              # Max session duration
GOTRUE_SESSIONS_INACTIVITY_TIMEOUT = "24h"  # Inactivity logout
GOTRUE_SESSIONS_SINGLE_PER_USER = false     # Allow multiple concurrent sessions
```

### Client-Side Session Listeners
```typescript
// lib/supabase/client.ts
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    // Redirect to login with reason
    window.location.href = "/login?reason=session_expired";
  }

  if (event === "TOKEN_REFRESHED") {
    // Refresh server components with new cookies
    router.refresh();
  }

  if (event === "USER_UPDATED") {
    // Update user profile or avatar in UI
    updateUserUI(session?.user);
  }
});
```

## RLS Policies with MFA Enforcement

### Enforce MFA (AAL2) for Sensitive Tables
```sql
-- Require MFA for all operations on sensitive data
create policy "Enforce MFA for sensitive data"
  on sensitive_table
  as restrictive
  to authenticated
  using (
    (select auth.jwt()->>'aal') = 'aal2'
  );
```

### Conditional MFA Enforcement (Opt-In Users)
```sql
-- Only enforce MFA for users who have enrolled factors
create policy "Enforce MFA if enrolled"
  on user_data
  as restrictive
  to authenticated
  using (
    array[(select auth.jwt()->>'aal')] <@ (
      select
        case
          when count(id) > 0 then array['aal2']
          else array['aal1', 'aal2']
        end as aal
      from auth.mfa_factors
      where (select auth.uid()) = user_id and status = 'verified'
    )
  );
```

### Time-Based MFA Enforcement (Audit Trail via AMR)
```sql
-- Require recent password auth (last 15 minutes) for sensitive operations
create policy "Require recent password auth"
  on financial_operations
  as restrictive
  to authenticated
  using (
    (select auth.jwt()->>'aal') = 'aal2'
    and
    -- Check if last auth method was password (within 15 min)
    extract(epoch from now() -
      to_timestamp((select (auth.jwt()->'amr'->0->>'timestamp')::bigint))
    ) < 900
    and
    (select auth.jwt()->'amr'->0->>'method') = 'password'
  );
```

### Tenant Isolation with JWT Claims
```sql
-- Enforce multi-tenant isolation via RLS
create policy "Tenant isolation"
  on organizations
  as permissive
  for select
  to authenticated
  using (
    id = (select auth.jwt()->>'tenant_id'::uuid)
  );
```

## MFA Setup & Management

### TOTP (Time-Based OTP) Enrollment
```typescript
// features/auth/mfa/components/mfa-enroll-totp.tsx
"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function MFAEnrollTOTP() {
  const [qrCode, setQrCode] = useState<string>("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const supabase = createBrowserClient();

  const startEnrollment = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    if (error) throw error;

    setQrCode(data?.totp.qr_code);
    setFactorId(data?.id);
  };

  const verifyEnrollment = async () => {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (error) throw error;

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: data.id,
      code,
    });

    if (verifyError) throw verifyError;

    alert("MFA enabled successfully!");
  };

  return (
    <div>
      <button onClick={startEnrollment}>Start TOTP Setup</button>
      {qrCode && <img src={qrCode} alt="QR Code" />}
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter 6-digit code"
      />
      <button onClick={verifyEnrollment}>Verify & Enable MFA</button>
    </div>
  );
}
```

### Phone-Based MFA (SMS/WhatsApp)
```typescript
// Server Action for phone MFA
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function enrollPhoneMFA(phoneNumber: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });

  // E.164 format validation
  if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
    return { error: "Invalid phone number format" };
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "phone",
    phone: phoneNumber,
  });

  if (error) return { error: error.message };

  return { factorId: data.id };
}

export async function verifyPhoneMFA(factorId: string, code: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });

  // First, initiate challenge (sends SMS/WhatsApp code)
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId,
    });

  if (challengeError) return { error: challengeError.message };

  // Then verify the code user entered
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });

  if (verifyError) return { error: verifyError.message };

  return { success: true };
}
```

### List and Unenroll MFA Factors
```typescript
// components/mfa-management.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function MFAManagement() {
  const [factors, setFactors] = useState([]);
  const supabase = createBrowserClient();

  useEffect(() => {
    listFactors();
  }, []);

  const listFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    setFactors(data.totp.concat(data.phone));
  };

  const removeFactor = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
    await listFactors();
  };

  return (
    <div>
      <h3>Your MFA Devices</h3>
      {factors.map((factor) => (
        <div key={factor.id}>
          <span>{factor.friendly_name || factor.factor_type}</span>
          <button onClick={() => removeFactor(factor.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

## Security Headers & CORS

### Content Security Policy for Auth
```typescript
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Disable MIME-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Strict-Transport-Security for HTTPS-only
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // CSP for preventing token leaks
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "connect-src 'self' https://*.supabase.co; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "frame-ancestors 'none';"
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### CORS for OAuth Callback
```typescript
// app/auth/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (!code) {
    return Response.json({ error: "No code provided" }, { status: 400 });
  }

  // Validate next URL to prevent open redirects
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL];
  const nextUrl = new URL(next, process.env.NEXT_PUBLIC_APP_URL);

  if (!allowedOrigins.includes(nextUrl.origin)) {
    return Response.json({ error: "Invalid redirect" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_PUBLISHABLE_KEY!,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${error.message}`, request.url)
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
```

## FORBIDDEN Patterns (Do Not Use)

### ❌ Deprecated Auth Methods
- **`auth.session()`** (deprecated): Use `auth.getSession()` on client only; never server-side
- **`auth.email()`** (deprecated): Use `auth.jwt() ->> 'email'` in RLS policies
- **`signIn()`, `signUp()`, `logout()`** (old names): Use `signInWithPassword()`, `signUpWithPassword()`, `signOut()`
- **`getSupabase()`** (old helper): Use `createServerClient()` from `@supabase/ssr`
- **`createPagesServerClient()`, `createMiddlewareClient()`** (v0.8.x helpers): Use `createServerClient()` for Next.js 15+
- **Manual refresh loops**: Never call `auth.refreshSession()` in loops; let middleware handle it via `updateSession()`

### ❌ Insecure Session Handling
- **Storing tokens in localStorage alone**: Always use httpOnly cookies for refresh tokens
- **Calling `getUser()` multiple times per request**: Cache the result in a variable
- **Missing try/catch around `cookiesToSet`**: Server Components cannot mutate cookies; wrap in try/catch
- **Executing logic between `createServerClient()` and `auth.getUser()`**: This corrupts sessions
- **Using relative URLs in OAuth redirects**: Always use absolute URLs (e.g., `${APP_URL}/auth/callback`)
- **Skipping `updateSession()` in middleware**: Sessions expire; always refresh them server-side

### ❌ Unsafe RLS Patterns
- **Missing RLS on auth tables**: Enable RLS on every table; never assume Supabase is secure by default
- **`where auth.uid() = user_id` without parens**: Use `(select auth.uid()) = user_id` for plan caching
- **RLS without explicit user_id filter in queries**: Always add `.eq('user_id', user.id)` even if RLS filters
- **Storing secrets in RLS policy names or comments**: Keep policy logic clean; never embed API keys
- **Relaxed (permissive) MFA policies**: Use `as restrictive` keyword to enforce MFA over permissive defaults

### ❌ Unsafe MFA/Authentication
- **Exposing `factorId` to client without verification**: Always validate MFA challenges server-side
- **Skipping phone number validation**: Always validate E.164 format (`+1234567890`)
- **No rate limiting on MFA attempts**: Enforce per-IP/per-factor rate limits to prevent guessing
- **Displaying detailed auth error messages**: Return generic "Unable to sign in" to prevent account enumeration
- **Storing plaintext passwords in logs**: Always redact sensitive data; log only error codes

### ❌ Account Management Anti-Patterns
- **Calling `auth.admin.deleteUser()` from client**: Only call from secure server-side contexts (Edge Functions, Server Actions)
- **Missing cascade delete in user data**: Always delete user data (RLS via `delete_user_data` RPC) before calling `deleteUser()`
- **No audit log for admin operations**: Log all `auth.admin.*` calls with timestamp, actor, and target user
- **Skipping email verification before access**: Always check `user.email_confirmed_at` for email-sensitive features
- **Not providing data export before deletion**: Implement "Download my data" flow per GDPR/CCPA requirements

### ❌ Credential & Secret Management
- **Exposing `SUPABASE_SERVICE_ROLE_KEY` to client**: Keep service-role keys server-only (Edge Functions, Server Actions)
- **Hardcoding API keys in code**: Use environment variables; validate they exist at startup
- **Mismatched Supabase keys between environments**: Verify `NEXT_PUBLIC_SUPABASE_URL` and keys match project
- **Storing tokens in cookies without httpOnly flag**: Always set `httpOnly=true` for refresh tokens
- **Missing env var validation**: Throw errors at startup if `NEXT_PUBLIC_SUPABASE_URL` or keys are undefined

### ❌ Open Redirect Vulnerabilities
- **Using user-supplied `next` URL without validation**: Always validate against allowed origins
- **Relative redirects in OAuth flows**: Use `NextResponse.redirect(new URL(next, request.url))` with origin checks
- **Skipping redirect validation after callback**: Validate `next` parameter before redirecting post-login
- **Allowing cross-origin redirects**: Enforce `request.url.origin === nextUrl.origin`

## Detection Commands

### Find Deprecated Auth Patterns
```bash
# Deprecated auth.session() usage (server-side)
rg "auth\.session\(\)" --type ts --type tsx -A 2

# Deprecated auth.email() in RLS
rg "auth\.email\(\)" --type sql

# Old method names
rg "\.(login|signup|logout)\(" --type ts --type tsx

# Manual refresh loops (anti-pattern)
rg "refreshSession" --type ts --type tsx

# Old auth helpers
rg "createPagesServerClient|createMiddlewareClient|getSupabase" --type ts --type tsx
```

### Verify Session Management
```bash
# Ensure createServerClient awaits cookies()
rg "createServerClient" --type ts -B 2 | grep -E "cookies\(\)|await"

# Check for missing try/catch around cookiesToSet
rg "cookiesToSet" --type ts -A 2 | grep -E "try|catch"

# Verify proxy.ts exists (Next.js 16+)
ls -la proxy.ts

# Ensure middleware.ts is removed (Next.js 16+)
ls -la middleware.ts && echo "REMOVE THIS FILE" || echo "✓ middleware.ts not found"

# Verify createBrowserClient is singleton
rg "createBrowserClient" --type ts | wc -l
# Should be 1 (in lib/supabase/client.ts only)
```

### Audit RLS Policies
```bash
# Find tables without RLS enabled
psql -h $POSTGRES_HOST -U postgres -d postgres -c "
  SELECT schemaname, tablename
  FROM pg_tables
  WHERE schemaname = 'public'
  AND NOT (EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = pg_tables.tablename
  ))
;"

# Find missing auth.uid() filters
rg "select\|where.*user_id" docs/sql --type sql | grep -v "auth\.uid\(\)"

# Verify restrictive MFA policies use as restrictive keyword
rg "aal.*aal2" docs/sql --type sql | grep -v "as restrictive"

# Find deprecated auth.email() in policies
rg "auth\.email\(\)" docs/sql --type sql
```

### Check for Secret Exposure
```bash
# Find hardcoded service-role key usage in client code
rg "SUPABASE_SERVICE_ROLE_KEY" app --type ts --type tsx

# Verify service-role key is server-only
rg "SUPABASE_SERVICE_ROLE_KEY" --type ts | grep -v "lib/\|app/api\|Edge Function"

# Find unvalidated env vars at startup
rg "process\.env\." app --type ts | grep -v "process.env.NEXT_PUBLIC" | head -20

# Check for tokens in logs (anti-pattern)
rg "token|password|secret" lib --type ts -A 1 | grep -E "console\.|logger\.|log\("
```

### Verify MFA Implementation
```bash
# Find MFA enrollment without validation
rg "auth\.mfa\.enroll" app --type ts -A 5 | grep -E "error|try|catch"

# Check for phone number validation
rg "signInWithOtp.*phone\|enrollPhoneMFA" app --type ts -A 3 | grep -E "E\.164|^\+\[1-9\]"

# Find MFA challenges without rate limiting
rg "mfa\.challenge\|mfa\.verify" app --type ts | grep -v "limiter\|rateLimit\|Ratelimit"

# Verify AAL claims in RLS
rg "aal\|amr" docs/sql --type sql
```

### Validate Security Headers
```bash
# Check for HSTS header
rg "Strict-Transport-Security" middleware.ts

# Verify CSP includes Supabase domain
rg "Content-Security-Policy" middleware.ts | grep "supabase.co"

# Check for X-Frame-Options
rg "X-Frame-Options" middleware.ts | grep "DENY"

# Verify CORS is restricted (not wildcard)
rg "Access-Control-Allow-Origin" app --type ts | grep -v "\*"
```

### Audit Admin Operations
```bash
# Find admin user operations
rg "auth\.admin\.(deleteUser|updateUserById)" app --type ts -B 2 -A 2

# Check for logging on admin operations
rg "auth\.admin\." app --type ts -A 5 | grep -E "console\.|logger\.|log\("

# Verify admin operations are server-side only
rg "auth\.admin\." app/\(client\) --type ts && echo "⚠️ ADMIN OPS IN CLIENT!" || echo "✓"
```

## Security Audit Checklist

- [ ] All tables have RLS enabled with restrictive policies
- [ ] MFA-sensitive tables use `(select auth.jwt()->>'aal') = 'aal2'` with `as restrictive`
- [ ] No deprecated `auth.session()`, `auth.email()`, or old method names in code
- [ ] `proxy.ts` (or `middleware.ts`) refreshes sessions on every request
- [ ] `createServerClient()` calls await `cookies()` and wrap `cookiesToSet` in try/catch
- [ ] Browser client is a singleton in `lib/supabase/client.ts`
- [ ] No custom refresh loops; middleware handles token rotation
- [ ] Service-role keys are never exposed to client code
- [ ] All OAuth/SSO redirects use absolute URLs with origin validation
- [ ] Rate limiting is enabled for signup, login, password reset, and MFA
- [ ] CAPTCHA or similar abuse prevention is deployed on public auth forms
- [ ] Brute-force detection logs failed attempts and blocks repeat offenders
- [ ] MFA enrollment requires verification via challenge/verify flow
- [ ] Phone MFA validates E.164 format before enrollment
- [ ] All auth errors are logged with context (user ID, IP, action) but no secrets
- [ ] Security headers (HSTS, CSP, X-Frame-Options, etc.) are set in middleware
- [ ] `auth.admin.*` operations are audited and logged
- [ ] User data is deleted via RPC cascade before calling `deleteUser()`
- [ ] Email verification is required before accessing sensitive features
- [ ] Data export flow is implemented before allowing account deletion
```
