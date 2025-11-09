'use server'

import { createClient } from '@/lib/supabase/server'
import type { ContactSubmissionWithProfile } from '../queries'

/**
 * Export contact submissions to CSV format
 * Implements P0 data loss prevention requirement
 */
export async function exportContactSubmissionsToCSV(params?: {
  status?: string
  serviceInterest?: string
  searchQuery?: string
}): Promise<{
  success: boolean
  csv?: string
  filename?: string
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
      return { success: false, error: 'Unauthorized' }
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profile')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Build query - fetch ALL matching records for export
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
      `
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

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch contact submissions for export:', error)
      return {
        success: false,
        error: 'Failed to fetch submissions',
      }
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No submissions to export',
      }
    }

    // Generate CSV
    const csv = generateCSV(data as ContactSubmissionWithProfile[])

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `contact-submissions-${timestamp}.csv`

    return {
      success: true,
      csv,
      filename,
    }
  } catch (error) {
    console.error('Error exporting contact submissions:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Generate CSV string from contact submissions
 */
function generateCSV(submissions: ContactSubmissionWithProfile[]): string {
  // CSV Headers
  const headers = [
    'ID',
    'Full Name',
    'Email',
    'Phone',
    'Company',
    'Service Interest',
    'Message',
    'Status',
    'Lead Score',
    'Landing Page',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Assigned To',
    'Created At',
    'Updated At',
    'Contacted At',
    'Converted At',
  ]

  // Escape CSV field (handle commas, quotes, newlines)
  const escapeCSV = (value: string | null | undefined): string => {
    if (value === null || value === undefined) return ''
    const stringValue = String(value)
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  // Format date for CSV
  const formatDate = (date: string | null): string => {
    if (!date) return ''
    try {
      return new Date(date).toISOString()
    } catch {
      return ''
    }
  }

  // Build CSV rows
  const rows = submissions.map((submission) => {
    const assignedTo = submission.assigned_to_profile
      ? `${submission.assigned_to_profile.contact_name || ''} (${submission.assigned_to_profile.contact_email || ''})`
      : ''

    return [
      escapeCSV(submission.id),
      escapeCSV(submission.full_name),
      escapeCSV(submission.email),
      escapeCSV(submission.phone),
      escapeCSV(submission.company_name),
      escapeCSV(submission.service_interest),
      escapeCSV(submission.message),
      escapeCSV(submission.status || 'new'),
      escapeCSV(String(submission.lead_score || 0)),
      escapeCSV(submission.landing_page || submission.referrer_url),
      escapeCSV(submission.utm_source),
      escapeCSV(submission.utm_medium),
      escapeCSV(submission.utm_campaign),
      escapeCSV(assignedTo),
      formatDate(submission.created_at),
      formatDate(submission.updated_at),
      formatDate(submission.contacted_at),
      formatDate(submission.converted_at),
    ].join(',')
  })

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n')
}
