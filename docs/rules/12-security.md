# 12-security Compact Rules

**Last Updated:** November 10, 2025
**Stack Version:** Next.js 16, React 19, Supabase, Zod, Tailwind, TypeScript
**Reference:** OWASP Top 10 2024, CWE/SANS Top 25

## Recent Updates (2024/2025)

- **A01:2021 - Broken Access Control** remains #1 vulnerability; focus on server-side authorization checks
- **A03:2021 - Injection** (includes SQL, Command, LDAP, XXE); parameterized queries mandatory
- **A07:2021 - Cross-Site Scripting (XSS)**; strict CSP + input validation + output encoding
- **A08:2021 - Software and Data Integrity Failures**; verify dependencies, sign commits
- **OWASP 2024 Update**: API security, authentication, sensitive data exposure remain critical

---

## Summary

Security is not optional. Every application must implement:

- **Input validation & sanitization** on all user-controlled data (forms, URLs, APIs)
- **Output encoding** to prevent XSS (HTML escaping, JavaScript context escaping)
- **Parameterized queries** for all database operations (never string concatenation)
- **Content Security Policy (CSP)** headers to mitigate XSS and data injection
- **CSRF protection** via Server Actions (automatic) and tokens for Route Handlers
- **Authentication & authorization** with Supabase Auth (session management, RLS)
- **Sensitive data handling** (encryption, no logging, secure cookies)
- **Security headers** (HSTS, X-Frame-Options, X-Content-Type-Options, etc.)
- **Rate limiting** to prevent abuse (brute force, DDoS)
- **Audit logging** for sensitive operations (payments, access changes)

---

## Checklist

### Input Validation & Sanitization

1. **Every form, API endpoint, and URL parameter** must validate input with Zod before processing
   - Use `safeParse()` or `safeParseAsync()` with async refinements
   - Map `FormData` fields to plain objects before Zod validation
   - Never trust request headers or cookies for authorization decisions alone

2. **Whitelist expected input formats** rather than blacklisting dangerous ones
   - Email: validate format + check domain if needed
   - URLs: validate scheme (https only), parse with `URL` constructor, avoid open redirects
   - Numbers: use `.int()` or `.number()` with min/max bounds
   - Strings: set max length, pattern matching for expected formats

3. **Sanitize user-generated HTML** before storing or displaying
   - Use `sanitize-html` with strict tag allowlists (prefer empty list for plain text)
   - Example: `sanitizeHtml(input, { allowedTags: [] })` for text-only content
   - For rich text (blogs), limit to `<p>, <b>, <i>, <a>` and strip `onclick`, `onerror`, etc.

4. **Flatten Zod errors** and return to client for field-level validation feedback
   - `error.flatten().fieldErrors` returns `{ fieldName: [messages...] }`
   - Prevent information leakage: don't expose database error details to frontend

5. **File uploads** must validate type and size before storage
   - Use `.instanceof(File)` with Zod refinements
   - Check MIME type (not just extension) via `File.type` or magic bytes
   - Set max file size (e.g., `<= 10MB`); reject oversized uploads
   - Delete files from storage if metadata write fails

6. **Command injection prevention**: Never pass user input to shell commands
   - Use parameterized APIs instead of `child_process.exec()`
   - Example: `spawn('ls', [userPath])` vs. `exec('ls ' + userPath)` ✓
   - FORBIDDEN: `exec()`, `eval()`, template literal shell commands

7. **No hardcoded secrets** in code (API keys, database credentials, JWT secrets)
   - Use `.env.local` (git-ignored) and environment variables
   - Example: `process.env.SUPABASE_SERVICE_KEY` (never console.log or return to client)
   - Rotate secrets if exposed; scan git history with `git-secrets` or `truffleHog`

### SQL Injection Prevention

8. **Always use parameterized queries** with Supabase
   - ✓ Correct: `supabase.from('users').select().eq('id', userId)`
   - ✗ FORBIDDEN: String concatenation like `SELECT * FROM users WHERE id='${userId}'`

