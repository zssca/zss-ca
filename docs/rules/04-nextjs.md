# 04-nextjs Compact Rules
Source: docs/rules/04-nextjs.md
Created: November 10, 2025
Last Updated: November 10, 2025
Stack Version: Next.js 15+/16 (App Router)

## Summary
- Enforce Next.js 16 async params/searchParams handling, cache components, proxy migration, and explicit fetch caching.
- Use updateTag/revalidateTag/revalidatePath/refresh plus cacheTag/cacheLife to orchestrate cache behavior.
- Structure routes with default.tsx, Suspense streaming, Promise.all, and client `use()` patterns for async props.
- Harden production via proxy CSP headers, rate limiting, OpenTelemetry, structured logging, and runtime selection.
- Run detection commands to catch forbidden legacy APIs, missing awaits, uncached fetches, and invalid caching setups.

## Recent Updates (Next.js 15+)
- **revalidateTag with profile parameter**: Use `revalidateTag(tag, 'max')` for stale-while-revalidate semantics (recommended) or `revalidateTag(tag, 'hours')` for custom profiles
- **'use cache' directive**: Preferred over `unstable_cache` for deterministic functions; pair with `cacheTag()` and `cacheLife()` for control
- **Image optimization**: Configure `localPatterns` and `remotePatterns` in `next.config.ts`; set `minimumCacheTTL` for cache duration
- **Fetch deduplication**: React `cache()` now handles per-request deduplication automatically; combine with `fetch` tags for cross-request caching
- **Streaming improvements**: Use narrow Suspense boundaries with granular skeletons; avoid single page-level Suspense wrapper
- **Metadata API**: Always `await params` in `generateMetadata`; use `cache()` to deduplicate shared queries between metadata and page

