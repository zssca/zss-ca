# 05-supabase Compact Rules
Source: docs/rules/05-supabase.md
Created: November 10, 2025
Last Updated: November 10, 2025
Supabase Version: 2.78.0+
Stack: PostgreSQL 15+, PostgREST 12+, Realtime 2.x, pgvector 0.7+

## Summary
- Enforce Supabase RLS-first schema design with optimized policies, indexes, and security-definer functions.
- Manage migrations, type generation, and type-safe queries through structured workflows and Server Actions.
- Implement secure realtime/broadcast patterns with private channels, connection pooling, monitoring, read replicas, and caching.
- Leverage vector search (pgvector, HNSW indexes, binary_quantize), hybrid search (full-text + vector), and AI features.
- Apply detection commands to catch anti-patterns (missing RLS, deprecated APIs, unwrapped auth.uid, direct connections).
- Coordinate Supabase features with Next.js Server Components, caching, and validation pipelines.
- **Security**: See **12-security.md** for SQL injection prevention, input validation, RLS enforcement, sensitive data handling, and audit logging.

## Checklist
1. Enable RLS immediately after creating any table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
2. Wrap `auth.uid()` and similar helpers in `SELECT` inside policies (`(SELECT auth.uid())`) for plan caching.
3. Target RLS policies to specific roles (`TO authenticated`, `TO anon`) to avoid unnecessary evaluation.
4. Create B-tree indexes on every column referenced in RLS filters (`user_id`, `tenant_id`, etc.).
5. Prefer `ANY(ARRAY(...))` or `IN (SELECT ...)` over joins in policy predicates for performance.
6. Encapsulate complex access logic inside `SECURITY DEFINER` functions located in private schemas.
7. Set `search_path = ''` within security-definer functions to prevent SQL injection via search path.
8. Always add explicit `.eq()` or `.in()` filters in queries even when RLS enforces the same constraint.
9. Use Supabase views for read paths to centralize joins and ensure consistent filtering.
10. Create policies for both SELECT and INSERT/UPDATE/DELETE as needed, each with appropriate `USING`/`WITH CHECK`.
11. Store multi-tenant context (business_id, tenant_id) explicitly in tables and RLS policies.
12. Use `supabase migration new <name>` for every schema change and commit migration files to Git.
13. Run `supabase db reset` locally after writing migrations to test rebuilds from scratch.
14. Run `supabase gen types typescript --project-id <ref> > lib/types/database.types.ts` after every migration.
15. Never edit `lib/types/database.types.ts` manually; regenerate instead.
16. Use schema-qualified table names in Supabase queries (`.schema('scheduling').from('appointments')`).
17. Export TypeScript aliases from generated types for readability (`type Appointment = Database['scheduling']['Tables']['appointments']['Row']`).
18. Use `cache()` when creating Supabase clients server-side to deduplicate per-request instantiations.
19. Validate every mutation input with Zod (or equivalent) before hitting Supabase.
20. Guard Server Actions with `supabase.auth.getUser()` and throw/return errors on missing user.
21. Use `supabase.auth.getUser()` (not `getSession()`) for authorization context in Server Components.
22. Keep Supabase service-role keys server-only; never embed them in client bundles.
23. Use `supabase.auth.getSession()` only for UI hints, never for authorization decisions.
24. Insert records using schema-qualified tables and explicitly set tenant IDs derived from the authenticated user.
25. Use `revalidatePath` or caching APIs after mutations to keep Next.js data fresh.
26. Restrict client components to read-only operations; perform writes via Server Actions or RPCs.
27. Use Next.js `cacheLife`/`cacheTag` or `'use cache'` with Supabase queries to control caching.
28. Create Supabase views (e.g., `appointments_view`) joining normalized tables for easier querying.
29. Provide `GRANT SELECT ON view TO authenticated` plus view-level policies if needed.
30. Keep RLS logic out of client code by embedding restrictions within views and policies.
31. Use `SECURITY DEFINER` functions to compute expensive aggregates while ensuring user authorization inside the function.
32. Return JSON objects from functions to map cleanly to TypeScript types.
33. Use `rpc('function_name', params)` to call Postgres functions securely from TypeScript.
34. Add indexes matching common query patterns (e.g., `(business_id, status, start_time)`).
35. Use partial indexes (e.g., `WHERE status = 'pending'`) for frequently filtered subsets.
36. Keep indexes aligned with column order used in filters for optimal planner use.
37. Write pgTAP tests for critical RLS policies and wrap them in transactions for isolation.
38. Use helper functions like `tests.authenticate_as(email)` within pgTAP to simulate users.
39. Run pgTAP suites via `supabase test db` (or similar) before deploying sensitive policy changes.
40. Document pgTAP expectations (who can read/write) to communicate policy intent.
41. Use Supabase realtime broadcast channels with `{ config: { private: true } }` instead of deprecated `postgres_changes`.
42. Create triggers calling `realtime.send` to broadcast row changes to channel topics (`room:${id}:messages`).
43. Add RLS policies to `realtime.messages` so only authorized users can publish/subscribe.
44. Filter realtime channels server-side (`filter: "business_id=eq.${businessId}"`) to avoid leaking other tenant data.
45. Clean up realtime subscriptions in `useEffect` cleanup functions (call `supabase.removeChannel`).
46. Use typed payload casts when updating local realtime state for type safety.
47. Use `.explain({ analyze: true })` on queries (dev only) to inspect execution plans and confirm index usage.
48. Restrict `.explain()` access in production by whitelisting IPs via pre-request functions.
49. Enable `pgrst.db_plan_enabled` for the authenticator role in dev environments to allow `.explain()`.
50. Create connection pooling strategies: transaction mode (port 6543) for serverless, session mode (5432) for persistent apps, direct connections for migrations.
51. Append `?pgbouncer=true` to Prisma datasource URLs when using transaction poolers to disable prepared statements.
52. Always keep a direct connection URL for migrations (`DIRECT_URL`) even if the app uses pooler endpoints.
53. Monitor `pg_stat_activity` to inspect active/idle connections, client IPs, and long-running queries.
54. Terminate stale idle connections older than a threshold (e.g., 1 hour) to free slots when necessary.
55. Track connection utilization metrics (total/active/idle/max) via `pg_stat_activity`.
56. Build RPC helpers like `get_connection_stats()` returning JSON for monitoring dashboards.
57. Choose read replicas via load balancer endpoints for global read-heavy workloads.
58. Avoid read-after-write on replicas; read newly inserted data from the primary to guarantee consistency.
59. Monitor replication lag on replicas with `now() - pg_last_xact_replay_timestamp()`.
60. Route analytics queries to replicas when they can tolerate eventual consistency.
61. Keep writes (INSERT/UPDATE/DELETE) pointed at the primary database endpoint.
62. Annotate `.env` with `SUPABASE_REPLICA_*` URLs for replica clients and document their usage.
63. Use load balancer endpoints for GET-heavy public pages to auto-route to nearest replicas.
64. Keep analytics RPCs running on replicas to reduce primary load.
65. Validate connection mode decisions with the provided decision tree before deploying new services.
66. Avoid direct connections from serverless environments; they scale poorly and exhaust connection limits.
67. Use supavisor transaction mode for Supabase Edge Functions and Next.js Server Actions.
68. Use session mode for long-lived app servers where prepared statements are needed.
69. Reserve direct connections (db.projectref.supabase.co) for migrations, `supabase db push`, and `pg_dump`.
70. Document connection credentials (transaction URL, session URL, direct URL) in secure secrets management.
71. Enforce storage operations via Supabase Storage RLS policies; never bypass them with service keys in client code.
72. Always check `error` objects from Supabase responses; log and throw when appropriate.
73. Use `.returns<Type>()` to enforce expected result shapes on Supabase queries.
74. Use `.order(column, { ascending: true })` with indexes to guarantee deterministic ordering.
75. Use `.range(start, end)` for pagination, not `.offset()`, to avoid performance regressions.
76. Always specify columns in `.select()` rather than using `*` to reduce payload sizes.
77. Use schema-specific `.schema('schema')` calls before `.from()` for tables outside `public`.
78. Keep read operations using views (e.g., `appointments_view`) to avoid repeating join logic in code.
79. Use `.rpc()` for server-side computed data instead of replicating heavy aggregates in application code.
80. Document each RPC’s security model (arguments validated, RLS bypass strategies) in migrations or docs.
81. Always call Supabase from Server Actions with `'use server'` to avoid shipping service keys to the browser.
82. Use `cache()` or `'use cache'` plus `cacheTag` to deduplicate expensive read queries inside Server Components.
83. Keep Supabase queries within backend-only modules to prevent bundling `@supabase/ssr` in the client.
84. Validate that `supabase.auth.getUser()` returns a user before performing any data access.
85. Throw errors or return structured error objects from Server Actions when Supabase operations fail.
86. Use Next.js caching APIs (updateTag, revalidateTag, revalidatePath) after Supabase writes for data freshness.
87. Combine Supabase writes with `refresh()` when UI state in Client Components must update instantly.
88. Use `schema('scheduling')` consistently in code to prevent cross-schema name collisions.
89. Normalize schema names by domain (scheduling, organization, catalog, engagement, identity) as per architecture rules.
90. Use view naming conventions (`table_view`) and store them in `public` for easier access control.
91. Keep Supabase `storage` buckets behind RLS policies just like database tables.
92. Always confirm `storage` operations occur on the server when mutated (uploads, deletes).
93. Adopt the new broadcast API for realtime; refactor any `postgres_changes` listeners to `channel().on('broadcast')`.
94. Ensure broadcast channel names encode tenant context (`room:${id}:messages`) to enforce filtering.
95. Create triggers (e.g., `notify_table_changes`) to broadcast database writes to realtime channels.
96. Add RLS policies to `room_members` or similar tables so broadcast functions can verify membership.
97. Use `security definer` functions to gather tenant-specific IDs (e.g., `user_teams()`) for RLS caching.
98. Return arrays from helper functions and use `ANY()` to test membership inside policies.
99. Use `WITH CHECK` clauses to ensure inserts/updates respect tenant boundaries.
100. Use `team_id = ANY(ARRAY(SELECT user_teams()))` style statements for policy clarity.
101. Add indexes on junction tables (e.g., `room_members(user_id, room_id)`) to support membership checks.
102. Use Supabase CLI `supabase start` or `supabase db reset` to run migrations locally before pushing.
103. Store Supabase project ref and service role key in `.env.local` but never in VCS.
104. Link to production projects via `supabase link --project-ref <REF>` before running `supabase db push`.
105. Keep migrations idempotent by using `IF NOT EXISTS` clause where possible.
106. Document migration order dependencies using comments inside SQL files.
107. Use `ALTER ROLE authenticator SET ...` to toggle PostgREST settings when enabling explain or guards.
108. Guard `.explain()` endpoints using pre-request functions filtering by IP or header.
109. Use `pg_terminate_backend` carefully when cleaning idle connections; avoid terminating Supabase internal roles.
110. Build dashboards showing connection utilization and replication lag to detect scaling issues early.
111. Confirm replica usage by checking environment for `SUPABASE_LOAD_BALANCER_URL` or related variables.
112. Monitor `pg_stat_activity` to ensure replicas aren’t being used for writes (should only show SELECT).
113. Ensure heavy analytics RPCs run on replicas to prevent primary starvation.
114. Keep read replica endpoints per region documented so edge functions pick the closest one.
115. Always route writes and read-after-write operations to the primary to avoid stale data.
116. Use Next.js detection commands to confirm `.getSession()` isn’t used for auth decisions.
117. Use detection commands to confirm `auth.role()` or `auth.email()` aren’t present in policies.
118. Use detection commands to find `.body` usage on responses (should use `.data`).
119. Use detection commands to find `.offset()` usage and replace with `.range()`.
120. Use detection commands to flag old `login/logout/signup` method calls (migrate to new auth API).
121. Use detection commands to locate policies lacking `TO authenticated/anon` role targeting.
122. Use detection commands to locate queries lacking `.eq`, `.in`, `.filter`, or `.match` clauses.
123. Use detection commands to ensure `'use server'` appears in mutation files.
124. Use detection commands to ensure `'use cache'` modules include `cacheTag` or `cacheLife`.
125. Use detection commands to ensure `.schema(` usage occurs only where necessary (avoid direct schema table access elsewhere).
126. Run detection commands to ensure `.postgres_changes` references have been removed.
127. Run detection commands to ensure `postgres.q` direct connection strings (port 5432) are not used in serverless contexts.
128. Run detection commands to ensure `pg_last_xact_replay_timestamp` is referenced if replicas are configured.
129. Use detection commands to flag `.insert().select('*')` combos lacking `.single()` when expecting one row.
130. Use detection commands to flag `console.log` of Supabase errors lacking structured logging.
131. Use detection commands to ensure RPC names follow snake_case and exist in migrations.
132. Use detection commands to spot functions lacking `SECURITY DEFINER` where needed.
133. Use detection commands to confirm `search_path` is reset in security definer functions.
134. Use detection commands to ensure `CREATE POLICY` statements exist for each accessible table.
135. Use detection commands to ensure connection strings include `?pgbouncer=true` when using transaction poolers.
136. Use detection commands to ensure read replicas are not referenced in write contexts.
137. Use detection commands to ensure `supabase.auth.getUser()` is awaited before use.
138. Use detection commands to ensure `supabase` client creation happens inside server-only modules.
139. Use detection commands to ensure `supabase` browser clients aren’t used in server modules.
140. Use detection commands to ensure `postgres` direct URLs only appear in CLI scripts or config, not runtime code.
141. Restrict broadcast topics to include tenant context (IDs) so clients only receive relevant messages.
142. Ensure triggers calling `realtime.send` supply sanitized inputs (no unsanitized user data).
143. Deploy security definer functions with `EXECUTE FUNCTION` triggers for consistent behavior.
144. Keep `notify_table_changes` triggers named clearly and invoked for INSERT/UPDATE/DELETE events.
145. Monitor broadcast triggers for performance; keep payloads minimal (IDs plus necessary data).
146. Use partial indexes for queue tables (e.g., `WHERE status = 'pending'`) to speed worker scans.
147. Analyze `.explain()` results to ensure indexes are used after each significant schema change.
148. Document `cacheLife` names and TTLs so Supabase queries align with Next.js caching expectations.
149. Group migrations by domain (scheduling, catalog) to keep SQL files manageable.
150. Annotate migrations with comments describing the intent of policies, functions, or indexes.
151. Use `supabase migration list` to confirm remote migrations applied in correct order.
152. Use `supabase migration repair` only when absolutely necessary and document reasons.
153. Use `supabase db pull` cautiously, ensuring schema merges don’t overwrite intentional changes.
154. Keep Supabase CLI updated to the latest version to leverage new commands and bug fixes.
155. Use `supabase functions deploy` for edge functions that interact with Supabase, ensuring proper connection mode.
156. Use environment-specific Supabase URLs/keys (`.env.local`, `.env.production`) and never commit secrets.
157. Keep serverless function env vars referencing pooler endpoints, not direct DB hosts.
158. Use `supabase` JS clients version 2.78.0+ to access broadcast and `.explain()` features.
159. Update server/client code to handle `.data` instead of `.body` in Supabase responses.
160. Use `.single()` or `.maybeSingle()` when expecting one record to catch inconsistencies early.
161. Keep `.select()` column lists minimal to avoid overfetching sensitive data.
162. Use `.returns<Type>()` for every query to preserve TypeScript inference even with simple selects.
163. Throw or return structured errors when Supabase `.error` objects are present; never silently ignore them.
164. Use `console.error` plus structured logging for Supabase failures during development; switch to logger in production.
165. Combine `.eq()` filters with indexes to ensure PostgreSQL can use index scans under RLS policies.
166. Use `security invoker` only when functions should respect the caller’s policies; default to definer for policy helpers.
167. Keep functions referencing `auth.uid()` wrapping it in `SELECT` for caching and plan reuse.
168. Avoid correlated subqueries inside RLS policies; prefer array membership checks for speed.
169. Use `TEAM_ID IN (SELECT ...)` patterns rather than join-based policies to reduce planner overhead.
170. Avoid `raw_app_meta_data` when referencing user metadata in RLS; use `auth.jwt()` JSON extraction.
171. Store supabase auth metadata claims (roles, plan) inside `auth.jwt()` and access via `->>` in policies.
172. Use `TO authenticated` or `TO anon` rather than `USING auth.role()`; the latter is deprecated.
173. Avoid `auth.email()` in policies; use `auth.jwt() ->> 'email'` if email comparison needed.
174. Refrain from relying on middleware for authorization (known CVE); perform checks in data layer.
175. Use middleware only for session refresh operations (`updateSession`), not permission checks.
176. Store tenant membership tables (team_user, room_members) in private schemas with their own policies.
177. Use `SECURITY DEFINER` membership functions to avoid repeated join costs in policies.
178. Add `CREATE INDEX ... USING btree (tenant_id, ...)` patterns to support multi-tenant filtering.
179. Use `ANY(ARRAY(SELECT fn()))` pattern for membership lists to leverage caches.
180. Keep security-definer functions short, validated, and wrapped with `SET search_path = ''`.
181. Use `RETURN QUERY` or `json_build_object` within functions for optimized output.
182. Keep `rpc` argument names snake_case and match SQL function signatures exactly.
183. Validate RPC input types (UUID, numeric) before calling to avoid Postgres errors.
184. Use `supabase.rpc('function_name', { arg_name: value })` with typed results to stay type-safe.
185. For read replicas, educate teams about eventual consistency and update docs with mitigation strategies.
186. Monitor replication lag metrics and alert when exceeding acceptable thresholds.
187. Document read-after-write fallback strategies (read from primary) for features requiring immediate consistency.
188. Keep CLI detection commands up to date as Supabase releases new APIs or deprecates old ones.
189. Include detection commands in documentation so new contributors routinely run them.
190. Create Git pre-commit hooks running critical detection commands (missing RLS, deprecated APIs).
191. Schedule periodic audits of RLS policies using `pg_policies` queries to ensure coverage.
192. Schedule periodic audits of indexes to ensure they still align with usage patterns.
193. Keep Supabase SSR helpers (`@supabase/ssr`) up to date; auth-helpers packages are deprecated.
194. Use `@supabase/ssr` cookie-based auth to maintain sessions in Next.js Server Components.
195. Avoid trusting middleware-managed sessions; always ask Supabase for the current user server-side.
196. Carefully manage Supabase Realtime usage; enable only for features requiring live updates to save bandwidth.
197. Monitor realtime channel counts and payload sizes to prevent overuse.
198. Use `supabase.removeChannel` on unmount to stop unnecessary subscriptions.
199. Cross-reference related rules (architecture, TypeScript, Next.js, API, forms, UI, auth) before writing Supabase code.
200. Revisit this checklist whenever altering schemas, policies, migrations, or Supabase integration code paths.

