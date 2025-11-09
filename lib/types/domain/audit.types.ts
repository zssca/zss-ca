import type {
  AuditLogRow,
  ProfileRow,
  UserActivityLogRow,
} from '../database-aliases'

/**
 * Audit and compliance domain types
 */

export type AuditLog = AuditLogRow
export type UserActivityLog = UserActivityLogRow

/**
 * Audit log with user context
 */
export interface AuditLogWithContext extends AuditLogRow {
  actor?: ProfileRow | null
  affectedUser?: ProfileRow | null
  parsedChanges?: Record<string, unknown>
}

/**
 * Audit log filter options
 */
export interface AuditLogFilters {
  actorProfileId?: string
  profileId?: string
  resourceTable?: string
  action?: string
  dateFrom?: string
  dateTo?: string
  ipAddress?: string
}

/**
 * Audit summary by resource
 */
export interface AuditSummaryByResource {
  resourceTable: string
  totalActions: number
  creates: number
  updates: number
  deletes: number
  reads: number
  lastActivity: string
}

/**
 * Audit summary by user
 */
export interface AuditSummaryByUser {
  user: ProfileRow
  totalActions: number
  actionBreakdown: Record<string, number>
  resourcesAccessed: string[]
  lastActivity: string
}

/**
 * User activity summary
 */
export interface UserActivitySummary extends UserActivityLogRow {
  user?: ProfileRow | null
  duration?: number
  parsedDetails?: Record<string, unknown>
}

/**
 * Compliance report
 */
export interface ComplianceReport {
  period: string
  totalAuditLogs: number
  uniqueUsers: number
  resourcesModified: number
  criticalActions: number
  suspiciousActivity: Array<{
    timestamp: string
    actor: string
    action: string
    reason: string
  }>
  topUsers: AuditSummaryByUser[]
  topResources: AuditSummaryByResource[]
}

/**
 * Activity timeline entry
 */
export interface ActivityTimelineEntry {
  id: string
  timestamp: string
  actor: ProfileRow
  action: string
  resourceType: string
  resourceId?: string
  description: string
  metadata?: Record<string, unknown>
}

/**
 * Data retention status
 */
export interface DataRetentionStatus {
  table: string
  retentionDays: number
  oldestRecord: string
  recordsToArchive: number
  recordsToDelete: number
  lastArchived?: string
}