## Checklist
1. Enable `cacheComponents: true` in `next.config.ts` so Cache Components are available everywhere.
2. Keep `'use cache'` directives paired with `cacheTag()` (and optionally `cacheLife()`) to describe invalidation behavior.
3. Replace legacy `middleware.ts` with `proxy.ts` exporting `export default async function proxy()` for the Node runtime boundary.
4. Leave Turbopack as the dev/prod bundler and turn on filesystem caching for fast reloads.
5. Await every `params` access (pages, layouts, templates, route handlers) because Next.js 15+ passes them as Promises.
6. Await every `searchParams` access for the same reason; treat them as `Promise<Record<string,string | undefined>>`.
7. Await `cookies()` and `headers()` whenever they are read on the server.
8. Await `createClient()` whenever you instantiate Supabase in Server Components, Server Actions, or route handlers.
9. Add `'use server'` to the top of every Server Action file to guarantee server-only execution.
10. Add `'use client'` as the first line (before imports) for every hook-using component.
11. Keep page files under 200 lines and delegate logic to `features/*` modules.
12. Wrap slow sections in `<Suspense>` with dedicated skeleton fallbacks to stream UI progressively.
13. Provide `loading.tsx` per route segment when streaming benefits UX.
14. Keep `error.tsx` as `'use client'` components that log to Sentry and expose a reset button.
15. Supply `not-found.tsx` to customize 404s triggered via `notFound()`.
16. Add `default.tsx` to every parallel route slot (`app/@slot/default.tsx`); builds fail without them.
17. Accept slot props (e.g., `{ children, modal }`) in layouts when parallel routes are used.
18. Use intercepting route folders `(.)`, `(..)`, `(...)` only alongside real routes and matching defaults.
19. Use React’s `use()` inside Client Components to unwrap params/searchParams promises passed from server parents.
20. Never declare a Client Component as `async`; rely on `use()` or server wrappers to deal with Promises.
21. Launch independent Supabase queries concurrently with `Promise.all`.
22. Deduplicate repeated async calls per request using React’s `cache()` helper.
23. Explicitly set `cache: 'force-cache'` or `cache: 'no-store'` on every `fetch`; defaults are no-cache.
24. Attach `next: { tags: [...] }` to cached fetches so they can be invalidated by tag.
25. Define hierarchical tag helpers like `appointments`, `appointments:business:${id}`, `appointment:${id}`.
26. Call `updateTag(tag)` inside Server Actions immediately after successful writes needing read-your-writes consistency (clears cache instantly).
27. Call `refresh()` inside Server Actions when client router state must update immediately (badges, notifications).
28. Use `revalidateTag(tag, 'max')` for background stale-while-revalidate updates (serves stale data immediately, regenerates in background); use `revalidateTag(tag, 'hours')` for custom profile durations.
29. Use `revalidatePath(path, 'page' | 'layout')` after destructive operations needing full route refresh; prefer tag-based invalidation for targeted updates.
30. Configure custom `cacheLife` profiles in `next.config.ts` for domain-level caching windows (e.g., profiles: { salons: { revalidate: 3600 }, analytics: { revalidate: 300 } }).
31. Use `'use cache'` for deterministic functions/components that don't depend on request-specific data (cookies, headers); always emit `cacheTag()` and `cacheLife()` inside.
32. Combine `'use cache'` with React `cache()` when you need cross-request caching plus per-request deduplication; use for shared DB queries between metadata and page.
33. Avoid `unstable_cache` (deprecated); migrate to `'use cache'` directive with `cacheTag()` and `cacheLife()` for cleaner semantics.
34. Chain tag invalidations from specific to general (record tag → scoped tag → global tag) after writes/deletes.
35. Fetch record metadata before deletes so you know which scoped tags (business/staff) to invalidate.
36. Keep fetch waterfalls out of Server Components by either parallelizing with `Promise.all` or splitting via Suspense.
37. Export `revalidate` numbers for ISR routes (marketing/blog, e.g., `export const revalidate = 3600`) and leave dashboards dynamic (`revalidate = 0` or omitted).
38. Use `runtime: 'edge'` only for lightweight middleware needing global reach; keep heavy logic on the Node runtime.
39. Use `runtime: 'nodejs'` when middleware touches databases, file systems, or Node-only APIs.
40. Document caching/tag strategies per feature to keep invalidation logic understandable; include decision on `updateTag` vs `revalidateTag` vs `revalidatePath`.
41. Use detection scripts (ripgrep, find) to ensure these structural rules stay enforced in CI.
42. Keep marketing routes SSG or ISR (`revalidate = 86400`) while user dashboards remain SSR for freshness (`revalidate = 0` or dynamic APIs like `cookies()`).
43. Use `fetchCache = 'default-no-store'` or `'force-no-store'` when you want all fetches in a route to default to no caching; use sparingly, prefer explicit fetch-level controls.
44. Export `runtime = 'edge'` in route segments requiring edge behavior and ensure code stays edge-compatible (no Node imports).
45. Export `runtime = 'nodejs'` in segments needing Node APIs to avoid edge limitations.
46. Treat `generateMetadata` as async; `await params` and DB calls before returning metadata objects; use `cache()` to share queries with page component.
47. Use `template.tsx` to force rerender on navigation for animations or state resets.
48. Keep route handlers (`route.ts`) limited to HTTP verbs (GET/POST/etc.) and avoid mixing Server Action logic.
49. Parse request bodies with `await request.json()` and validate using schemas before writing data.
50. Secure webhooks via shared secrets (`x-webhook-secret`) and respond with 401 when invalid.
51. Rate limit route handlers and Server Actions using Upstash `Ratelimit` or equivalent to prevent abuse.
52. Return 429 responses with `X-RateLimit-*` headers when limits are exceeded.
53. Use `app/error.tsx` plus `useEffect` to report client-side errors to Sentry.
54. Instrument server code with `pino` or similar structured logger, logging both success and failure contexts.
55. Register OpenTelemetry in `instrumentation.ts` and set OTLP endpoints via env vars.
56. Wrap Server Actions inside `tracer.startActiveSpan` to capture DB/cache spans and record exceptions.
57. Use `registerOTel` only when `process.env.NEXT_RUNTIME === 'nodejs'` to avoid edge bundling.
58. Provide CSP headers via proxy/middleware and pass generated nonces to layout/head tags.
59. Attach `nonce={nonce}` to inline `<script>` or `<style>` tags referencing the header value.
60. Add security headers like `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, and HSTS for every HTML response.
61. Ensure proxy responses call `response.headers.set('x-nonce', nonce)` so layouts can read it via `headers()`.
62. Use Suspense fallback components (Skeletons) that mirror final layout dimensions to minimize layout shift.
63. Use nested Suspense within slow components (e.g., analytics chart inside analytics panel) for granular streaming.
64. Keep `<Suspense>` boundaries narrow; avoid wrapping entire pages in a single fallback.
65. Provide dedicated skeleton components like `<QuickStatsSkeleton />` or `<ChartSkeleton />` for clarity.
66. Use `Promise.all` when fetching `salon`, `staff`, `reviews`, `services` to avoid sequential latency.
67. Use `next: { tags: [...] }` on remote API fetches (analytics, marketing) so you can invalidate them with `revalidateTag`.
68. For Node runtime middleware, dynamically import heavy modules (`const fs = await import('fs/promises')`) to reduce initial load.
69. Use `redirect()` after Server Actions when you need to navigate post-mutation and ensure caches were invalidated first.
70. Keep actions returning JSON results when client components need data without navigation.
71. Use `refresh()` sparingly; prefer precise tag invalidation to avoid full router refresh cost.
72. Flatten sequential `await` statements in route handlers by combining them if dependencies allow.
73. Use `cacheLife` inline objects (e.g., `{ revalidate: 3600, stale: 300, expire: 7200 }`) only when you cannot reuse a named profile.
74. Keep tag names descriptive; never use generic names like `'data'`, `'cache'`, or `'items'`.
75. Mirror tag strings between fetch calls, `'use cache'` blocks, and invalidation sites.
76. For deletes, fetch the record first to capture `business_id`, `staff_id`, or `salon_id` needed for tag invalidation.
77. Keep `revalidatePath` usage targeted; only call it for pages whose data cannot be covered by tags.
78. Spread invalidation responsibilities: nodes closest to the data they mutate should emit the right tags.
79. Document caching flows (which actions call updateTag, revalidateTag, refresh) in feature READMEs.
80. Keep `proxy.ts` matchers limited to relevant segments to reduce overhead.
81. Ensure `proxy.ts` gracefully handles missing auth tokens by redirecting to login or returning 401.
82. Prefer Server Actions for mutations triggered by React forms; reserve route handlers for external clients/webhooks.
83. Use `useActionState` + Server Actions for form submissions; connect revalidation logic inside the action.
84. Ensure Server Actions parse inputs with Zod before writing to Supabase.
85. Guard Server Actions with authentication (`supabase.auth.getUser()`) before running DB queries.
86. Always `await supabase.auth.getUser()` because `createClient()` is async; handle `!user` with thrown errors.
87. Use `redirect()` or `return` objects to send responses after actions finish invalidation.
88. Use `revalidateTag('notifications', 'max')` after marking notifications as read to refresh lists lazily.
89. Call `refresh()` after toggling favorites so icons update instantly client-side.
90. Keep route handlers returning `NextResponse.json(...)` with status codes and JSON bodies.
91. Rate-limit Server Actions via Upstash keyed on user IDs to block brute-force operations (reviews, bookings).
92. Provide instrumentation spans for DB inserts (`db.insert.*`) and cache invalidations (`cache.invalidate`) to ease debugging.
93. Use environment variables like `NEXT_OTEL_VERBOSE` and `OTEL_EXPORTER_OTLP_ENDPOINT` to control telemetry output.
94. Keep instrumentation sample rates high in dev (1.0) and lower in prod to control cost.
95. Document unstoppable `cacheLife` and caching strategies per route in developer docs.
96. Keep `app/layout.tsx` asynchronous if it reads headers for nonce injection.
97. Use `headers()` (awaited) to retrieve per-request values like CSP nonces or geolocation info.
98. Always return `<html>` and `<body>` from layout functions; never wrap the tree in `<div>`.
99. Use route groups `(marketing)`, `(business)`, etc., to scope layouts without influencing URL paths.
100. Keep default route group containing homepage when multiple root layouts exist.
101. Accept that navigating between different root layouts triggers full document reload; design UX accordingly.
102. Use intercepting routes for modals (e.g., `@modal/(.)photos/[id]/page.tsx`) and ensure default slot fallback returns `null`.
103. Keep `PhotoModal` or similar components inside Suspense to handle awaited params.
104. Provide `app/@modal/default.tsx` returning null to satisfy Next.js 16 parallel route requirements.
105. Use `router.push`/`router.replace` inside Client Components paired with `use()` results to update search filters.
106. Use `URLSearchParams` to build query strings from client filter controls.
107. Implement search pages as Server Components receiving awaited `searchParams` when SEO-critical.
108. Provide `Skeleton` components using Tailwind classes to match eventual layout sizes.
109. Keep `app/(business)/dashboard/page.tsx` returning a synchronous tree with Suspense boundaries rather than sequential awaits.
110. Use `<Suspense>` around `QuickStats`, `RecentAppointments`, and `AnalyticsChart` to stream them independently.
111. Rely on React streaming to send fast bits first; avoid blocking on analytics queries.
112. Use `next: { revalidate: 3600 }` on remote analytics API fetches to cache for specific durations (preferred over deprecated `cache: 'force-cache'`).
113. Use `revalidateTag(\`analytics:${businessId}\`, 'max')` when server actions need to refresh cached analytics data.
114. Limit `'use cache'` usage to deterministic data functions and annotate with comments describing cache scope.
115. Build tag helper modules (e.g., `const tags = { appointments: 'appointments', appointment: id => ... }`) for reuse.
116. Keep tag helper modules typed and exported from shared libs so features share naming conventions.
117. Use `updateTag(tags.appointment(id))` plus `updateTag(tags.businessAppointments(businessId))` after appointment writes.
118. Always revalidate path `/business/appointments` after appointment create/delete to refresh SSR list pages.
119. Avoid `revalidatePath` for small updates; prefer tag invalidation for minimal overhead.
120. Use `refresh()` sparingly; each call refreshes router caches for the entire current page.
121. Document which Server Actions call `updateTag`, `revalidateTag`, `revalidatePath`, and `refresh` for auditability.
122. Use SSG/ISR for marketing routes by exporting `revalidate` numbers; avoid forcing `dynamic = 'force-static'` in Next.js 16.
123. Keep dashboards dynamic by omitting cache directives or setting `revalidate = 0`.
124. Use `fetchCache = 'default-no-store'` when you want fetch calls inside a segment to default to `no-store`.
125. Use `fetchCache = 'only-cache'` rarely, only when you want builds to fail if cached data missing.
126. Resist mixing SSR and ISR on the same page; instead, split content into streaming sections with Suspense.
127. When using `use cache`, avoid referencing request-specific data (cookies, headers) inside the cached scope.
128. Use `cacheTag('resource', 'resource:scope')` patterns to emit multiple tags for a single cached function.
129. Call `cacheLife('profileName')` inside `'use cache'` blocks to apply named cache profile durations.
130. Use inline cacheLife objects for ad-hoc caching needs when named profiles don't fit.
131. Keep `'use cache'` directive at the top of the module or function before imports (similar to `'use client'` semantics).
132. Use `cache()` plus `next: { tags: [...] }` on third-party fetches so you can revalidate them without refetching every time.
133. Avoid `unstable_cacheLife` and `unstable_cache` APIs; use stable `cacheLife` and `'use cache'` directive instead (Next.js 15+).
134. Detect `'unstable_cacheLife'` and `unstable_cache` via `rg` and migrate to `cacheLife` and `'use cache'` patterns.
135. Ensure `updateTag` and `revalidateTag` share identical tag strings; typos mean invalidation won't work.
136. Store tag string factories alongside query/mutation modules to avoid mismatches.
137. Document caching and invalidation flows per feature in `docs/` or feature README files.
138. Use detection commands to ensure `.route.ts` files do not reference `updateTag` or `refresh`.
139. Use detection commands to ensure `'use cache'` blocks include `cacheTag` or `cacheLife`.
140. Use detection commands to ensure `fetch` calls include `cache` options or `next.revalidate` to avoid implicit `no-store`.
141. Use detection commands to ensure `params`/`searchParams` references include `await`.
142. Use detection commands to ensure parallel route directories contain `default.tsx`.
143. Use detection commands to ensure Server Actions include `'use server'`.
144. Use detection commands to ensure Client Components with hooks include `'use client'` on line 1.
145. Use detection commands to ensure legacy Pages Router APIs (getServerSideProps, getStaticProps, etc.) are absent.
146. Use detection commands to ensure tag names aren't generic words like `data` or `cache`.
147. Use detection commands to ensure `fetch` calls supplying tags also set `cache` or `next.revalidate`.
148. Use detection commands to flag async Client Components (should never exist).
149. Use detection commands to flag `updateTag`/`refresh` usage outside `'use server'` files.
150. Use detection commands to flag `fetch` calls lacking `cache` or `next.revalidate` arguments.
151. Use detection commands to catch potential waterfalls by finding sequential `await` statements without `Promise.all`.
152. Use detection commands to ensure instrumentation (`instrumentation.ts`) exists in production apps.
153. Use detection commands to flag `experimental_ppr` usage; PPR is still experimental and should be avoided in prod.
154. Use detection commands to flag Edge runtime files calling `createClient` or other Node-only APIs (invalid on edge).
155. Use detection commands to flag single Suspense usage so teams add more granular boundaries.
156. Use detection commands to flag API routes lacking references to rate limiting utilities.
157. Use detection commands to ensure proxy or middleware includes CSP and security headers.
158. Use detection commands to ensure `'use cache'` modules mention `cacheTag` or `cacheLife`.
159. Use detection commands to ensure `updateTag` invalidations include hierarchical scope (record and list tags).
160. Use detection commands to ensure `revalidatePath` invocations pass `'page'` or `'layout'`.
161. Use detection commands to ensure `revalidateTag` invocations supply a cache profile (e.g., `'max'`, `'hours'`, custom name).
162. Keep CLI scripts (npm run lint/typecheck) integrated with detection commands so CI blocks noncompliant code.
163. Run `npm run typecheck` plus custom grep checks before every commit touching Next.js files.
164. Use `rg -q "cacheComponents:\\s*true"` in CI to ensure configs keep Cache Components enabled.
165. Add CI jobs failing if `middleware.ts` exists or `proxy.ts` is missing.
166. Use `find app -type d -name \"@*\"` in CI to verify `default.tsx` presence inside each slot directory.
167. Confirm `proxy.ts` attaches security headers; detection scripts should flag missing CSP or security headers.
168. Confirm `proxy.ts` handles authless requests with redirects or 401 responses as appropriate.
169. Keep `matcher` arrays tight to avoid unnecessary proxy overhead on static assets.
170. Document the `cacheTag` namespace per domain (appointments, salons, analytics, notifications, staff).
171. Keep `tags` helpers exported from shared modules for reuse by fetchers and mutation actions.
172. Use `revalidateTag('notifications', 'max')` for background refresh, reserving `updateTag` for immediate write-through.
173. Use `refresh()` in Server Actions like `markNotificationAsRead` to update client indicator badges instantly.
174. Use `revalidatePath('/business/appointments', 'page')` after appointment create/delete to refresh SSR list data.
175. Use `revalidateTag(\`appointment:${id}\`, 'max')` for background updates triggered by webhooks.
176. Use `revalidateTag('appointments', 'max')` for admin-level operations touching all records.
177. Use `cacheTag(\`widget:${businessId}\`)` inside cached widgets so `updateTag` can target them.
178. Keep `'use cache'` modules pure; do not call `createClient` or user-specific APIs inside cached code without careful scoping.
179. Use `cacheLife('analytics')` inside analytics fetchers so invalidation matches the configured profile.
180. Keep remote fetch TTLs (`next.revalidate`) aligned with cache profiles to avoid stale data drift.
181. Document fallback behavior when caches expire (SWR, TTL) so teams know user expectations.
182. Continue using Suspense skeletons to mask backend latency even when caching is enabled.
183. Use `router.prefetch` sparingly; rely on Next.js automatic prefetch for `<Link>` when visible.
184. Keep `<Link>` usage for navigation; use `router.push` only when interactions happen outside anchor contexts.
185. Use `router.replace` for silent filter updates so history entries stay manageable.
186. Combine `startTransition` with router updates when triggered inside Client Components to keep UI responsive.
187. Use `useRouter` inside client filters and pair with `use()` data to synchronize UI and query params.
188. Keep `URLSearchParams` logic encapsulated to avoid manual string concatenation mistakes.
189. After server writes, prefer `redirect('/path')` over `router.push` from client to avoid duplicate logic.
190. Keep detection commands for `redirect()` usage to ensure caches were invalidated before navigation.
191. Avoid `console.log` in production; rely on `logger` or telemetry for diagnostics.
192. Provide environment-specific logging levels via `LOG_LEVEL` env var for the pino logger.
193. Use `NextResponse` helpers to set JSON responses and headers rather than manual `Response`.
194. Keep `instrumentation.ts` in the project root so Next.js loads telemetry automatically.
195. Verify `instrumentation.ts` exports `register()` and conditionally imports `@vercel/otel`.
196. Keep `NEXT_OTEL_VERBOSE` toggled on locally to troubleshoot spans; reduce in production.
197. Use detection commands to ensure instrumentation file exists and is referenced.
198. Maintain a migration checklist verifying each Next.js upgrade requirement before bumping versions.
199. Review caching and invalidation flows whenever Next.js releases new cache APIs or changes semantics.
200. Cross-reference architecture, TypeScript, React, API, forms, UI, and auth rule files before implementing Next.js features.
201. Revisit this checklist whenever touching routing, caching, or Server Action logic to guarantee conformance.

## FORBIDDEN PATTERNS (Next.js 15+)

❌ **Never use these patterns:**

### Deprecated Caching APIs
- `unstable_cache()` → Use `'use cache'` directive with `cacheTag()` and `cacheLife()` instead
- `unstable_cacheLife()` → Use `cacheLife()` function (stable API in Next.js 15+)
- `middleware.ts` as a standalone file → Migrate to `proxy.ts` with `'use server'`

### Legacy Pages Router (Never in App Router)
- `getStaticProps` → Use `export const revalidate` with Server Components
- `getServerSideProps` → Use dynamic Server Components with no caching
- `getStaticPaths` → Use `generateStaticParams` in App Router
- `res.revalidate()` in API routes → Use `revalidateTag()` in Server Actions/Route Handlers

### Anti-patterns
- Async Client Components (`async function Component()`) → Only Server Components can be async
- `cache: 'force-cache'` with no `next.tags` → Add `next: { tags: ['meaningful-tag'] }` for invalidation
- Uncached fetches (`fetch(url)` without `cache` or `next.revalidate`) → Explicitly set `cache: 'no-store'` or `cache: 'force-cache'` + tags
- Single page-level `<Suspense>` wrapper → Use nested Suspense for granular streaming
- `updateTag()` in route handlers → Only in Server Actions or specialized server endpoints
- `revalidatePath()` for every mutation → Use tag-based invalidation unless full page refresh needed
- Mixing `updateTag` and `revalidateTag` for same data → Choose one strategy per resource
- `refresh()` after every Server Action → Only when client indicators need instant update (badges, favorites)

### Caching Anti-patterns
- Generic tag names (`'data'`, `'cache'`, `'items'`) → Use hierarchical names like `'appointments'`, `'appointment:${id}'`
- Forgetting to `await params` → Always `await params` and `searchParams` in Server Components, `generateMetadata`, and route handlers
- Storing request-specific data in `'use cache'` blocks → Never use cookies/headers inside `'use cache'`; pass them as params
- Not documenting cache invalidation strategy → Document which actions invalidate which tags per feature

### Image Configuration Failures
- Omitting `remotePatterns` or `localPatterns` → Configure allowed image sources in `next.config.ts`
- Not setting `minimumCacheTTL` → Set `minimumCacheTTL: 31536000` (1 year) for immutable CDN images
- Using deprecated `domains` array → Use `remotePatterns` instead (deprecated since Next.js 12.3)

## DETECTION COMMANDS (Run in CI)

```bash
# ✅ Verify Cache Components are enabled
rg -q "cacheComponents:\s*true" next.config.ts || echo "FAIL: Cache Components not enabled"

# ✅ Flag deprecated unstable_cache and unstable_cacheLife
rg "unstable_cache|unstable_cacheLife" app/  && echo "FAIL: Found unstable_cache/unstable_cacheLife"

# ✅ Ensure 'use cache' blocks have cacheTag or cacheLife
rg -A 3 "'use cache'" app/ | rg -c "cacheTag|cacheLife" || echo "WARN: 'use cache' blocks may be missing tags"

# ✅ Flag async Client Components (syntax error - will fail typecheck)
rg "async function.*\(\)" app/ | grep "use client" && echo "FAIL: Found async Client Component"

# ✅ Ensure fetch calls have cache option or next.revalidate
rg "fetch\(" app/ | grep -v "cache:|next.revalidate" && echo "WARN: Uncached fetch found"

# ✅ Verify all params/searchParams are awaited
rg "params\.|searchParams\." app/ | grep -v "await params\|await searchParams" && echo "WARN: Unawaited params/searchParams"

# ✅ Flag updateTag outside 'use server' context
rg "updateTag\(" app/ --type ts | grep -v "'use server'" && echo "WARN: updateTag outside Server Action"

# ✅ Verify middleware.ts doesn't exist (should be proxy.ts)
test -f middleware.ts && echo "FAIL: middleware.ts found - migrate to proxy.ts"
test ! -f proxy.ts && echo "FAIL: proxy.ts missing"

# ✅ Ensure tag names are not generic
rg "tags:\s*\['(data|cache|items)'" app/ && echo "FAIL: Found generic tag names"

# ✅ Flag single page-level Suspense (look for one <Suspense> per file)
find app -name "page.tsx" -exec grep -l "Suspense" {} \; | while read f; do
  count=$(grep -o "<Suspense" "$f" | wc -l)
  [ $count -lt 2 ] && echo "WARN: $f has only $count Suspense boundary (consider nested)"
done

# ✅ Verify parallel route defaults exist
find app -type d -name "@*" | while read dir; do
  test ! -f "$dir/default.tsx" && echo "FAIL: $dir missing default.tsx"
done

# ✅ Ensure Server Actions have 'use server'
find app -name "*.ts" -path "*/actions/*" -exec grep -L "'use server'" {} \; | grep -v ".test.ts" && echo "FAIL: Server Action missing 'use server'"

# ✅ Ensure Client Components with hooks have 'use client' on line 1
rg -l "useRouter|useState|useEffect" app/ --type tsx | while read f; do
  head -1 "$f" | grep -q "'use client'" || echo "WARN: $f may need 'use client'"
done

# ✅ Flag Pages Router APIs (should not exist in App Router)
rg "getStaticProps|getServerSideProps|getStaticPaths" app/ && echo "FAIL: Found deprecated Pages Router APIs"

# ✅ Verify revalidateTag calls include profile parameter
rg "revalidateTag\([^)]*\)" app/ | grep -v "'max'|'hours'|custom" && echo "WARN: revalidateTag missing profile parameter"

# ✅ Ensure 'use cache' directive is at top of module
rg -B 5 "'use cache'" app/ | rg "^[^']*import" && echo "WARN: 'use cache' not at module top"
```

### Running Detection Suite
```bash
# Run all detections and fail on FAIL (not WARN)
npm run lint
npm run typecheck
./scripts/verify-nextjs-rules.sh  # Custom script with above commands
```

## IMAGE OPTIMIZATION GUIDELINES

### Configuration (`next.config.ts`)
```typescript
const nextConfig: NextConfig = {
  images: {
    // Allow local image paths
    localPatterns: [
      {
        pathname: '/public/images/**',
        search: '',
      },
    ],

    // Allow remote image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        port: '',
        pathname: '/assets/**',
        search: '',
      },
    ],

    // Cache optimized images for extended period
    minimumCacheTTL: 31536000, // 1 year (immutable)
  },
}
```

### Best Practices
- Use `localPatterns` to restrict local image paths
- Use `remotePatterns` with specific patterns to prevent arbitrary image optimization
- Set `minimumCacheTTL` high (31536000 seconds = 1 year) for static/immutable images
- Tag image fetches with meaningful names for invalidation: `next: { tags: ['product-images', `product:${id}`] }`
- Use `<Image priority />` only for above-fold images to avoid layout shift
- Provide `width` and `height` to prevent Cumulative Layout Shift (CLS)
- Use responsive images with `sizes` prop for different breakpoints

## METADATA API PATTERNS

### Server-side Metadata Generation
```typescript
import { Metadata } from 'next'
import { cache } from 'react'

// Deduplicate DB calls between metadata and page
const getPost = cache(async (id: string) => {
  return db.query.posts.findFirst({ where: eq(posts.id, id) })
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.imageUrl }],
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id) // Reuses cached result

  return <article>{post.content}</article>
}
```

### Key Points
- Always `await params` before passing to queries
- Use `cache()` to deduplicate shared data fetches
- Set `next: { tags: ['metadata:post:${id}'] }` on metadata-critical fetches
- Invalidate metadata via `revalidateTag('metadata:post:${id}', 'max')` when post updates

## CROSS-REFERENCES

This rule file coordinates with:

| File | Focus | Key Coordination |
|------|-------|-----------------|
| **01-architecture.md** | File structure, routing fundamentals | Caching API fundamentals, proxy migration, runtime selection |
| **03-react.md** | React 19, Server/Client Components | Suspense streaming, cache() deduplication, use() patterns |
| **05-supabase.md** | Database queries, RLS, connection pooling | Fetch tags for DB queries, cache invalidation strategies |
| **06-api.md** | Server Actions, Route Handlers | updateTag/revalidateTag, revalidatePath in actions, rate limiting |
| **09-auth.md** | Authentication, session management | Auth state caching, cookie handling in Server Actions |

**When implementing Next.js features, cross-reference these files in order:**
1. Check 01-architecture.md for routing structure decisions
2. Check 03-react.md for component composition patterns
3. Check 06-api.md for Server Action caching strategies
4. Check 05-supabase.md for database query patterns
5. Check this file (04-nextjs.md) for caching and performance orchestration
6. Check 09-auth.md for authentication state management

**Recommended supporting rule files (under development):**
- `11-performance.md` - Caching metrics, Core Web Vitals monitoring, performance budgets
- `12-security.md` - CSP headers, CORS, security headers integration with Next.js
- `14-logging.md` - Request logging, structured logging, OpenTelemetry setup
- `15-database-patterns.md` - Connection pooling, query optimization, monitoring
