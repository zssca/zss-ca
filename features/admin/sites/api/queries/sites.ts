import 'server-only'

import { cache } from 'react'
import { createClient, requireAuth, requireAdminRole } from '@/lib/supabase'
import type { Database } from '@/lib/types/database.types'
import type { SiteStatus } from '@/lib/types/database-aliases'

type ClientSite = Database['public']['Tables']['client_site']['Row']
type Profile = Database['public']['Tables']['profile']['Row']
type Plan = Database['public']['Tables']['plan']['Row']
type Subscription = Database['public']['Tables']['subscription']['Row']

export type SiteWithRelations = ClientSite & {
  profile: Pick<Profile, 'id' | 'contact_name' | 'contact_email' | 'company_name'>
  plan: Pick<Plan, 'id' | 'name' | 'slug'> | null
  subscription: Pick<Subscription, 'id' | 'status'> | null
}

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
// Page uses dynamic = 'force-dynamic' for real-time admin data
export const listSites = cache(async (): Promise<SiteWithRelations[]> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  const { data: sites } = await supabase
    .from('client_site')
    .select(`
      id,
      profile_id,
      site_name,
      deployment_url,
      custom_domain,
      plan_id,
      subscription_id,
      status,
      created_at,
      updated_at,
      deployed_at,
      deployment_notes,
      design_brief,
      slug,
      last_revision_at,
      deleted_at,
      profile:profile_id(id, contact_name, contact_email, company_name),
      plan:plan_id(id, name, slug),
      subscription:subscription_id(id, status)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (sites as SiteWithRelations[]) || []
})

/**
 * Search sites using database full-text search indexes
 * Implements P0 search performance requirement using pg_trgm indexes
 *
 * @param searchQuery - Search term to match against site_name, company_name, email, domain
 * @param statusFilter - Optional status filter
 * @param limit - Maximum results (default 50 for performance)
 * @param offset - Pagination offset
 */
export const searchSites = cache(
  async (params?: {
    searchQuery?: string
    statusFilter?: SiteStatus[]
    limit?: number
    offset?: number
  }): Promise<{ sites: SiteWithRelations[]; totalCount: number }> => {
    const supabase = await createClient()
    const user = await requireAuth(supabase)
    await requireAdminRole(supabase, user.id)

    const limit = params?.limit || 50
    const offset = params?.offset || 0

    let query = supabase
      .from('client_site')
      .select(
        `
        id,
        profile_id,
        site_name,
        deployment_url,
        custom_domain,
        plan_id,
        subscription_id,
        status,
        created_at,
        updated_at,
        deployed_at,
        deployment_notes,
        design_brief,
        slug,
        last_revision_at,
        deleted_at,
        profile:profile_id(id, contact_name, contact_email, company_name),
        plan:plan_id(id, name, slug),
        subscription:subscription_id(id, status)
      `,
        { count: 'exact' }
      )
      .is('deleted_at', null)

    // Apply search using database indexes (pg_trgm for fuzzy matching)
    if (params?.searchQuery && params.searchQuery.trim()) {
      const searchTerm = params.searchQuery.trim()
      // Use ilike with % for trigram index matching
      query = query.or(
        `site_name.ilike.%${searchTerm}%,deployment_url.ilike.%${searchTerm}%,custom_domain.ilike.%${searchTerm}%,profile.company_name.ilike.%${searchTerm}%,profile.contact_name.ilike.%${searchTerm}%,profile.contact_email.ilike.%${searchTerm}%`
      )
    }

    // Apply status filter
    if (params?.statusFilter && params.statusFilter.length > 0) {
      query = query.in('status', params.statusFilter as readonly SiteStatus[])
    }

    // Order and paginate
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: sites, count } = await query

    return {
      sites: (sites as SiteWithRelations[]) || [],
      totalCount: count || 0,
    }
  }
)

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
// Parameterized cache for client-specific sites
export const getSitesByClientId = cache(async (profileId: string): Promise<ClientSite[]> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  const { data: sites } = await supabase
    .from('client_site')
    .select(`
      id,
      profile_id,
      site_name,
      deployment_url,
      custom_domain,
      plan_id,
      subscription_id,
      status,
      design_brief,
      created_at,
      updated_at,
      deployed_at,
      deployment_notes,
      slug,
      last_revision_at,
      deleted_at
    `)
    .eq('profile_id', profileId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return sites || []
})
