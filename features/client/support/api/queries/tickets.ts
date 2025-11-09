import 'server-only'

import { cache } from 'react'
import { createClient, requireAuth, requireAdminRole } from '@/lib/supabase'
import type { Database } from '@/lib/types/database.types'
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

  return validateArray(TicketWithProfileSchema, data ?? [], 'Failed to validate user tickets')
})

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
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

  return validateArray(TicketWithProfileSchema, data ?? [], 'Failed to validate all tickets')
})

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
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

  const validatedTicket = validateItem(TicketWithProfileSchema, ticket, 'Failed to validate ticket')
  return {
    ...validatedTicket,
    replies: replies || [],
  }
})

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
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