9. **Filter + order user-controlled columns safely**
   - Whitelist allowed column names: `const ALLOWED_COLS = ['name', 'email'];`
   - Validate sort direction: `const dir = ['asc', 'desc'].includes(input) ? input : 'asc';`
   - Example:
     ```typescript
     if (!ALLOWED_COLS.includes(column)) throw new Error('Invalid column');
     const result = supabase.from('users').select().order(column, { ascending: dir === 'asc' });
     ```

10. **ORM usage** (Prisma, Drizzle, Supabase) provides protection when used correctly
    - All these ORMs use parameterized queries internally
    - Risk: raw SQL or string interpolation bypasses protections
    - ✓ Correct: `prisma.user.findUnique({ where: { id: userId } })`
    - ✗ FORBIDDEN: `prisma.$queryRaw`+template literals; use `$queryRaw`+parameters instead

### Cross-Site Scripting (XSS) Prevention

11. **Always escape user input when rendering in HTML**
    - React JSX escapes by default: `<div>{userInput}</div>` is safe
    - Set `dangerouslySetInnerHTML` only with sanitized, pre-validated content
    - Example: sanitize HTML first → validate it → only then render with `dangerouslySetInnerHTML`

12. **Encode output for the context where it's used**
    - HTML context: `&`, `<`, `>`, `"`, `'` → `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`
    - JavaScript context: avoid directly embedding user strings in `<script>` tags
    - URL context: use `encodeURIComponent()` for query parameters
    - Libraries: shadcn/ui, React hooks handle most escaping; verify custom components

13. **Implement Content Security Policy (CSP) headers** (most effective XSS defense)
    - Set in `next.config.ts` headers or middleware
    - Example strict policy:
      ```typescript
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-{RANDOM}'; style-src 'self' 'nonce-{RANDOM}'; img-src 'self' data: https:; font-src 'self'"
      ```
    - Use nonces for inline scripts: generate per request, regenerate on each page load
    - Disable unsafe patterns: no `eval()`, no `innerHTML` with unsanitized content

14. **Avoid eval(), new Function(), setTimeout(code)** - never execute user strings as code
    - ✗ FORBIDDEN: `eval(userInput)`, `new Function(userInput)`, `setTimeout(userInput, 1000)`
    - ✓ Correct: Use data structures, safe JSON parsing, or pre-compiled functions

15. **Use template literals safely** - never interpolate user input without escaping
    - ✓ Correct: `const msg = `Hello, ${escapeHtml(name)};`
    - ✗ FORBIDDEN: `document.innerHTML = `<div>${userInput}</div>;`

### CSRF Protection

16. **Server Actions automatically protect against CSRF** (Next.js built-in)
    - Every form using `<form action={serverAction}>` is protected
    - CSRF token is verified server-side by Next.js
    - No manual token handling needed for Server Actions

17. **Route Handlers need manual CSRF protection**
    - Implement CSRF token check for non-GET requests (POST, PUT, DELETE, PATCH)
    - Pattern 1 (Cookie-to-Header): Browser reads `XSRF-TOKEN` cookie, sends as `X-CSRF-Token` header
    - Pattern 2 (Hidden Field): Include token in form as hidden input
    - Verify on server: `if (tokenFromHeader !== tokenFromCookie) throw new Error('CSRF')`
    - Example:
      ```typescript
      // Route Handler
      export async function POST(req: Request) {
        const cookieToken = req.headers.get('Cookie')?.includes('XSRF-TOKEN');
        const headerToken = req.headers.get('X-CSRF-Token');
        if (!headerToken || headerToken !== cookieToken) {
          return new Response('Forbidden', { status: 403 });
        }
        // ... process request
      }
      ```

18. **SameSite cookies** reduce CSRF risk (set on Supabase session cookies)
    - `Set-Cookie: session=...; SameSite=Strict; Secure; HttpOnly;`
    - `Strict`: never send with cross-site requests
    - `Lax`: only on top-level navigation (forms, links)
    - Supabase sets `SameSite=Lax` by default; verify in middleware

19. **Prevent open redirects** - validate all redirect URLs
    - Whitelist allowed redirect targets: `const SAFE_REDIRECTS = ['/dashboard', '/profile'];`
    - Reject redirects to other domains: `if (url.hostname !== req.headers.host) throw new Error();`
    - Use `URL` constructor to validate: `const parsed = new URL(url);`

