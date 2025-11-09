import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { ChevronDown, MessageSquare, Lock } from 'lucide-react'
import { ReplyForm } from './reply-form'
import { UpdateStatusButton } from './update-status-button'
import type { TicketWithReplies } from '../api/queries'
import type { TicketPriority, TicketStatus } from '@/lib/types/database-aliases'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import {
  getTicketStatusVariant,
  getTicketPriorityVariant,
  getTicketStatusLabel,
  getTicketPriorityLabel,
} from '@/features/admin/support/utils'

interface TicketDetailProps {
  ticket: TicketWithReplies
  currentUserId: string
  isAdmin: boolean
}

function formatCategoryLabel(category: string) {
  return category
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function TicketDetail({ ticket, currentUserId: _currentUserId, isAdmin }: TicketDetailProps): React.JSX.Element {
  const createdAt = new Date(ticket.created_at)
  const canReply = ticket.status !== 'closed'

  return (
    <ItemGroup className="space-y-6">
      <Item variant="outline">
        <ItemContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <ItemTitle>{ticket.subject}</ItemTitle>
              <ItemDescription>
                Created by {ticket.profile?.contact_name || ticket.profile?.contact_email || 'Unknown'} on{' '}
                {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}
              </ItemDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getTicketPriorityVariant(ticket.priority as TicketPriority)}>
                {getTicketPriorityLabel(ticket.priority as TicketPriority)}
              </Badge>
              <Badge variant={getTicketStatusVariant(ticket.status as TicketStatus)}>
                {getTicketStatusLabel(ticket.status as TicketStatus)}
              </Badge>
            </div>
          </div>
        </ItemContent>
      </Item>

      <Item variant="outline">
        <ItemContent className="basis-full">
          <FieldSet className="space-y-4">
            <FieldLegend>Ticket details</FieldLegend>
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel>Category</FieldLabel>
                <FieldDescription>{formatCategoryLabel(ticket.category || '')}</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Message</FieldLabel>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {String(ticket['message'])}
                </p>
              </Field>
              {isAdmin && (
                <Field>
                  <FieldLabel>Admin Controls</FieldLabel>
                  <UpdateStatusButton ticketId={ticket.id} currentStatus={ticket.status} />
                </Field>
              )}
            </FieldGroup>
          </FieldSet>
        </ItemContent>
      </Item>

      {ticket.replies.length > 0 && (
        <Collapsible defaultOpen className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5" aria-hidden="true" />
              <h3 className="text-lg font-semibold">Replies ({ticket.replies.length})</h3>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Toggle replies">
                <ChevronDown className="size-4" aria-hidden="true" />
                <span className="sr-only">Toggle replies</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4">
            <ItemGroup className="space-y-4">
              {ticket.replies.map((reply) => {
                const replyCreatedAt = new Date(reply.created_at)
                const isFromAdmin = reply.profile.role === 'admin'
                const isInternalNote = reply.is_internal

                return (
                  <Item
                    key={reply.id}
                    variant="outline"
                    className={isInternalNote ? 'border-dashed bg-muted/50' : isFromAdmin ? 'border-primary' : ''}
                  >
                    <ItemContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ItemTitle>{reply.profile.contact_name || reply.profile.contact_email}</ItemTitle>
                          {isFromAdmin && <Badge variant="outline">Support Team</Badge>}
                          {isInternalNote && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Internal Note
                            </Badge>
                          )}
                        </div>
                        <ItemDescription>
                          {replyCreatedAt.toLocaleDateString()} at {replyCreatedAt.toLocaleTimeString()}
                        </ItemDescription>
                        <p className="whitespace-pre-wrap text-sm">{reply.message}</p>
                      </div>
                    </ItemContent>
                  </Item>
                )
              })}
            </ItemGroup>
          </CollapsibleContent>
        </Collapsible>
      )}

      {canReply && <ReplyForm ticketId={ticket.id} isAdmin={isAdmin} />}

      {!canReply && (
        <Alert>
          <AlertTitle>Ticket closed</AlertTitle>
          <AlertDescription>
            Contact support if you need to reopen this request.
          </AlertDescription>
        </Alert>
      )}
    </ItemGroup>
  )
}
