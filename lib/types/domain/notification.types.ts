import type {
  NotificationRow,
  NotificationHistoryRow,
  ProfileRow,
  NotificationType,
} from '../database-aliases'

/**
 * Notification and messaging domain types
 */

export type Notification = NotificationRow
export type NotificationHistory = NotificationHistoryRow

/**
 * Notification with recipient context
 */
export interface NotificationWithRecipient extends NotificationRow {
  recipient?: ProfileRow | null
}

/**
 * Notification delivery status
 */
export type NotificationDeliveryStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'bounced'

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
  types: {
    [K in NotificationType]?: boolean
  }
  frequency?: 'immediate' | 'daily' | 'weekly'
  quietHours?: {
    enabled: boolean
    start?: string // HH:mm format
    end?: string
  }
}

/**
 * Notification template
 */
export interface NotificationTemplate {
  id: string
  type: NotificationType
  channel: 'email' | 'sms' | 'push' | 'in_app'
  subject?: string
  body: string
  variables: string[]
  isActive: boolean
}

/**
 * Notification batch
 */
export interface NotificationBatch {
  id: string
  type: NotificationType
  recipientCount: number
  sentCount: number
  failedCount: number
  createdAt: string
  completedAt?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

/**
 * Notification metrics
 */
export interface NotificationMetrics {
  totalSent: number
  delivered: number
  read: number
  failed: number
  bounced: number
  deliveryRate: number
  readRate: number
  period: string
  byType: Array<{
    type: NotificationType
    count: number
    deliveryRate: number
  }>
}

/**
 * In-app notification
 */
export interface InAppNotification extends NotificationRow {
  isRead: boolean
  readAt?: string | null
  actionUrl?: string
  icon?: string
}

/**
 * Notification history summary
 */
export interface NotificationHistorySummary extends NotificationHistoryRow {
  notification: NotificationRow
  recipient: ProfileRow
}

/**
 * Notification filter
 */
export interface NotificationFilter {
  profileId?: string
  type?: NotificationType
  isRead?: boolean
  dateFrom?: string
  dateTo?: string
  status?: NotificationDeliveryStatus
}
