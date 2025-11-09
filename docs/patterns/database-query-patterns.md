# Database Query Type Patterns

**Purpose:** Quick reference for type-safe database queries based on Phase 3 audit
**Last Updated:** 2025-11-07

---

## Table of Contents
1. [Basic Query Patterns](#basic-query-patterns)
2. [Joined Data Patterns](#joined-data-patterns)
3. [Database Function Patterns](#database-function-patterns)
4. [Mutation Patterns](#mutation-patterns)
5. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Basic Query Patterns

### Pattern 1: Simple Table Query

```typescript
import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { ProfileRow } from '@/lib/types/database-aliases'

export const getCurrentProfile = cache(async (): Promise<ProfileRow | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Profile fetch error:', error)
    return null
  }

  return data
})
```

**Key Points:**
- Import from `database-aliases.ts`
- Use `cache()` for request deduplication
- Return explicit type (`ProfileRow | null`)
- Handle errors gracefully

---

### Pattern 2: List Query with Filters

```typescript
import type { ClientSiteRow, SiteStatus } from '@/lib/types/database-aliases'

export const listActiveSites = cache(async (): Promise<ClientSiteRow[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_site')
    .select('*')
    .eq('status', 'live')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Sites fetch error:', error)
    return []
  }

  return data ?? []
})
```

**Key Points:**
- Always check `deleted_at` for soft deletes
- Use proper enum types from database-aliases
- Return empty array on error (never null for lists)

---

## Joined Data Patterns

### Pattern 3: Query with Relations (RECOMMENDED)

```typescript
import type { Database } from '@/lib/types/database.types'
import type {
  ClientSiteRow,
  ProfileRow,
  PlanRow,
  SubscriptionRow,
} from '@/lib/types/database-aliases'

// Define joined type explicitly
export type SiteWithRelations = ClientSiteRow & {
  profile: Pick<ProfileRow, 'id' | 'contact_name' | 'contact_email' | 'company_name'>
  plan: Pick<PlanRow, 'id' | 'name' | 'slug'> | null
  subscription: Pick<SubscriptionRow, 'id' | 'status'> | null
}

export const listSitesWithRelations = cache(async (): Promise<SiteWithRelations[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_site')
    .select(`
      *,
      profile:profile_id(id, contact_name, contact_email, company_name),
      plan:plan_id(id, name, slug),
      subscription:subscription_id(id, status)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Sites fetch error:', error)
    return []
  }

  // Type assertion needed due to Supabase limitations
  return (data as SiteWithRelations[]) || []
})
```

**Key Points:**
- Define explicit type for joined data
- Use intersection (`&`) for base table + relations
- Use `Pick<>` utility to select specific fields
- Mark optional relations as `| null`
- Type assertion `as SiteWithRelations[]` is acceptable here

---

### Pattern 4: Complex Joins with Nested Relations

```typescript
import type {
  BillingAlertRow,
  InvoiceRow,
  PaymentIntentRow,
  ProfileRow,
} from '@/lib/types/database-aliases'

export type BillingAlertWithDetails = BillingAlertRow & {
  profile?: Pick<
    ProfileRow,
    'id' | 'contact_name' | 'contact_email' | 'company_name' | 'contact_phone'
  > | null
  invoice?: Pick<
    InvoiceRow,
    'id' | 'invoice_number' | 'total' | 'status' | 'due_date'
  > | null
  payment_intent?: Pick<PaymentIntentRow, 'id' | 'amount' | 'status'> | null
}

export const getBillingAlerts = cache(async (): Promise<BillingAlertWithDetails[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_alert')
    .select(`
      *,
      profile:profile_id!billing_alert_profile_id_fkey (
        id,
        contact_name,
        contact_email,
        company_name,
        contact_phone
      ),
      invoice:invoice_id!billing_alert_invoice_id_fkey (
        id,
        invoice_number,
        total,
        status,
        due_date
      ),
      payment_intent:payment_intent_id!billing_alert_payment_intent_id_fkey (
        id,
        amount,
        status
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Billing alerts fetch error:', error)
    throw error
  }

  return (data as BillingAlertWithDetails[]) ?? []
})
```

**Key Points:**
- Use foreign key hints (`!table_fkey`) for explicit joins
- Define all relation types with `Pick<>`
- Use `| null` for optional relations
- Cast final result with explicit type

---

## Database Function Patterns

### Pattern 5: Database RPC with Generated Types

```typescript
import type { Database } from '@/lib/types/database.types'

// Extract exact type from database.types.ts
type ChurnRateRecord =
  Database['public']['Functions']['calculate_churn_rate']['Returns'][number]

export interface ChurnMetrics {
  period: string
  active_start: number
  new_subscriptions: number
  churned: number
  active_end: number
  gross_churn_rate: number
  net_churn_rate: number
  retention_rate: number
  churn_rate: number
}

export async function getChurnRate(
  startDate?: Date,
  endDate?: Date
): Promise<ChurnMetrics[]> {
  const supabase = await createClient()

  const params: {
    p_start_date?: string
    p_end_date?: string
  } = {}

  if (startDate) {
    params.p_start_date = startDate.toISOString().split('T')[0]
  }
  if (endDate) {
    params.p_end_date = endDate.toISOString().split('T')[0]
  }

  const { data, error } = await supabase.rpc('calculate_churn_rate', params)

  if (error) {
    console.error('Churn rate fetch error:', error)
    return []
  }

  // Map database type to domain type
  return (data || []).map(mapChurnRateRecord)
}

// Type-safe mapper function
function mapChurnRateRecord(record: ChurnRateRecord): ChurnMetrics {
  return {
    period: record.period,
    active_start: record.active_start,
    new_subscriptions: record.new_subscriptions,
    churned: record.churned,
    active_end: record.active_end,
    gross_churn_rate: record.gross_churn_rate,
    net_churn_rate: record.net_churn_rate,
    retention_rate: record.retention_rate,
    churn_rate: record.churn_rate,
  }
}
```

**Key Points:**
- Extract RPC function types from `Database['public']['Functions']`
- Create domain-specific interface for return type
- Use mapper function for type transformation
- Handle array results with `[number]` indexer

---

## Mutation Patterns

### Pattern 6: Insert Mutation

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import type { ContactSubmissionInsert } from '@/lib/types/database-aliases'
import { contactFormSchema } from '../schema'

export async function submitContactForm(
  data: unknown
): Promise<{ error: string; fieldErrors?: Record<string, string[]> } | { error: null }> {
  // 1. Validate with Zod
  const result = contactFormSchema.safeParse(data)

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  // 2. Create Supabase client
  const supabase = await createClient()

  // 3. Build insert object with proper type
  const submission: ContactSubmissionInsert = {
    full_name: result.data.fullName,
    email: result.data.email,
    phone: result.data.phone,
    message: result.data.message,
    source: 'website',
  }

  // 4. Insert
  const { error } = await supabase
    .from('contact_submission')
    .insert(submission)

  if (error) {
    console.error('Contact submission error:', error)

    // Map database errors
    if (error.code === '23505') {
      return { error: 'Duplicate submission detected' }
    }

    return { error: 'Failed to submit form' }
  }

  // 5. Invalidate cache
  updateTag('contact-submissions')

  return { error: null }
}
```

**Key Points:**
- Use `TableInsert<>` type from database-aliases
- Validate input with Zod first
- Map validated data to database insert type
- Handle constraint violations
- Invalidate relevant cache tags

---

### Pattern 7: Update Mutation

```typescript
'use server'

import type { ProfileUpdate } from '@/lib/types/database-aliases'
import { updateClientProfileSchema } from '../schema'

export async function updateClientProfile(
  data: unknown
): Promise<{ error: string; fieldErrors?: Record<string, string[]> } | { error: null }> {
  // 1. Validate
  const result = updateClientProfileSchema.safeParse(data)
  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  // 2. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 3. Build update object with proper type
  const updates: Partial<ProfileUpdate> = {}
  if (result.data.fullName !== undefined) {
    updates.contact_name = result.data.fullName
  }
  if (result.data.company !== undefined) {
    updates.company_name = result.data.company
  }
  if (result.data.phone !== undefined) {
    updates.contact_phone = result.data.phone
  }

  // 4. Update
  const { error } = await supabase
    .from('profile')
    .update(updates)
    .eq('id', result.data.profileId)

  if (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to update profile' }
  }

  // 5. Cache invalidation
  updateTag('clients')
  updateTag(`client:${result.data.profileId}`)

  return { error: null }
}
```

**Key Points:**
- Use `Partial<TableUpdate<>>` for update objects
- Only include fields that changed
- Always include auth check
- Invalidate multiple cache tags if needed

---

## Anti-Patterns to Avoid

### ❌ AVOID: Using `any` Type

```typescript
// ❌ WRONG
const rows = (data || []).map((row: any) => [
  row.month,
  row.value
])

// ✅ CORRECT
type MRRRow = Database['public']['Functions']['calculate_mrr_growth']['Returns'][number]

const rows = (data || []).map((row: MRRRow) => [
  row.month,
  row.value
])
```

---

### ❌ AVOID: Unsafe Type Casting

```typescript
// ❌ WRONG (double casting is a red flag)
return (data ?? []) as unknown as CustomType[]

// ✅ BETTER (single cast with explicit type definition)
export type CustomType = BaseRow & { relation: RelatedRow }
return (data as CustomType[]) ?? []

// ✅ BEST (runtime validation)
import { z } from 'zod'

const CustomTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  relation: z.object({
    id: z.string().uuid(),
    value: z.number()
  })
})

return z.array(CustomTypeSchema).parse(data ?? [])
```

---

### ❌ AVOID: Missing Error Handling

```typescript
// ❌ WRONG
const { data } = await supabase.from('table').select('*')
return data // Could be null, could have error

// ✅ CORRECT
const { data, error } = await supabase.from('table').select('*')

if (error) {
  console.error('Fetch error:', error)
  return []
}

return data ?? []
```

---

### ❌ AVOID: Client-Side Database Calls

```typescript
// ❌ WRONG (client component making direct DB call)
'use client'

import { createClient } from '@/lib/supabase/client'

export function UserProfile() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('profile').select('*').then(...)
  }, [])
}

