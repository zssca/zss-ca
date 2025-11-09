# Phase 3 Action Items - Prioritized Improvements

**Status:** Optional improvements for Phase 4
**Effort:** 18-23 hours total
**Impact:** Long-term maintainability and type safety

---

## Priority 1: Type Casting Refactoring (High Impact)

**Effort:** 8-10 hours
**Impact:** Catches database schema drift at runtime
**Severity:** Medium

### Files to Refactor (18 total)

#### Billing Module (3 files)
1. `features/admin/billing/api/queries/billing-alerts.ts`
   - 3 instances of `as unknown as BillingAlertWithDetails[]`
   - Lines: 59, 97, 166

2. `features/admin/billing/api/queries/subscription-history.ts`
   - 3 instances of `as unknown as SubscriptionTimelineEvent[]`
   - Lines: TBD

3. `features/admin/billing/api/queries/invoices.ts`
   - Type casting for invoice joins

#### Support Module (2 files)
4. `features/admin/support/api/queries/tickets.ts`
   - 5 instances of `as unknown as TicketWithProfile[]`
   - Lines: 24, 46, 65, 89, 110

5. `features/admin/support/[id]/api/queries/ticket-detail.ts`
   - Type casting for ticket replies

#### Audit Logs Module (1 file)
6. `features/admin/audit-logs/api/queries/audit-logs.ts`
   - 3 instances of `as unknown as AuditLogWithProfiles[]`

#### Subscription Module (2 files)
7. `features/admin/subscription/api/queries/subscription.ts`
   - 2 instances for subscription with plan joins

8. `features/client/subscription/api/queries/subscription.ts`
   - Similar pattern

#### Other Modules (10 files)
9. `features/admin/dashboard/api/queries/dashboard.ts`
10. `features/admin/notifications/api/queries/notifications.ts`
11. `features/admin/clients/api/queries/clients.ts`
12. `features/admin/clients/[id]/api/queries/client-detail.ts`
13. `features/client/notifications/api/queries/notifications.ts`
14-18. Additional query files with join type casting

### Recommended Approach

#### Option A: Runtime Validation (Recommended)
**Pros:** Catches schema drift at runtime, self-documenting
**Cons:** Slight runtime overhead, more code

```typescript
import { z } from 'zod'

// Define Zod schema
const BillingAlertWithDetailsSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  alert_type: z.string(),
  severity: z.string(),
  profile: z.object({
    id: z.string().uuid(),
    contact_name: z.string(),
    contact_email: z.string().email(),
  }).nullable(),
  invoice: z.object({
    id: z.string().uuid(),
    invoice_number: z.string(),
    total: z.number(),
  }).nullable(),
})

export const getBillingAlerts = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.from('billing_alert').select(...)

  if (error) throw error

  // Runtime validation
  return z.array(BillingAlertWithDetailsSchema).parse(data ?? [])
})
```

#### Option B: Type Helper Wrapper (Faster, less safe)
**Pros:** No runtime overhead, cleaner code
**Cons:** Doesn't catch schema drift

```typescript
// lib/types/helpers/query-types.ts
export type WithRelations<
  TBase,
  TRelations extends Record<string, unknown>
> = TBase & TRelations

// Usage
export type BillingAlertWithDetails = WithRelations<
  BillingAlertRow,
  {
    profile?: Pick<ProfileRow, 'id' | 'contact_name'> | null
    invoice?: Pick<InvoiceRow, 'id' | 'invoice_number'> | null
  }
>

export const getBillingAlerts = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.from('billing_alert').select(...)

  if (error) throw error

  // Single cast (better than double cast)
  return (data as BillingAlertWithDetails[]) ?? []
})
```

### Implementation Plan

1. **Create helper file** (30 min)
   - Create `lib/types/helpers/query-validation.ts`
   - Add reusable Zod schemas for common patterns
   - Add type helper utilities

2. **Refactor billing module** (2 hours)
   - Start with `billing-alerts.ts` as template
   - Apply pattern to 3 files
   - Test with actual data

3. **Refactor support module** (2 hours)
   - Apply to tickets queries
   - Add validation for replies

4. **Refactor remaining files** (4-6 hours)
   - Apply pattern to 13 remaining files
   - Ensure consistent approach

5. **Add tests** (1-2 hours)
   - Unit tests for validation schemas
   - Integration tests for queries

---

## Priority 2: Remove `any` Types (Medium Impact)

**Effort:** 2-3 hours
**Impact:** Complete type safety
**Severity:** Low

### Files to Fix (5 total)

#### Export Utilities (1 file)
1. **`features/admin/analytics/utils/export-revenue-data.ts`**
   - 4 instances of `any` type in `.map()` callbacks

**Current:**
```typescript
const rows = (mrrData || []).map((row: any) => [
  formatDate(row.month),
  formatCurrency(row.mrr ?? 0),
])
```

**Fix:**
```typescript
type MRRDataRow = Database['public']['Functions']['calculate_mrr_growth']['Returns'][number]

const rows = (mrrData || []).map((row: MRRDataRow) => [
  formatDate(row.month),
  formatCurrency(row.mrr ?? 0),
])
```

**Implementation:**
- Extract all RPC function types
- Apply to 4 export functions
- Test CSV export functionality

---

#### Chart Components (4 files)
2. **`features/admin/analytics/components/mrr-trend-chart.tsx`**
3. **`features/admin/analytics/components/churn-rate-chart.tsx`**
4. **`features/admin/analytics/components/ltv-by-plan-chart.tsx`**
5. **`features/admin/analytics/components/revenue-by-plan-chart.tsx`**

**Current:**
```typescript
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  // ...
}
```

