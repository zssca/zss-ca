import 'server-only'

import { cache } from 'react'
import { createClient, requireAuth, requireAdminRole } from '@/lib/supabase'

export type DatabaseHealth = {
  category: string
  value: string
}

export type RLSCoverage = {
  tablename: string
  rls_enabled: boolean
  policy_count: number
  policies: string[] | null
  status: 'RLS DISABLED' | 'NO POLICIES' | 'FEW POLICIES' | 'COVERED'
}

export type IndexUsage = {
  schemaname: string
  tablename: string
  indexname: string
  scans: number
  tuples_read: number
  tuples_fetched: number
  index_size: string
  usage_category: 'UNUSED' | 'LOW USAGE' | 'MODERATE' | 'HIGH USAGE'
}

export type TableStats = {
  schemaname: string
  tablename: string
  live_rows: number
  dead_rows: number
  dead_row_percent: number
  last_vacuum: string | null
  last_autovacuum: string | null
  last_analyze: string | null
  last_autoanalyze: string | null
  total_size: string
  table_size: string
  indexes_size: string
}

export type ForeignKeys = {
  table_schema: string
  from_table: string
  from_column: string
  to_table: string
  to_column: string
  update_rule: string
  delete_rule: string
}

// ✅ Next.js 15+: Use React cache() for request deduplication
export const getDatabaseHealth = cache(async (): Promise<DatabaseHealth[]> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('vw_database_health')
    .select('*')

  if (error) {
    console.error('Error fetching database health:', error)
    return []
  }

  return (data || []).map((record) => ({
    category: record.category ?? 'Unknown',
    value: record.value ?? 'N/A',
  }))
})

// ✅ Next.js 15+: Use React cache() for request deduplication
export const getRLSCoverage = cache(async (): Promise<RLSCoverage[]> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('vw_rls_coverage')
    .select('*')
    .order('status', { ascending: true })
    .order('tablename', { ascending: true })

  if (error) {
    console.error('Error fetching RLS coverage:', error)
    return []
  }

  return (data || []).map((record) => ({
    tablename: String(record.tablename ?? 'unknown'),
    rls_enabled: Boolean(record.rls_enabled),
    policy_count: record.policy_count ?? 0,
    policies: Array.isArray(record.policies) ? (record.policies as string[]) : null,
    status: (record.status ?? 'RLS DISABLED') as RLSCoverage['status'],
  }))
})

// ✅ Next.js 15+: Use React cache() for request deduplication
export const getIndexUsage = cache(async (): Promise<IndexUsage[]> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('vw_index_usage')
    .select('*')
    .order('scans', { ascending: true })
    .limit(20)

  if (error) {
    console.error('Error fetching index usage:', error)
    return []
  }

  return (data || []).map((record) => ({
    schemaname: String(record.schemaname ?? 'public'),
    tablename: String(record.tablename ?? 'unknown'),
    indexname: String(record.indexname ?? 'unknown'),
    scans: record.scans ?? 0,
    tuples_read: record.tuples_read ?? 0,
    tuples_fetched: record.tuples_fetched ?? 0,
    index_size: record.index_size ?? '0 bytes',
    usage_category: (record.usage_category ?? 'UNUSED') as IndexUsage['usage_category'],
  }))
})

// ✅ Next.js 15+: Use React cache() for request deduplication
export const getTableStats = cache(async (): Promise<TableStats[]> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('vw_table_stats')
    .select('*')
    .order('live_rows', { ascending: false })
    .limit(15)

  if (error) {
    console.error('Error fetching table stats:', error)
    return []
  }

  return (data || []).map((record) => ({
    schemaname: String(record.schemaname ?? 'public'),
    tablename: String(record.tablename ?? 'unknown'),
    live_rows: record.live_rows ?? 0,
    dead_rows: record.dead_rows ?? 0,
    dead_row_percent: record.dead_row_percent ?? 0,
    last_vacuum: record.last_vacuum,
    last_autovacuum: record.last_autovacuum,
    last_analyze: record.last_analyze,
    last_autoanalyze: record.last_autoanalyze,
    total_size: record.total_size ?? '0 bytes',
    table_size: record.table_size ?? '0 bytes',
    indexes_size: record.indexes_size ?? '0 bytes',
  }))
})

// ✅ Next.js 15+: Use React cache() for request deduplication
export const getForeignKeys = cache(async (): Promise<ForeignKeys[]> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('vw_foreign_keys')
    .select('*')
    .order('from_table', { ascending: true })
    .order('from_column', { ascending: true })

  if (error) {
    console.error('Error fetching foreign keys:', error)
    return []
  }

  return (data || []).map((record) => ({
    table_schema: String(record.table_schema ?? 'public'),
    from_table: String(record.from_table ?? 'unknown'),
    from_column: String(record.from_column ?? 'unknown'),
    to_table: String(record.to_table ?? 'unknown'),
    to_column: String(record.to_column ?? 'unknown'),
    update_rule: record.update_rule ?? 'NO ACTION',
    delete_rule: record.delete_rule ?? 'NO ACTION',
  }))
})
