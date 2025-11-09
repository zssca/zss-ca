import type {
  ProfileRow,
  SupportTicketRow,
  TicketReplyRow,
} from '../database-aliases'

export type Ticket = SupportTicketRow
export type TicketReply = TicketReplyRow

export interface TicketWithRelations extends SupportTicketRow {
  requester: ProfileRow
  assignedTo?: ProfileRow | null
  replies: Array<TicketReplyRow & { author: ProfileRow }>
}

export interface TicketTimelineEntry {
  id: string
  type: 'ticket_created' | 'status_changed' | 'reply_added' | 'assignment'
  timestamp: string
  payload?: Record<string, unknown>
}

export interface SupportDashboardMetrics {
  open: number
  inProgress: number
  awaitingClient: number
  resolved: number
  averageResponseMinutes: number
  satisfactionScore?: number
  backlogSize: number
}

export interface SupportTicketFilters {
  status?: SupportTicketRow['status']
  priority?: SupportTicketRow['priority']
  category?: SupportTicketRow['category']
  assignedTo?: string
  profileId?: string
}
