import 'server-only'

import { cache } from 'react'
import { createClient, requireAuth, requireAdminRole } from '@/lib/supabase'
import type { Database } from '@/lib/types/database.types'
import type { TicketPriority, TicketStatus } from '@/lib/types/database-aliases'
import {
  TicketWithProfileSchema,
  validateArray,
  validateItem,
  type TicketWithProfile,
} from '@/lib/types/validation/database-joins'

type Profile = Database['public']['Tables']['profile']['Row']
type TicketReply = Database['public']['Tables']['ticket_reply']['Row']

// Re-export for external consumers
export type { TicketWithProfile }

export type ReplyWithProfile = TicketReply & {
  profile: Pick<Profile, 'id' | 'contact_email' | 'contact_name' | 'role'>
}

export type TicketWithReplies = TicketWithProfile & {
  replies: ReplyWithProfile[]
}

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
// Parameterized cache for user-specific tickets
export const getUserTickets = cache(async (userId: string): Promise<TicketWithProfile[]> => {
  const supabase = await createClient()
  await requireAuth(supabase)

  const { data, error } = await supabase
    .from('support_ticket')
    .select(
      `
      id,
      profile_id,
      subject,
      message,
      status,
      priority,
      category,
      created_at,
      updated_at,
      profile:profile_id(id, contact_email, contact_name)
    `
    )
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user tickets:', error)
    return []
  }

  // Runtime validation with Zod (replaces unsafe type casting)
  return validateArray(
    TicketWithProfileSchema,
    data ?? [],
    'Failed to validate user tickets'
  )
})

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
// Page uses dynamic = 'force-dynamic' for real-time admin data
export const listTickets = cache(async (): Promise<TicketWithProfile[]> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('support_ticket')
    .select(
      `
      id,
      profile_id,
      subject,
      message,
      status,
      priority,
      category,
      created_at,
      updated_at,
      profile:profile_id(id, contact_email, contact_name)
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all tickets:', error)
    return []
  }

  // Runtime validation with Zod (replaces unsafe type casting)
  return validateArray(
    TicketWithProfileSchema,
    data ?? [],
    'Failed to validate all tickets'
  )
})

/**
 * Search tickets using database full-text search indexes
 * Implements P0 search performance requirement using pg_trgm indexes
 *
 * @param searchQuery - Search term to match against subject, message, company name
 * @param statusFilter - Optional status filter
 * @param priorityFilter - Optional priority filter
 * @param limit - Maximum results (default 50 for performance)
 * @param offset - Pagination offset
 */
export const searchTickets = cache(
  async (params?: {
    searchQuery?: string
    statusFilter?: TicketStatus[]
    priorityFilter?: TicketPriority[]
    limit?: number
    offset?: number
  }): Promise<{ tickets: TicketWithProfile[]; totalCount: number }> => {
    const supabase = await createClient()
    const user = await requireAuth(supabase)
    await requireAdminRole(supabase, user.id)

    const limit = params?.limit || 50
    const offset = params?.offset || 0

    let query = supabase
      .from('support_ticket')
      .select(
        `
        id,
        profile_id,
        subject,
        message,
        status,
        priority,
        category,
        created_at,
        updated_at,
        profile:profile_id(id, contact_email, contact_name, company_name)
      `,
        { count: 'exact' }
      )

    // Apply search using database indexes (pg_trgm for fuzzy matching)
    if (params?.searchQuery && params.searchQuery.trim()) {
      const searchTerm = params.searchQuery.trim()
      // Use ilike with % for trigram index matching
      query = query.or(
        `subject.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%,profile.company_name.ilike.%${searchTerm}%,profile.contact_name.ilike.%${searchTerm}%`
      )
    }

    // Apply status filter
    if (params?.statusFilter && params.statusFilter.length > 0) {
      query = query.in('status', params.statusFilter as readonly TicketStatus[])
    }

    // Apply priority filter
    if (params?.priorityFilter && params.priorityFilter.length > 0) {
      query = query.in('priority', params.priorityFilter as readonly TicketPriority[])
    }

    // Order and paginate
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error searching tickets:', error)
      return { tickets: [], totalCount: 0 }
    }

    // Runtime validation with Zod (replaces unsafe type casting)
    return {
      tickets: validateArray(
        TicketWithProfileSchema,
        data ?? [],
        'Failed to validate searched tickets'
      ),
      totalCount: count || 0,
    }
  }
)

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
// Parameterized cache for ticket details with replies
export const getTicketById = cache(async (
  ticketId: string
): Promise<TicketWithReplies | null> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Build query with user ownership filter for non-admin users
  let ticketQuery = supabase
    .from('support_ticket')
    .select(
      `
      id,
      profile_id,
      subject,
      message,
      status,
      priority,
      category,
      created_at,
      updated_at,
      profile:profile_id(id, contact_email, contact_name)
    `
    )
    .eq('id', ticketId)

  // Non-admin users can only view their own tickets
  if (!isAdmin) {
    ticketQuery = ticketQuery.eq('profile_id', user.id)
  }

  // Build reply query with internal filtering for non-admin users
  let replyQuery = supabase
    .from('ticket_reply')
    .select(
      `
      id,
      support_ticket_id,
      author_profile_id,
      message,
      is_internal,
      created_at,
      updated_at,
      profile:author_profile_id(id, contact_email, contact_name, role)
    `
    )
    .eq('support_ticket_id', ticketId)
    .order('created_at', { ascending: true })

  // SECURITY: Non-admin users should not see internal notes
  if (!isAdmin) {
    replyQuery = replyQuery.eq('is_internal', false)
  }

  // ✅ Next.js 15+: Use Promise.all to avoid sequential waterfall
  const [
    { data: ticket, error: ticketError },
    { data: replies, error: repliesError }
  ] = await Promise.all([
    ticketQuery.single(),
    replyQuery
  ])

  if (ticketError || !ticket) {
    console.error('Error fetching ticket:', ticketError)
    return null
  }

  if (repliesError) {
    console.error('Error fetching replies:', repliesError)
  }

  // Runtime validation with Zod (replaces unsafe type casting)
  // Note: replies validation uses passthrough for now since ReplyWithProfile needs its own schema
  const validatedTicket = validateItem(
    TicketWithProfileSchema,
    ticket,
    'Failed to validate ticket detail'
  )

  return {
    ...validatedTicket,
    replies: replies || [],
  }
})

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
// Parameterized cache for profile role check
export const getAdminTicketProfile = cache(async (
  userId: string
): Promise<Pick<Profile, 'role'> | null> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('profile')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
})
