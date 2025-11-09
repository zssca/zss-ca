import { z } from 'zod'
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from '@/lib/constants/schema-enums'

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(5000, 'Message must be less than 5000 characters'),
  category: z.enum(TICKET_CATEGORIES, {
    message: 'Please select a category',
  }),
  priority: z.enum(TICKET_PRIORITIES, {
    message: 'Please select a priority',
  }),
})

export const replyToTicketSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
  message: z
    .string()
    .min(10, 'Reply must be at least 10 characters')
    .max(5000, 'Reply must be less than 5000 characters'),
  isInternal: z.boolean().default(false),
})

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
  status: z.enum(TICKET_STATUSES),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type CreateReplyInput = z.infer<typeof replyToTicketSchema>
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>

// Legacy export alias for compatibility
export type ReplyToTicketInput = CreateReplyInput

// Export schema with new name
export { replyToTicketSchema as createReplySchema }
