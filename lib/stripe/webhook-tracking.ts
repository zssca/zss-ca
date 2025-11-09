import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

interface WebhookEventRecord {
  stripe_event_id: string
  event_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processed_at?: string
  event_data?: Record<string, unknown>
  error_message?: string
  retry_count?: number
  last_retry_at?: string
}

/**
 * Check if a webhook event has already been processed
 * Returns the existing record if found, null otherwise
 */
export async function checkWebhookIdempotency(
  eventId: string
): Promise<WebhookEventRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('stripe_event_id', eventId)
    .single()

  if (error) {
    // If no record found, that's fine - event is new
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error checking webhook idempotency:', error)
    throw error
  }

  return data as WebhookEventRecord
}

/**
 * Create a new webhook event record
 */
export async function createWebhookEvent(
  event: Stripe.Event
): Promise<WebhookEventRecord> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('webhook_events')
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      status: 'processing',
      event_data: JSON.parse(JSON.stringify(event.data)),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating webhook event:', error)
    throw error
  }

  return data as WebhookEventRecord
}

/**
 * Mark a webhook event as completed
 */
export async function markWebhookCompleted(eventId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('webhook_events')
    .update({
      status: 'completed',
      processed_at: new Date().toISOString(),
    })
    .eq('stripe_event_id', eventId)

  if (error) {
    console.error('Error marking webhook as completed:', error)
    // Don't throw - we don't want to fail the webhook if tracking fails
  }
}

/**
 * Mark a webhook event as failed
 */
export async function markWebhookFailed(
  eventId: string,
  errorMessage: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('webhook_events')
    .update({
      status: 'failed',
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    })
    .eq('stripe_event_id', eventId)

  if (error) {
    console.error('Error marking webhook as failed:', error)
    // Don't throw - we don't want to fail the webhook if tracking fails
  }
}

/**
 * Increment retry count for a webhook event
 */
export async function incrementWebhookRetry(eventId: string): Promise<void> {
  const supabase = await createClient()

  // Manual increment since RPC function doesn't exist
  const { data: current } = await supabase
    .from('webhook_events')
    .select('retry_count')
    .eq('stripe_event_id', eventId)
    .single()

  if (current) {
    await supabase
      .from('webhook_events')
      .update({
        retry_count: (current.retry_count || 0) + 1,
        last_retry_at: new Date().toISOString(),
      })
      .eq('stripe_event_id', eventId)
  }
}

/**
 * Send webhook failure alert to admin
 */
export async function sendWebhookFailureAlert(
  eventId: string,
  eventType: string,
  errorMessage: string,
  retryCount: number
): Promise<void> {
  const supabase = await createClient()

  // Get admin profiles
  const { data: admins } = await supabase
    .from('profile')
    .select('id')
    .eq('role', 'admin')

  if (!admins || admins.length === 0) {
    console.error('No admin profiles found to send webhook failure alert')
    return
  }

  // Create notification for each admin
  const notifications = admins.map((admin) => ({
    profile_id: admin.id,
    notification_type: 'system' as const,
    title: 'Webhook Processing Failed',
    body: `Webhook event ${eventType} (ID: ${eventId}) failed after ${retryCount} retries. Error: ${errorMessage.substring(0, 200)}`,
    action_url: '/admin/webhooks',
  }))

  const { error } = await supabase.from('notification').insert(notifications)

  if (error) {
    console.error('Error creating webhook failure notification:', error)
  }
}

/**
 * Retry a webhook handler with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  eventId: string,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn()

      // Success - increment retry count if this wasn't the first attempt
      if (attempt > 0) {
        await incrementWebhookRetry(eventId)
      }

      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on final attempt
      if (attempt === maxRetries) {
        break
      }

      // Calculate exponential backoff delay: 1s, 2s, 4s, 8s, etc.
      const delayMs = initialDelayMs * Math.pow(2, attempt)

      console.log(
        `Webhook retry attempt ${attempt + 1}/${maxRetries} failed. ` +
        `Retrying in ${delayMs}ms. Error: ${lastError.message}`
      )

      await incrementWebhookRetry(eventId)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  // All retries exhausted - throw the last error
  throw lastError
}