### Authentication & Authorization

20. **Use Supabase Auth for user sessions** (not JWT directly in cookies)
    - Supabase manages session lifecycle, refresh tokens, secure cookies
    - Always await `auth.getUser()` to verify session on server-side actions
    - Example:
      ```typescript
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user) return { error: 'Unauthorized' };
      ```

21. **Enforce Row-Level Security (RLS) in Supabase** for database authorization
    - Every table with user data must have RLS enabled
    - Policies: `SELECT`, `INSERT`, `UPDATE`, `DELETE` per role
    - Example policy: `auth.uid() = user_id`
    - Test policies in Supabase dashboard before production

22. **Never trust client-supplied user IDs** - always verify against session
    - ✗ FORBIDDEN: User submits `user_id` in form; trust it directly
    - ✓ Correct: Extract user ID from `auth.getUser()`, use that
    - Prevents IDOR (Insecure Direct Object References)

23. **Implement authorization checks before every action**
    - Check user role (admin, user, viewer) from `user.user_metadata` or `profiles` table
    - Example: `if (user.user_metadata.role !== 'admin') return { error: 'Forbidden' };`
    - Check resource ownership: `if (post.user_id !== user.id) return { error: 'Forbidden' };`

24. **Session expiration & timeouts**
    - Configure short session lifetimes (e.g., 1 hour) + refresh tokens
    - Supabase default: 1 hour session, 7 days refresh
    - Logout on tab/window close: handle `auth.onAuthStateChange()` in client
    - Implement idle timeout: log user out after 30 min of inactivity (optional)

25. **Password requirements** per NIST 800-63B
    - Minimum 12 characters (not composition rules like uppercase + numbers)
    - Check against top 10,000 breached passwords (HaveIBeenPwned API)
    - Support passphrases (longer, easier to remember)
    - No email regex forcing complex rules; allow spaces

26. **Multi-factor authentication (MFA)** strongly recommended
    - Support TOTP (Authenticator apps) or SMS (Supabase Auth)
    - Require MFA for admin accounts
    - Optional for regular users (encourage via UI prompts)
    - Example: `supabase.auth.signInWithPassword()` → check for MFA challenge

27. **API key rotation & revocation**
    - Store API keys in Supabase `api_keys` table with expiration dates
    - Rotate keys every 90 days
    - Immediately revoke compromised keys
    - Use service keys for internal operations, anon keys for client-side queries

### Sensitive Data Handling

28. **Never log sensitive information** (passwords, PII, credit cards)
    - Audit logs: log action + user + metadata, not request body
    - Error logs: log error message + stack trace, not user input
    - Example: ✓ `logError('Payment failed', { userId, amount, error: err.message })`
    - Example: ✗ FORBIDDEN `console.log(req.body)` (exposes passwords)

29. **Encrypt sensitive data at rest**
    - Use Supabase encryption for sensitive columns
    - PII (phone, SSN): use `pgcrypto` extension (`pgp_sym_encrypt`)
    - Credit card data: use Stripe/payment processor (PCI compliance), never store raw

30. **HTTPS only** - never transmit data over HTTP
    - Set `Strict-Transport-Security: max-age=31536000; includeSubDomains` header
    - Redirect HTTP → HTTPS: middleware in Next.js
    - Disable in development only (localhost allows HTTP)

31. **Secure cookies** attributes for session tokens
    - `Secure`: only sent over HTTPS
    - `HttpOnly`: inaccessible to JavaScript (prevents XSS theft)
    - `SameSite=Strict/Lax`: prevents CSRF
    - Supabase sets these automatically; verify in browser DevTools

32. **No PII in URLs** (email, user ID, tokens)
    - ✗ FORBIDDEN: `/user?id=123`, `/checkout?email=user@example.com`
    - ✓ Correct: Use session to look up user; pass opaque IDs only
    - URLs are logged in proxies, browser history, server logs

33. **Expire tokens & session IDs**
    - Access tokens: short-lived (1 hour)
    - Refresh tokens: longer (7 days) but rotated on use
    - Session IDs: invalidate on logout, regenerate on login
    - Implement token blacklist for revocation if needed