**Fix:**
```typescript
import type { TooltipProps } from 'recharts'

interface ChartTooltipData {
  month: string
  mrr: number
  new: number
  churned: number
}

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{ payload: ChartTooltipData }>
}

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  // ...
}
```

**Implementation:**
1. Create shared `lib/types/ui/chart-types.ts` (30 min)
2. Define reusable Recharts types
3. Apply to 4 chart components (30 min each)
4. Test all charts render correctly

---

## Priority 3: Create Type-Safe Query Builder (High Impact)

**Effort:** 6-8 hours
**Impact:** Developer experience, prevents future issues
**Severity:** Low (nice-to-have)

### Goal
Create wrapper around Supabase client that correctly infers join types.

### Implementation

```typescript
// lib/supabase/typed-query.ts
import type { Database } from '@/lib/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Type-safe query builder for Supabase
 * Correctly infers types for joins and relations
 */
export class TypedQuery<
  TTable extends keyof Database['public']['Tables'],
  TResult = Database['public']['Tables'][TTable]['Row']
> {
  constructor(
    private supabase: SupabaseClient<Database>,
    private table: TTable
  ) {}

  /**
   * Select with type inference for joins
   */
  async select<TColumns extends string>(
    columns: TColumns
  ): Promise<TResult[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(columns)

    if (error) throw error

    return data as TResult[]
  }

  /**
   * Select single with type inference
   */
  async selectOne<TColumns extends string>(
    columns: TColumns
  ): Promise<TResult | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(columns)
      .single()

    if (error) throw error

    return data as TResult
  }

  // Add more methods as needed (insert, update, delete)
}

// Usage
export const getBillingAlerts = cache(async () => {
  const supabase = await createClient()

  const query = new TypedQuery<'billing_alert', BillingAlertWithDetails>(
    supabase,
    'billing_alert'
  )

  return query.select('*, profile(*), invoice(*)')
})
```

### Steps
1. Create `TypedQuery` class (3 hours)
2. Add select, insert, update, delete methods
3. Add proper error handling
4. Create usage documentation
5. Refactor 2-3 queries as examples (2 hours)
6. Team review and feedback (1 hour)

---

## Priority 4: Add ESLint Rules (Low Effort, High Prevention)

**Effort:** 1-2 hours
**Impact:** Prevents future regressions
**Severity:** Low

### Goal
Prevent `any` types and unsafe casting in new code.

### Implementation

```json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-call": "warn"
  }
}
```

### Steps
1. Add TypeScript ESLint rules (30 min)
2. Fix any new errors (30 min)
3. Update CI/CD to enforce (30 min)
4. Document in contributing guide (30 min)

---

## Priority 5: Add Type Tests (Medium Effort, High Confidence)

**Effort:** 3-4 hours
**Impact:** Catches type regressions in CI
**Severity:** Low

### Goal
Test that types are correctly inferred and maintained.

### Implementation

```typescript
// lib/types/__tests__/database-types.test.ts
import { describe, it, expectTypeOf } from 'vitest'
import type {
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
} from '../database-aliases'

describe('Database Type Tests', () => {
  it('ProfileRow has all required fields', () => {
    type Profile = ProfileRow

    expectTypeOf<Profile>().toHaveProperty('id')
    expectTypeOf<Profile>().toHaveProperty('contact_name')
    expectTypeOf<Profile>().toHaveProperty('contact_email')
  })

  it('ProfileInsert omits auto-generated fields', () => {
    type Insert = ProfileInsert

    expectTypeOf<Insert>().not.toHaveProperty('id')
    expectTypeOf<Insert>().toHaveProperty('contact_name')
  })

  it('ProfileUpdate makes all fields optional', () => {
    type Update = ProfileUpdate

    expectTypeOf<Update>().toMatchTypeOf<Partial<ProfileRow>>()
  })
})
```

### Steps
1. Install `vitest` type testing utilities (30 min)
2. Create type tests for all table aliases (2 hours)
3. Add to CI pipeline (30 min)
4. Document type testing guidelines (1 hour)

---

## Summary Timeline

| Priority | Task | Effort | Impact | When |
|----------|------|--------|--------|------|
| 1 | Refactor type casting (18 files) | 8-10h | High | Phase 4 Sprint 1 |
| 2 | Remove `any` types (5 files) | 2-3h | Medium | Phase 4 Sprint 1 |
| 3 | Type-safe query builder | 6-8h | High | Phase 4 Sprint 2 |
| 4 | ESLint rules | 1-2h | High | Phase 4 Sprint 1 |
| 5 | Type tests | 3-4h | High | Phase 4 Sprint 2 |

**Total Effort:** 20-27 hours (3-4 days)
**Total Impact:** Eliminates all type safety gaps

---

## Decision Matrix

### Should we do this in Phase 4?

**YES, if:**
- Team has 1-2 weeks for improvements
- Want to maximize long-term maintainability
- Planning to onboard new developers soon
- Database schema changes are frequent

**NO (defer to later), if:**
- Need to ship features urgently
- Team is small and familiar with codebase
- Database schema is stable
- Current 95% type coverage is acceptable

**Current Recommendation:** YES - Address in Phase 4
- Current state is production-ready
- These improvements prevent future technical debt
- Effort is reasonable (3-4 days)
- Impact on developer experience is high

---

## Quick Wins (Can Do Now)

If limited time, prioritize these:

1. **Remove `any` types** (2-3 hours)
   - Easy fix
   - High visibility
   - Immediate improvement

2. **Add ESLint rules** (1-2 hours)
   - Prevents regressions
   - Low effort
   - Continuous benefit

**Combined:** 3-5 hours for 50% of the value

---

**Last Updated:** 2025-11-07
**Status:** Ready for Phase 4 Planning
**Blockers:** None (all optional improvements)
