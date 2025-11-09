'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database.types'

type ContactSubmission = Database['public']['Tables']['contact_submission']['Row']

export interface ContactSubmissionWithProfile extends ContactSubmission {
  assigned_to_profile?: {
    id: string
    contact_name: string | null
    contact_email: string | null
  } | null
}

export async function getContactSubmissions(params?: {
  status?: string
  serviceInterest?: string
  searchQuery?: string
  limit?: number
  offset?: number
}): Promise<{
  submissions: ContactSubmissionWithProfile[]
  totalCount: number
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { submissions: [], totalCount: 0, error: 'Unauthorized' }
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profile')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { submissions: [], totalCount: 0, error: 'Unauthorized' }
    }

    // Build query
    let query = supabase
      .from('contact_submission')
      .select(
        `
        *,
        assigned_to_profile:profile!contact_submission_assigned_to_fkey (
          id,
          contact_name,
          contact_email
        )
      `,
        { count: 'exact' }
      )
      .is('deleted_at', null)

    // Apply filters
    if (params?.status) {
      query = query.eq('status', params.status)
    }

    if (params?.serviceInterest) {
      query = query.eq('service_interest', params.serviceInterest)
    }

    // Search across name, email, company
    if (params?.searchQuery) {
      query = query.or(
        `full_name.ilike.%${params.searchQuery}%,email.ilike.%${params.searchQuery}%,company_name.ilike.%${params.searchQuery}%`
      )
    }

    // Order by created_at desc (newest first)
    query = query.order('created_at', { ascending: false })

    // Pagination
    if (params?.limit) {
      query = query.limit(params.limit)
    }
    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params?.limit || 50) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Failed to fetch contact submissions:', error)
      return {
        submissions: [],
        totalCount: 0,
        error: 'Failed to fetch submissions',
      }
    }

    return {
      submissions: data || [],
      totalCount: count || 0,
    }
  } catch (error) {
    console.error('Error fetching contact submissions:', error)
    return {
      submissions: [],
      totalCount: 0,
      error: 'An unexpected error occurred',
    }
  }
}

export async function getContactSubmissionById(
  id: string
): Promise<{ submission: ContactSubmissionWithProfile | null; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { submission: null, error: 'Unauthorized' }
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profile')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { submission: null, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('contact_submission')
      .select(
        `
        *,
        assigned_to_profile:profile!contact_submission_assigned_to_fkey (
          id,
          contact_name,
          contact_email
        )
      `
      )
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Failed to fetch contact submission:', error)
      return { submission: null, error: 'Submission not found' }
    }

    return { submission: data }
  } catch (error) {
    console.error('Error fetching contact submission:', error)
    return { submission: null, error: 'An unexpected error occurred' }
  }
}

export async function getContactSubmissionStats(): Promise<{
  stats: {
    total: number
    new: number
    contacted: number
    qualified: number
    converted: number
    closedLost: number
  }
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        stats: { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, closedLost: 0 },
        error: 'Unauthorized',
      }
    }

    const { data, error } = await supabase
      .from('contact_submission')
      .select('status')
      .is('deleted_at', null)

    if (error) {
      console.error('Failed to fetch submission stats:', error)
      return {
        stats: { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, closedLost: 0 },
        error: 'Failed to fetch stats',
      }
    }

    const stats = {
      total: data.length,
      new: data.filter((s) => s.status === 'new').length,
      contacted: data.filter((s) => s.status === 'contacted').length,
      qualified: data.filter((s) => s.status === 'qualified').length,
      converted: data.filter((s) => s.status === 'converted').length,
      closedLost: data.filter((s) => s.status === 'closed_lost').length,
    }

    return { stats }
  } catch (error) {
    console.error('Error fetching submission stats:', error)
    return {
      stats: { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, closedLost: 0 },
      error: 'An unexpected error occurred',
    }
  }
}