34. **Data retention & deletion**
    - Implement GDPR-compliant data deletion ("right to be forgotten")
    - Delete user account → cascade delete user data from all tables
    - Audit logs: retain for compliance (e.g., 7 years for financial)
    - Implement retention policies; auto-delete old logs

### Security Headers

35. **Set security headers in middleware** (Next.js `next.config.ts` headers array)
    ```typescript
    headers: [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '0' }, // CSP is primary defense
          { key: 'Referrer-Policy', value: 'strict-no-referrer' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'nonce-{RANDOM}'; style-src 'self' 'nonce-{RANDOM}'; img-src 'self' data: https:" },
        ],
      },
    ]
    ```

36. **Content-Security-Policy (CSP)** is the most effective XSS defense
    - `default-src 'self'`: block everything except same-origin
    - `script-src 'nonce-{RANDOM}'`: allow scripts with matching nonce only
    - `style-src 'nonce-{RANDOM}'`: prevent inline style injection
    - `img-src 'self' data: https:`: allow images from self, data URIs, HTTPS
    - `frame-ancestors 'none'`: prevent clickjacking (don't embed in iframes)
    - `form-action 'self'`: prevent form submissions to external sites
    - `object-src 'none'`: disable plugins (Flash, Java)
    - Test with `Content-Security-Policy-Report-Only` before enforcing

37. **Strict-Transport-Security (HSTS)** forces HTTPS
    - `max-age=31536000`: 1 year; forces HTTPS for all future requests
    - `includeSubDomains`: apply to subdomains too
    - `preload`: optional, submits to HSTS preload list
    - Example: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

38. **X-Frame-Options** prevents clickjacking (embedding app in other sites)
    - `DENY`: never allow framing
    - `SAMEORIGIN`: allow framing by same site only
    - Combine with CSP `frame-ancestors` for defense-in-depth

39. **X-Content-Type-Options: nosniff** prevents MIME sniffing
    - Prevents browser from guessing content type (e.g., serving JS as text)
    - Browser respects `Content-Type` header strictly

40. **Referrer-Policy** controls referrer leakage
    - `strict-no-referrer`: never send referrer to any site
    - `strict-no-referrer-when-downgrade`: only to same-level or HTTPS
    - `same-origin`: only to same domain
    - Choose based on privacy needs; `strict-no-referrer` is safest

### Rate Limiting & Abuse Prevention

41. **Implement rate limiting on expensive endpoints**
    - Prevent brute force (login, password reset)
    - Prevent DDoS (API calls, uploads)
    - Pattern: cache hits + check limit before processing
    - Example: `5 requests per minute per IP` for login

42. **Rate limit keys** (what to limit by)
    - Authenticated: user ID (prevent one user from abusing)
    - Unauthenticated: IP address + optional request fingerprint
    - Combined: IP + user agent (harder to spoof)

43. **Rate limit strategies**
    - Token bucket: fixed rate + burst capacity
    - Sliding window: count requests in last N seconds
    - Leaky bucket: smooth rate over time
    - Library: `redis`, `upstash` (serverless), or in-memory for small apps

44. **Exponential backoff** for failed retries
    - Don't retry immediately; wait 1s, 2s, 4s, 8s (doubles each time)
    - Prevents hammering services during outages
    - Example:
      ```typescript
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await fetch(url);
        } catch (e) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, delay));
        }
      }
      ```

### Audit Logging & Monitoring

45. **Log all sensitive actions** for audit trails
    - User login/logout (success + failure)
    - Admin actions (user deletion, role changes)
    - Payments (checkout, refund, chargebacks)
    - Data access (exports, reports)
    - Log: timestamp, user ID, action, IP, result
    - Store in `audit_logs` table (append-only, immutable)

46. **Include context in error logs**
    - Action name: `'password-reset-request'`
    - User ID: `userId` (not email)
    - Error code: `'EMAIL_NOT_FOUND'` or `'RATE_LIMITED'`
    - Metadata: `{ retries, responseTime, }`
    - Example: `logError('password-reset-request failed', { userId, code: 'EMAIL_NOT_FOUND', timestamp: new Date() })`

47. **Monitor for suspicious patterns**
    - Multiple failed logins → lock account, send alert
    - Unusual IP/location → require 2FA challenge
    - Bulk data exports → flag for review
    - Rate limit violations → block temporarily

48. **Use structured logging** (JSON) for machine parsing
    - Include: timestamp, severity, userId, action, error, metadata
    - Parse with logging service (Sentry, Datadog, LogRocket)
    - Don't log PII; use user ID instead of email

49. **Maintain audit logs immutably**
    - Append-only (no UPDATE/DELETE)
    - Timestamp on server (not client)
    - Track log accessor (who viewed logs?)
    - Consider cryptographic signing for compliance (GDPR, PCI)

### Dependency & Supply Chain Security

50. **Scan dependencies for vulnerabilities** regularly
    - Use `npm audit`, `snyk`, or `dependabot` (GitHub)
    - CI/CD: fail builds if high/critical vulnerabilities found
    - Regular updates: monthly or on security releases
    - Commands:
      ```bash
      npm audit
      npm audit fix
      npm outdated
      ```

51. **Review package metadata** before installing
    - Check author, downloads, last update date
    - Avoid abandoned packages (no updates > 1 year)
    - Verify package tarball integrity: `npm integrity`
    - Typosquatting: verify exact package name (common attack vector)

52. **Pin dependencies** for reproducibility
    - Use `package-lock.json` (committed to git)
    - Never run `npm install --no-save`
    - Review dependency updates before merging PRs
    - Lockfile versions: use `v3` (npm 7+) for better security

53. **Limit dependency permissions** (especially dev dependencies)
    - Move dev-only tools to `devDependencies`
    - Example: `npm install --save-dev eslint` (not production)
    - Review postinstall scripts; disable if suspicious

54. **Keep build tools updated**
    - Next.js, TypeScript, bundlers: security updates critical
    - React, shadcn/ui: patch XSS vulnerabilities promptly
    - Schedule updates monthly; test thoroughly before production

### Data Breach Response

55. **Have an incident response plan**
    - Breach detected → confirm scope (users, data types, date range)
    - Notify affected users within 72 hours (GDPR, CCPA requirements)
    - Log response actions (notifications, patches, investigations)
    - Document lessons learned

56. **Password reset campaign** if credentials breached
    - Force password change for affected users
    - Invalidate all existing sessions
    - Encourage use of unique passwords
    - Check against `haveibeenpwned.com` API

57. **Compromised tokens** (API keys, refresh tokens)
    - Immediately revoke in token table
    - Invalidate related sessions
    - Reissue new tokens to users
    - Alert monitoring system

58. **Security bulletin & transparency**
    - Publish details of vulnerability + patch
    - Explain what was exposed, when, mitigations
    - Set expectations for future security (regular audits, bug bounties)

---

## OWASP Top 10 Prevention Quick Reference

| Vulnerability | CWE | Prevention |
|---|---|---|
| **A01 Broken Access Control** | 284, 285 | Server-side authorization checks, RLS, never trust user IDs |
| **A02 Cryptographic Failures** | 327 | HTTPS only, encrypt at rest, secure key management |
| **A03 Injection** | 89, 79, 91 | Parameterized queries, input validation, output encoding |
| **A04 Insecure Design** | 434, 601 | Threat modeling, secure defaults, least privilege |
| **A05 Security Misconfiguration** | 16, 693 | Security headers, minimal dependencies, update regularly |
| **A06 Vulnerable & Outdated Components** | 1035 | Dependency scanning, pin versions, update schedule |
| **A07 Authentication Failures** | 287, 521 | MFA, strong passwords, session expiry, Supabase Auth |
| **A08 Data Integrity Failures** | 345, 434 | Verify packages, signed commits, code review |
| **A09 Logging & Monitoring Failures** | 778 | Audit logs, error tracking, security monitoring |
| **A10 SSRF** | 918 | Validate URLs, whitelist redirects, disable XXE |

---

## Detection Commands

Run these to enforce security patterns:

```bash
# 1. Check for hardcoded secrets
git grep -E 'process\.env\.[A-Z_]+ = ' -- ':!.env*'  # FORBIDDEN
grep -r 'password\|secret\|token' --include='*.ts' --include='*.js' | grep -v 'const \|type \|interface'  # review

# 2. Check for SQL concatenation (injection risk)
grep -r "FROM\|SELECT\|INSERT\|UPDATE.*\+" --include='*.ts' --include='*.sql'  # review
grep -r 'queryRaw.*\`' --include='*.ts'  # FORBIDDEN (use queryRaw with params)

# 3. Check for eval() usage (code injection)
grep -r 'eval\|new Function\|setTimeout.*code\|setInterval.*code' --include='*.ts' --include='*.js'  # FORBIDDEN

# 4. Check for missing Zod validation in Server Actions
grep -r '@action\|use server' --include='*.ts' -A 10 | grep -v 'safeParse'  # review

# 5. Check for missing CSRF tokens in Route Handlers (POST/PUT/DELETE)
grep -r 'export.*POST\|PUT\|DELETE' --include='*.ts' -A 5 | grep -v 'CSRF\|token\|auth'  # review

# 6. Check for unescaped content (XSS risk)
grep -r 'dangerouslySetInnerHTML\|innerHTML' --include='*.tsx' --include='*.ts'  # review each

# 7. Check for missing RLS on user data tables
# (manual review in Supabase dashboard)

# 8. Check for logging PII
grep -r 'console\|logError\|logInfo' --include='*.ts' -A 1 | grep -E 'email\|phone\|ssn'  # FORBIDDEN

# 9. Check for missing security headers in next.config.ts
grep -r 'Strict-Transport-Security\|Content-Security-Policy\|X-Frame-Options' ../../next.config.ts  # review

# 10. Check for client-side authorization (FORBIDDEN - do on server only)
grep -r 'if.*user.*role\|if.*auth.*admin' --include='*.tsx' | grep -v '//\|\/\*'  # review
```

---

## FORBIDDEN Patterns (Never Use)

### Injection Attacks
```typescript
// ✗ FORBIDDEN: SQL Injection
const result = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);
const hqlQuery = session.createQuery(`FROM accounts WHERE custID='${id}'`);

// ✗ FORBIDDEN: Command Injection
exec(`ls ${userPath}`);
spawn('sh', ['-c', `rm ${userInput}`]);

// ✗ FORBIDDEN: Template Injection
const template = `<div>${userInput}</div>`;  // use React JSX instead
```

### XSS Vulnerabilities
```typescript
// ✗ FORBIDDEN: Unescaped user input in HTML
document.innerHTML = `<div>${userInput}</div>`;
eval(userCode);
new Function(userString)();
setTimeout(userCode, 1000);

// ✗ FORBIDDEN: dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### CSRF & Authentication
```typescript
// ✗ FORBIDDEN: Trusting client-supplied user ID
const userId = req.body.userId;  // attacker can change this
if (userId) updateUser(userId);

// ✗ FORBIDDEN: Missing CSRF token in Route Handler
export async function POST(req) {
  // no token validation
  await updateData(req.body);
}

// ✗ FORBIDDEN: Session ID in URL (visible in logs)
redirect(`/dashboard?sessionId=${token}`);
```

### Sensitive Data
```typescript
// ✗ FORBIDDEN: Logging passwords/PII
console.log(req.body);  // exposes password
logError(`User ${user.email} failed`);  // don't log email

// ✗ FORBIDDEN: Storing credit cards
db.insert('payments', { cardNumber: '1234-5678-...' });  // use Stripe
const token = req.body.creditCard;  // never accept raw card data

// ✗ FORBIDDEN: Exposing error details
res.json({ error: 'Database connection failed: ' + err.message });  // shows schema
// ✓ CORRECT: Generic error
res.json({ error: 'An error occurred. Please try again.' });
```

### Access Control
```typescript
// ✗ FORBIDDEN: Client-side authorization
if (user.role === 'admin') {
  showDeleteButton();  // attacker can call delete anyway
}

// ✗ FORBIDDEN: No RLS on user data
const posts = await supabase
  .from('posts')
  .select()
  .eq('user_id', userId);  // anyone can access with correct URL

// ✓ CORRECT: Server-side + RLS
const user = await auth.getUser();  // verify session on server
const posts = await supabase
  .from('posts')
  .select()
  .eq('user_id', user.id);  // + RLS policy enforces on DB
```

### API Keys & Secrets
```typescript
// ✗ FORBIDDEN: Hardcoded secrets
const API_KEY = 'sk_live_abc123def456';
const DB_PASSWORD = 'mypassword123';
fetch(`https://api.stripe.com?key=${API_KEY}`);  // key in URL

// ✓ CORRECT: Environment variables
const API_KEY = process.env.STRIPE_SECRET_KEY;  // server-only
fetch('https://api.stripe.com', {
  headers: { Authorization: `Bearer ${API_KEY}` },  // in header, not URL
});
```

---

## File Locations & Structure

Security configurations:

```
project-root/
├── .env.local                          # secrets (git-ignored)
├── .env.example                        # public template
├── lib/
│   ├── auth/
│   │   ├── server.ts                   # Supabase session verification
│   │   └── csrf.ts                     # CSRF token helpers
│   ├── security/
│   │   ├── sanitize.ts                 # HTML sanitization
│   │   ├── rate-limit.ts               # Rate limiting
│   │   └── validation.ts               # Zod schemas
│   └── logging/
│       └── audit.ts                    # Audit log helpers
├── features/*/api/
│   ├── mutations.ts                    # Server Actions (with Zod validation)
│   ├── queries.ts                      # Server queries (server-only)
│   └── route-handlers/                 # Route Handlers (with CSRF checks)
├── middleware.ts                       # Security headers, HSTS, CSP
├── next.config.ts                      # Security headers config
└── docs/rules/
    ├── 06-api.md                       # Server Actions, validation
    ├── 09-auth.md                      # Authentication details
    └── 12-security.md                  # This file
```

---

## Related Rules

- **01-architecture.md** - Bundle security, tree-shaking
- **02-typescript.md** - Type safety prevents injection bugs
- **03-react.md** - Client component security, hooks
- **04-nextjs.md** - Middleware, caching headers, routing
- **05-supabase.md** - RLS policies, query security
- **06-api.md** - Server Actions, validation, error handling
- **07-forms.md** - Input validation, accessibility (includes WCAG security)
- **08-ui.md** - XSS prevention, accessibility, CSP directives
- **09-auth.md** - Supabase Auth, session management, MFA

---

## Resources

- **OWASP Top 10**: https://owasp.org/Top10/
- **OWASP Cheat Sheets**: https://cheatsheetseries.owasp.org/
- **CWE Top 25**: https://cwe.mitre.org/top25/
- **NIST 800-63B**: Password guidance
- **SANS Top 25**: Common weaknesses
- **Supabase Security**: https://supabase.com/docs/guides/api/auth
- **Next.js Security**: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
- **npm Audit**: `npm audit` (built-in vulnerability scanner)

---

## Version History

| Date | Change |
|---|---|
| 2025-11-10 | Initial security rules with OWASP 2024, CSP, input validation, CSRF, rate limiting |

---

## Validation Checklist

Before deploying to production:

- [ ] All forms use Server Actions with Zod validation
- [ ] No SQL concatenation; all queries parameterized
- [ ] No eval(), new Function(), or dynamic code execution
- [ ] CSP headers configured and tested
- [ ] CSRF tokens verified for Route Handlers
- [ ] RLS enabled on all user-data tables
- [ ] No hardcoded secrets in code (grep: `process.env.*=`)
- [ ] Audit logs for sensitive actions (payments, admin)
- [ ] Rate limiting on login, password reset, API endpoints
- [ ] Error messages don't expose database details
- [ ] Passwords hashed via Supabase Auth (not custom)
- [ ] HTTPS enforced; HSTS header set
- [ ] MFA available for admin accounts
- [ ] Dependencies scanned for vulnerabilities (npm audit)
- [ ] Incident response plan documented

---

**Last Verified:** 2025-11-10 (OWASP Top 10, CWE/SANS Top 25)
