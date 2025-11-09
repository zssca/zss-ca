/**
 * Centralized badge variant utility functions
 *
 * This module provides consistent badge variants across the application
 * for status, priority, and subscription displays.
 *
 * PATTERN: All badge variant logic should be centralized here to ensure
 * consistent colors and avoid inline ternary logic in components.
 */

import type { Database } from '@/lib/types/database.types'

// Badge variant type
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined
type TicketStatus = Database['public']['Tables']['support_ticket']['Row']['status']
type TicketPriority = Database['public']['Tables']['support_ticket']['Row']['priority']
type SubscriptionStatus = Database['public']['Tables']['subscription']['Row']['status']
type SiteStatus = Database['public']['Tables']['client_site']['Row']['status']

/**
 * Get badge variant for site status
 *
 * @param status - The site status from database
 * @returns The appropriate badge variant for UI display
 */
export function getSiteStatusBadgeVariant(status: SiteStatus): BadgeVariant {
  switch (status) {
    case 'live':
      return 'default'
    case 'in_production':
      return 'secondary'
    case 'ready_for_review':
      return 'outline'
    case 'pending':
      return 'outline'
    case 'awaiting_client_content':
      return 'secondary'
    case 'paused':
      return 'secondary'
    case 'archived':
      return 'outline'
    default:
      return 'outline'
  }
}

/**
 * Get badge variant for ticket priority
 *
 * @param priority - The ticket priority from database
 * @returns The appropriate badge variant for UI display
 */
export function getTicketPriorityBadgeVariant(priority: TicketPriority): BadgeVariant {
  switch (priority) {
    case 'urgent':
      return 'destructive'
    case 'high':
      return 'destructive'
    case 'medium':
      return 'secondary'
    case 'low':
      return 'outline'
    default:
      return 'default'
  }
}

/**
 * Get badge variant for ticket status
 *
 * @param status - The ticket status from database
 * @returns The appropriate badge variant for UI display
 */
export function getTicketStatusBadgeVariant(status: TicketStatus): BadgeVariant {
  switch (status) {
    case 'open':
      return 'default'
    case 'in_progress':
      return 'secondary'
    case 'resolved':
      return 'outline'
    case 'closed':
      return 'outline'
    default:
      return 'default'
  }
}

/**
 * Get badge variant for subscription status
 *
 * @param status - The subscription status from database
 * @returns The appropriate badge variant for UI display
 */
export function getSubscriptionBadgeVariant(status: SubscriptionStatus): BadgeVariant {
  switch (status) {
    case 'active':
      return 'default'
    case 'past_due':
      return 'destructive'
    case 'canceled':
      return 'secondary'
    case 'trialing':
      return 'outline'
    case 'incomplete':
      return 'secondary'
    case 'unpaid':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * Format status string for display
 * Converts snake_case to Title Case
 *
 * @param status - The status string to format
 * @returns The formatted status string
 */
export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
}
