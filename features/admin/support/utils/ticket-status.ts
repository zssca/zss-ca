import type { TicketPriority, TicketStatus } from '@/lib/types/database-aliases'

/**
 * Badge variant type for UI display
 */
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

/**
 * Get badge variant for ticket status
 *
 * @param status - The ticket status from database
 * @returns The appropriate badge variant for UI display
 */
export function getTicketStatusVariant(status: TicketStatus): BadgeVariant {
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
 * Get badge variant for ticket priority
 *
 * @param priority - The ticket priority from database
 * @returns The appropriate badge variant for UI display
 */
export function getTicketPriorityVariant(priority: TicketPriority): BadgeVariant {
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
 * Get human-readable status label
 */
export function getTicketStatusLabel(status: TicketStatus): string {
  switch (status) {
    case 'open':
      return 'Open'
    case 'in_progress':
      return 'In Progress'
    case 'resolved':
      return 'Resolved'
    case 'closed':
      return 'Closed'
    default:
      return status
  }
}

/**
 * Get human-readable priority label
 */
export function getTicketPriorityLabel(priority: TicketPriority): string {
  switch (priority) {
    case 'urgent':
      return 'Urgent'
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'low':
      return 'Low'
    default:
      return priority
  }
}
