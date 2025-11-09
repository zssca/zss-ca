import type { ContactSubmissionRow } from '../database-aliases'

/**
 * Contact and lead management domain types
 */

export type ContactSubmission = ContactSubmissionRow

/**
 * Contact submission status
 */
export type ContactSubmissionStatus =
  | 'new'
  | 'in_progress'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'spam'
  | 'archived'

/**
 * Contact source
 */
export type ContactSource =
  | 'website_form'
  | 'landing_page'
  | 'referral'
  | 'direct'
  | 'marketing_campaign'
  | 'api'
  | 'import'

/**
 * Contact submission with metadata
 */
export interface ContactSubmissionWithMetadata extends ContactSubmissionRow {
  status: ContactSubmissionStatus
  source: ContactSource
  tags?: string[]
  assignedTo?: string | null
  lastContactedAt?: string | null
  parsedFormData?: Record<string, unknown>
}

/**
 * Contact lead score
 */
export interface ContactLeadScore {
  submissionId: string
  score: number // 0-100
  factors: Array<{
    factor: string
    weight: number
    contribution: number
  }>
  classification: 'cold' | 'warm' | 'hot'
  lastUpdated: string
}

/**
 * Contact timeline entry
 */
export interface ContactTimelineEntry {
  id: string
  submissionId: string
  timestamp: string
  type: 'submission' | 'email' | 'call' | 'meeting' | 'note' | 'status_change'
  description: string
  actor?: string
  metadata?: Record<string, unknown>
}

/**
 * Contact metrics
 */
export interface ContactMetrics {
  totalSubmissions: number
  newThisWeek: number
  newThisMonth: number
  conversionRate: number
  averageResponseTime: number // minutes
  bySource: Array<{
    source: ContactSource
    count: number
    conversionRate: number
  }>
  byStatus: Array<{
    status: ContactSubmissionStatus
    count: number
  }>
  topReferrers: Array<{
    referrer: string
    count: number
  }>
}

/**
 * Contact filter options
 */
export interface ContactFilter {
  status?: ContactSubmissionStatus
  source?: ContactSource
  dateFrom?: string
  dateTo?: string
  assignedTo?: string
  tags?: string[]
  minScore?: number
  maxScore?: number
  search?: string
}

/**
 * Contact export data
 */
export interface ContactExportData {
  id: string
  email: string
  name?: string
  phone?: string
  company?: string
  message?: string
  status: ContactSubmissionStatus
  source: ContactSource
  submittedAt: string
  tags?: string[]
  leadScore?: number
}

/**
 * Contact assignment
 */
export interface ContactAssignment {
  submissionId: string
  assignedTo: string
  assignedBy: string
  assignedAt: string
  reason?: string
}
