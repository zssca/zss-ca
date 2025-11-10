# Code Rules & Patterns Guide

This directory contains comprehensive rules for maintaining code quality, performance, and security across the Next.js application. Each file focuses on a specific domain.

## 📚 Rule Files Overview

### Core Architecture & Framework Rules

| # | File | Focus | Checklist Items | Last Updated |
|---|------|-------|-----------------|--------------|
| 1 | **01-architecture.md** | File structure, routing, bundling, runtime selection | 100+ | Nov 10, 2025 |
| 2 | **02-typescript.md** | Type safety, performance patterns, generics | 100+ | Nov 10, 2025 |
| 3 | **03-react.md** | React 19, Server/Client Components, hooks, Suspense | 100+ | Nov 10, 2025 |
| 4 | **04-nextjs.md** | Caching strategies, revalidation, ISR, image optimization, metadata API | 200+ | Nov 10, 2025 |

### Backend & Data Rules

| # | File | Focus | Checklist Items | Last Updated |
|---|------|-------|-----------------|--------------|
| 5 | **05-supabase.md** | RLS, queries, connection pooling, realtime, monitoring | 100+ | Nov 10, 2025 |
| 6 | **06-api.md** | Server Actions, Route Handlers, validation, rate limiting, error handling | 100+ | Nov 10, 2025 |

### UI & Forms Rules

| # | File | Focus | Checklist Items | Last Updated |
|---|------|-------|-----------------|--------------|
| 7 | **07-forms.md** | Zod validation, accessibility, UX patterns | 100+ | Nov 10, 2025 |
| 8 | **08-ui.md** | shadcn/ui, accessibility, Tailwind, component patterns | 100+ | Nov 10, 2025 |

### Security & Auth Rules

| # | File | Focus | Checklist Items | Last Updated |
|---|------|-------|-----------------|--------------|
| 9 | **09-auth.md** | Supabase Auth, session management, security patterns | 100+ | Nov 10, 2025 |

### Recommended Supporting Rules (Under Development)

| # | File | Focus | Status |
|---|------|-------|--------|
| 11 | **11-performance.md** | Caching metrics, Core Web Vitals, performance budgets | 🔄 Planned |
| 12 | **12-security.md** | CSP headers, CORS, rate limiting, security headers | 🔄 Planned |
| 14 | **14-logging.md** | Request logging, structured logging, OpenTelemetry | 🔄 Planned |
| 15 | **15-database-patterns.md** | Connection pooling, query optimization, DB monitoring | 🔄 Planned |

## 🔄 Cross-Reference Map

```
┌─────────────────────────────────────────────────────────┐
│         Application Architecture Decision Tree          │
└─────────────────────────────────────────────────────────┘
                          ↓
         Start: Check 01-architecture.md
              (Routing, file structure, bundling)
                          ↓
    ┌─────────────┬──────────────┬──────────────┐
    ↓             ↓              ↓              ↓
Page/Layout   Component      Server Action   Route Handler
    ↓             ↓              ↓              ↓
 Check 02      Check 03       Check 06       Check 06
 + 03          + 08           + 05           (HTTP verbs)
 + 04          + 07           + 09
               (TypeScript)   (Validation)   (External APIs)
               (React)        (Caching)      (Rate limiting)
               (Forms/UI)
                    ↓
         Implement with 04-nextjs.md
              (Caching orchestration)
                    ↓
         Validate against 02-typescript.md
              (Type safety)
```

## 🎯 Implementation Workflow

### When adding a new feature:

1. **Check 01-architecture.md** → Decide on file structure and routing pattern
2. **Check 03-react.md** → Determine component strategy (Server vs Client)
3. **Check 06-api.md** → Design mutation/query approach (Server Action vs Route Handler)
4. **Check 04-nextjs.md** → Plan caching and revalidation strategy
5. **Check 05-supabase.md** → Design database queries with RLS
6. **Check 07-forms.md** → Implement form validation
7. **Check 08-ui.md** → Use appropriate shadcn/ui components
8. **Check 02-typescript.md** → Ensure type safety throughout
9. **Check 09-auth.md** → Add authentication guards if needed

### When investigating a problem:

1. Start with the rule file matching the problem domain (e.g., "caching issue" → 04-nextjs.md)
2. Check the FORBIDDEN PATTERNS section for anti-patterns
3. Run detection commands to identify violations
4. Reference CROSS-REFERENCES for related domains
5. Check supporting rules (when available) for deeper context

## 🔍 Quick Reference by Topic