// ✅ CORRECT (server component or server action)
import { getCurrentProfile } from '../api/queries/profile'

export async function UserProfile() {
  const profile = await getCurrentProfile()

  return <div>{profile?.contact_name}</div>
}
```

---

### ❌ AVOID: Not Using `cache()` for Queries

```typescript
// ❌ WRONG (could result in duplicate queries)
export async function getProfile() {
  const supabase = await createClient()
  // ...
}

// ✅ CORRECT (deduplicates requests in same render)
import { cache } from 'react'

export const getProfile = cache(async () => {
  const supabase = await createClient()
  // ...
})
```

---

### ❌ AVOID: Missing `'server-only'` Import

```typescript
// ❌ WRONG (could accidentally bundle in client)
// features/admin/api/queries/users.ts
import { createClient } from '@/lib/supabase/server'

export async function getUsers() {
  // ...
}

// ✅ CORRECT
import 'server-only'  // This prevents accidental client bundling

import { createClient } from '@/lib/supabase/server'

export async function getUsers() {
  // ...
}
```

---

## Quick Reference Checklist

When creating a new query:

- [ ] Import `'server-only'` at the top
- [ ] Import types from `@/lib/types/database-aliases`
- [ ] Wrap with `cache()` from `react`
- [ ] Return explicit type (never implicit `any`)
- [ ] Handle `error` from Supabase query
- [ ] Provide sensible defaults (`[]` for arrays, `null` for objects)
- [ ] Add `.is('deleted_at', null)` for soft-delete tables

When creating a new mutation:

- [ ] Start with `'use server'` directive
- [ ] Validate input with Zod schema
- [ ] Check authentication with `getUser()`
- [ ] Use typed insert/update from database-aliases
- [ ] Handle database constraint errors
- [ ] Call `updateTag()` for cache invalidation
- [ ] Return consistent error shape

---

**Last Updated:** 2025-11-07
**Based on:** Phase 3 Type Alignment Audit