## RLS Performance Optimization (New in v2.78.0+)

201. Avoid joins in RLS policies; use `IN (SELECT ...)` subqueries instead to reduce planner overhead (99.78% improvement possible).
202. Rewrite policy predicates to filter client-side IDs from subqueries instead of joining to the source table.
203. Example: `team_id IN (SELECT team_id FROM team_user WHERE user_id = (SELECT auth.uid()))` instead of joining.
204. Wrap function calls like `auth.uid()`, `auth.jwt()`, and custom helpers in `(SELECT ...)` for initPlan caching.
205. Wrapped functions are evaluated once per statement, not per row, significantly improving RLS performance.
206. Only wrap row-invariant functions (functions whose result doesn't depend on the current row).
207. Test RLS policy performance with `.explain({ analyze: true })` in development before deploying.
208. Use `EXPLAIN ANALYZE` with `set session role authenticated` to simulate RLS evaluation and measure costs.
209. Monitor RLS query plans to ensure indexes are used (Index Scan, not Seq Scan).

## Vector Search and AI Features (New in v2.78.0+, pgvector 0.7+)

210. Create HNSW indexes for vector embeddings: `CREATE INDEX ON documents USING hnsw (embedding vector_ip_ops)`.
211. Use HNSW indexes with `vector_ip_ops` (inner product) for normalized embeddings, `vector_cosine_ops` for unnormalized.
212. Set HNSW `lists` parameter to `rows / 1000` for optimal performance on smaller datasets.
213. Create GIN indexes for full-text search: `CREATE INDEX ON documents USING gin(fts)`.
214. Implement hybrid search combining full-text (BM25) and vector similarity for better relevance.
215. Leverage `binary_quantize(vector)::bit()` to compress vectors for fast pre-selection before full-precision search.
216. Create bit vector indexes: `CREATE INDEX ON embedding USING hnsw ((binary_quantize(vector)::bit(1000)) bit_hamming_ops)`.
217. Use layered vector search: first search on bit-quantized vectors, then re-rank using full-precision embeddings.
218. Example: `order by binary_quantize(vector)::bit(3) <~> binary_quantize(query) limit 20` then re-rank on full vector.
219. Store embeddings from OpenAI, Cohere, or other LLMs in `vector` columns with appropriate dimensions.
220. Create RPC functions for semantic search to encapsulate matching logic and apply RLS policies automatically.
221. Example RPC: `match_documents(query_embedding vector, match_count int, match_threshold float)`.
222. Use `pgvector` operations: `<->` (L2 distance), `<#>` (inner product), `<=>` (cosine distance).
223. Document vector dimension and similarity metric used (L2, cosine, inner product) for consistency.
224. Create partial indexes on vector searches: `CREATE INDEX ON documents USING hnsw (embedding vector_ip_ops) WHERE status = 'published'`.
225. Monitor vector search performance; HNSW indexes use memory; scale accordingly.
226. Implement adaptive retrieval: two-pass search using dimension-reduced bit vectors then full vectors for speed.
227. Test vector search with `.explain({ analyze: true })` to confirm HNSW index usage.
228. For large-scale semantic search, use Supabase Edge Functions with caching to avoid repeated embedding generation.

## Realtime Broadcast and Presence Improvements (New in v2.78.0+)

229. Use `channel('room:${id}:messages', { config: { private: true } })` for private broadcast channels requiring RLS.
230. Private broadcast channels enforce RLS policies on `realtime.messages` table; public channels do not.
231. Never use deprecated `postgres_changes` listeners; migrate all subscriptions to `channel().on('broadcast')`.
232. Encode tenant and access context in channel topic names: `room:${roomId}:messages`, `user:${userId}:notifications`.
233. Create RLS policies on `realtime.messages` to control broadcast access based on channel topic membership.
234. Example: `CREATE POLICY "authenticated can receive broadcast" ON realtime.messages FOR SELECT USING (EXISTS (SELECT 1 FROM rooms_users WHERE user_id = auth.uid() AND topic = realtime.topic()))`.
235. Create junction tables (`rooms_users`, `room_members`) with RLS to verify broadcast permissions.
236. Use triggers calling `realtime.send()` to broadcast row changes: `NOTIFY realtime, 'broadcast:${channel}:${event}'`.
237. Enable realtime logging with `log_level: 'info'` in client options for debugging WebSocket connections.
238. Configure custom `reconnectAfterMs` (default 1000) to tune reconnection behavior for slow/intermittent networks.
239. Monitor realtime channel counts and payload sizes; disable broadcast for features not requiring live updates.
240. Call `supabase.removeChannel()` on component unmount to prevent subscription leaks.
241. Use realtime presence tracking for collaborative features: track user cursor position, online status, etc.
242. Structure presence payloads with minimal data (user_id, online_status) to reduce bandwidth.
243. Create HNSW/GIN indexes on junction tables used for broadcast authorization checks.

## Storage and Caching Improvements (New in v2.78.0+)

244. Implement cache-first pattern for generated assets: check storage before generating new content.
245. Store generated files in Supabase Storage with appropriate TTLs: `cacheControl: '86400'` for 24-hour cache.
246. Use `cacheControl` headers to enable CDN caching of public files in storage buckets.
247. Create storage RLS policies enforcing access control; never bypass with service keys in client code.
248. Example: `CREATE POLICY "users can read own avatars" ON storage.objects USING (bucket_id = 'avatars' AND (storage.foldername(name))[1]::uuid = auth.uid())`.
249. Monitor connection SSL info using `pg_stat_ssl` joined with `pg_stat_activity` for security audits.
250. Query SSL connections: `SELECT pid, ssl, datname, usename FROM pg_stat_ssl JOIN pg_stat_activity ON pg_stat_ssl.pid = pg_stat_activity.pid`.
251. Ensure all production Supabase connections use SSL (default in Supabase, but verify custom connections).

## Connection Management and Pooling Improvements (New in v2.78.0+)

252. Use `supavisor` transaction mode (port 6543) for serverless functions and Edge Functions.
253. Avoid `pg_sleep()` queries; they block connections. Use async operations or scheduled tasks instead.
254. Monitor connection utilization: `SELECT count(*) FROM pg_stat_activity WHERE state != 'idle'`.
255. Document connection modes in `.env`: `DATABASE_URL_TRANSACTION`, `DATABASE_URL_SESSION`, `DATABASE_URL_DIRECT`.
256. Always keep a `DIRECT_URL` separate from pooler endpoints for migrations and `pg_dump`.
257. Test connection pooling mode decisions before scaling; ensure app handles connection limits gracefully.
258. For read replicas, verify replica endpoints accept only `SELECT` queries, not writes.
259. Monitor replication lag with `now() - pg_last_xact_replay_timestamp()` on replica to detect stale data.
260. Route analytics and heavy aggregates to replicas; route writes always to primary.

## Type Safety and Client SDK (v2.78.0+)

261. Update to Supabase JS client v2.78.0+ to access `.explain()` and broadcast improvements.
262. Use `.returns<Type>()` on all queries to preserve TypeScript inference and catch type mismatches.
263. Use `.single()` when expecting exactly one row; `.maybeSingle()` when zero-or-one is acceptable.
264. Validate `.error` before accessing `.data`; never silently ignore Supabase errors.
265. Use structured logging (JSON) for Supabase failures in production; avoid `console.log` of error objects.

## Query Optimization (New in v2.78.0+)

266. Always add explicit filters (`.eq()`, `.in()`, `.lt()`, etc.) to queries, even when RLS enforces same constraint.
267. Explicit filters help Postgres construct better plans despite RLS policy duplication.
268. Use `.range(start, end)` for pagination instead of deprecated `.offset()` to avoid full table scans.
269. Specify columns in `.select()` rather than `*` to reduce payload and avoid overfetching sensitive data.
270. Use views (e.g., `appointments_view`) for read paths to centralize joins and ensure consistent RLS filtering.
271. Prefer `.rpc()` for server-side computed data; avoid replicating heavy aggregates in application code.
272. Use partial indexes on frequently filtered subsets: `CREATE INDEX ON queue USING btree (status) WHERE status = 'pending'`.
273. Test queries with `.explain({ analyze: true })` to confirm index usage and measure execution time.
274. Combine full-text search (BM25) with vector search for hybrid ranking when relevance is critical.

## Detection Commands and Audit

275. Run: `rg "postgres_changes" --type ts --type tsx` to find deprecated realtime listeners (remove all).
276. Run: `rg "getSession\(\)" lib/supabase --type ts` to ensure only `getUser()` is used for auth decisions.
277. Run: `rg "\.offset\(" lib/supabase --type ts` to find deprecated pagination (replace with `.range()`).
278. Run: `rg "auth\.email\(\)|auth\.role\(\)" docs/sql/policies --type sql` to find deprecated policy patterns.
279. Run: `rg "TO\s+public|USING\s+true" docs/sql/policies --type sql` to find overly permissive policies.
280. Run: `rg "pool.*false|pgbouncer.*false" --type ts --type tsx` to find disabled pooling (add `?pgbouncer=true`).
281. Run: `pg_dump -U postgres -h localhost -s supabase_db | grep -E "POLICY|INDEX ON.*vector"` to audit RLS and vector indexes.
282. Run: `SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0` to find unused indexes.
283. Run: `SELECT rolname, usecanlogin FROM pg_roles WHERE rolname LIKE 'authenticator'` to verify role configuration.
284. Run: `SELECT schemaname, tablename, tablespace FROM pg_tables WHERE tablename LIKE '%profile%'` to find tables needing RLS.
285. Run periodically: `supabase db list --linked` then `supabase migration list` to verify migrations applied in correct order.
286. Audit vector indexes: `SELECT indexname FROM pg_indexes WHERE indexdef LIKE '%hnsw%'` to confirm vector optimization.
287. Monitor pg_stat_statements for slow queries: `SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10`.