### Caching & Performance
- **Primary:** 04-nextjs.md (revalidateTag, updateTag, revalidatePath, ISR, cacheLife)
- **Supporting:** 01-architecture.md, 03-react.md, 06-api.md, 05-supabase.md
- **Monitoring:** 11-performance.md (planned)

### Server Actions & API Routes
- **Primary:** 06-api.md (validation, error handling, rate limiting)
- **Supporting:** 04-nextjs.md (caching in actions), 05-supabase.md (DB calls), 09-auth.md (auth guards)
- **Logging:** 14-logging.md (planned)

### Database Queries & RLS
- **Primary:** 05-supabase.md (RLS, indexes, connection pooling)
- **Supporting:** 06-api.md (validation before queries), 04-nextjs.md (caching tags)
- **Optimization:** 15-database-patterns.md (planned)

### Authentication & Security
- **Primary:** 09-auth.md (session management, auth checks)
- **Supporting:** 06-api.md (Server Action guards), 04-nextjs.md (cookie handling)
- **Headers & CSP:** 12-security.md (planned)

### Component Architecture
- **Primary:** 03-react.md (Server/Client Components, hooks)
- **Supporting:** 01-architecture.md (file structure), 08-ui.md (shadcn/ui), 07-forms.md (form patterns)

### Forms & Validation
- **Primary:** 07-forms.md (Zod, accessibility, UX)
- **Supporting:** 06-api.md (Server Action validation), 02-typescript.md (type safety)

## 🚀 Detection Commands

Each rule file includes detection commands (bash scripts) to enforce compliance in CI/CD. Run them before committing:

```bash
# Check Next.js caching compliance
npm run lint:nextjs

# Verify TypeScript type safety
npm run typecheck

# Run all detection suites
npm run lint
npm run typecheck
./scripts/verify-all-rules.sh  # (Recommended to create)
```

## 📊 Checklist Statistics

| File | Items | Deprecated | Forbidden | Detection Commands |
|------|-------|-----------|-----------|-------------------|
| 01-architecture.md | 100+ | 10+ | 5+ | 15+ |
| 02-typescript.md | 100+ | 5+ | 10+ | 12+ |
| 03-react.md | 100+ | 8+ | 15+ | 18+ |
| **04-nextjs.md** | **201** | **20+** | **40+** | **20+** |
| 05-supabase.md | 100+ | 5+ | 8+ | 14+ |
| 06-api.md | 100+ | 3+ | 12+ | 16+ |
| 07-forms.md | 100+ | 2+ | 8+ | 10+ |
| 08-ui.md | 100+ | 0 | 6+ | 8+ |
| 09-auth.md | 100+ | 5+ | 10+ | 12+ |

## 🔄 Most Important Cross-Reference Points

### Next.js Rules (04-nextjs.md) connects with:

**Upward Dependencies:**
- 01-architecture.md → caching API fundamentals
- 03-react.md → Suspense, cache() deduplication
- 02-typescript.md → type safety for cache tags

**Downward Dependencies:**
- 06-api.md → updateTag/revalidateTag in Server Actions
- 05-supabase.md → cache tags for DB queries
- 09-auth.md → cookie handling in Server Actions

**Coordination Points:**
- **Caching orchestration:** All Server Actions and Route Handlers must reference 04-nextjs.md
- **Tag naming:** Maintain consistent hierarchical tags across 06-api.md and 04-nextjs.md
- **Revalidation timing:** Coordinate between updateTag (immediate) vs revalidateTag (background)

## 📝 How to Use This Guide

1. **Bookmark this README** → Reference when making architectural decisions
2. **Read rule file summaries** → Each file starts with a summary of key patterns
3. **Check FORBIDDEN PATTERNS** → Understand what NOT to do
4. **Run detection commands** → Verify compliance automatically
5. **Cross-reference** → Jump between related files using the cross-reference tables
6. **Update as needed** → When Next.js/React versions change, update affected files

## 🆕 Contributing Updates

When updating rules:
1. Update the relevant rule file
2. Update "Last Updated" date (top of file)
3. Update this README's cross-reference table and statistics
4. Run all detection commands to verify enforcement
5. Test that detection scripts catch violations properly

## 📞 Questions or Issues?

- For caching questions → Check 04-nextjs.md (200+ items)
- For architecture questions → Check 01-architecture.md
- For data/query questions → Check 05-supabase.md + 06-api.md
- For component questions → Check 03-react.md + 08-ui.md
- For form validation → Check 07-forms.md
