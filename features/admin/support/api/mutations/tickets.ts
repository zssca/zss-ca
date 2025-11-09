'use server'

import { updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendSupportTicketCreatedEmail, sendSupportTicketReplyEmail } from '@/lib/email/send'
import { createTicketSchema, replyToTicketSchema, updateTicketStatusSchema } from '../schema'

export async function createTicketAction(data: unknown) {
  // 1. Validate input with Zod
  const result = createTicketSchema.safeParse(data)

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors
    }
  }

  // 2. Create authenticated Supabase client
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 3. Perform database mutation
  const { error, data: ticket } = await supabase
    .from('support_ticket')
    .insert({
      profile_id: user.id,
      created_by_profile_id: user.id,
      subject: result.data.subject,
      message: result.data.message,
      category: result.data.category,
      priority: result.data.priority,
      status: 'open',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Ticket creation error:', error)
    return { error: 'Failed to create support ticket' }
  }

  // 4. Send ticket created email
  const { data: profile } = await supabase
    .from('profile')
    .select('contact_email, contact_name')
    .eq('id', user.id)
    .single()

  if (profile?.contact_email && profile?.contact_name && ticket) {
    await sendSupportTicketCreatedEmail(
      profile.contact_email,
      profile.contact_name,
      ticket.id,
      result.data.subject
    )
  }

  // 5. Invalidate cache with updateTag for immediate consistency
  updateTag('tickets')
  updateTag(`tickets:${user.id}`)

  return { error: null, data: { id: ticket.id } }
}

export async function replyToTicketAction(data: unknown) {
  // 1. Validate input with Zod
  const result = replyToTicketSchema.safeParse(data)

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors
    }
  }

  // 2. Create authenticated Supabase client
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 3. Verify user has access to this ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('support_ticket')
    .select('profile_id, subject')
    .eq('id', result.data.ticketId)
    .single()

  if (ticketError || !ticket) {
    return { error: 'Ticket not found' }
  }

  // 4. Check if user is the ticket owner or admin
  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('id', user.id)
    .single()

  if (ticket.profile_id !== user.id && profile?.role !== 'admin') {
    return { error: 'Unauthorized to reply to this ticket' }
  }

  // 5. Perform database mutation
  const { error } = await supabase
    .from('ticket_reply')
    .insert({
      support_ticket_id: result.data.ticketId,
      author_profile_id: user.id,
      message: result.data.message,
      is_internal: result.data.isInternal || false,
    })

  if (error) {
    console.error('Ticket reply error:', error)
    return { error: 'Failed to reply to ticket' }
  }

  // 6. Update ticket status to in_progress if it was open
  await supabase
    .from('support_ticket')
    .update({ status: 'in_progress', last_reply_at: new Date().toISOString() })
    .eq('id', result.data.ticketId)
    .eq('status', 'open')

  // 7. Send reply email to ticket owner if reply is from admin
  // IMPORTANT: Do not send email for internal notes
  if (
    profile?.role === 'admin' &&
    ticket.profile_id !== user.id &&
    !result.data.isInternal
  ) {
    const { data: ticketOwner } = await supabase
      .from('profile')
      .select('contact_email, contact_name')
      .eq('id', ticket.profile_id)
      .single()

    if (ticketOwner?.contact_email && ticketOwner?.contact_name) {
      await sendSupportTicketReplyEmail(
        ticketOwner.contact_email,
        ticketOwner.contact_name,
        result.data.ticketId,
        ticket.subject,
        result.data.message
      )
    }
  }

  // 8. Invalidate cache with updateTag for immediate consistency
  updateTag('tickets')
  updateTag(`ticket:${result.data.ticketId}`)
  updateTag(`tickets:${user.id}`)

  return { error: null }
}

export async function updateTicketStatusAction(data: unknown) {
  // 1. Validate input with Zod
  const result = updateTicketStatusSchema.safeParse(data)

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors
    }
  }

  // 2. Create authenticated Supabase client
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 3. Verify admin role - only admins can update ticket status
  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Only admins can update ticket status' }
  }

  // 4. Build updates object
  const updates: Record<string, unknown> = {
    status: result.data.status,
  }

  if (result.data.status === 'resolved') {
    updates['resolved_at'] = new Date().toISOString()
  } else if (result.data.status === 'closed') {
    updates['closed_at'] = new Date().toISOString()
  }

  // 5. Perform database mutation
  const { error } = await supabase
    .from('support_ticket')
    .update(updates)
    .eq('id', result.data.ticketId)

  if (error) {
    console.error('Ticket status update error:', error)
    return { error: 'Failed to update ticket status' }
  }

  // 6. Invalidate cache with updateTag for immediate consistency
  updateTag('tickets')
  updateTag(`ticket:${result.data.ticketId}`)

  return { error: null }
}
