import type { WebhookEventRow } from '../database-aliases'

/**
 * Webhook and integration domain types
 */

export type WebhookEvent = WebhookEventRow

/**
 * Webhook event status
 */
export type WebhookEventStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'

/**
 * Webhook event with retry information
 */
export interface WebhookEventWithRetries extends WebhookEventRow {
  totalRetries: number
  nextRetryAt?: string | null
  canRetry: boolean
  failureReason?: string
}

/**
 * Webhook delivery attempt
 */
export interface WebhookDeliveryAttempt {
  attemptNumber: number
  timestamp: string
  statusCode?: number
  responseBody?: string
  error?: string
  duration?: number
}

/**
 * Webhook endpoint configuration
 */
export interface WebhookEndpoint {
  url: string
  events: string[]
  isActive: boolean
  secret?: string
  headers?: Record<string, string>
}

/**
 * Webhook event payload
 */
export interface WebhookPayload<T = unknown> {
  event: string
  timestamp: string
  data: T
  metadata?: Record<string, unknown>
}

/**
 * Webhook processing result
 */
export interface WebhookProcessingResult {
  eventId: string
  success: boolean
  processedAt: string
  error?: string
  retryScheduled?: boolean
  nextRetryAt?: string
}

/**
 * Webhook metrics summary
 */
export interface WebhookMetrics {
  totalEvents: number
  successful: number
  failed: number
  pending: number
  retrying: number
  averageProcessingTime: number
  successRate: number
  period: string
}

/**
 * Webhook event filter
 */
export interface WebhookEventFilter {
  eventType?: string
  status?: WebhookEventStatus
  dateFrom?: string
  dateTo?: string
  source?: string
}
