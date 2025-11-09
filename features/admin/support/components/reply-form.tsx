'use client'

import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Spinner } from '@/components/ui/spinner'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'
import { replyToTicketSchema, type ReplyToTicketInput } from '../api/schema'
import { replyToTicketAction } from '../api/mutations'
import { FormFieldLayout } from '@/features/shared/components/form-field-layout'
import { Lock } from 'lucide-react'

interface ReplyFormProps {
  ticketId: string
  isAdmin?: boolean
}

export function ReplyForm({ ticketId, isAdmin = false }: ReplyFormProps): React.JSX.Element {
  const router = useRouter()
  const resolver = zodResolver(replyToTicketSchema) as Resolver<ReplyToTicketInput>
  const form = useForm<ReplyToTicketInput, undefined, ReplyToTicketInput>({
    resolver,
    defaultValues: {
      ticketId,
      message: '',
      isInternal: false,
    },
  })

  async function onSubmit(data: ReplyToTicketInput): Promise<void> {
    const result = await replyToTicketAction(data)

    if ('error' in result) {
      toast.error('Failed to send reply', {
        description: result.error,
      })
    } else {
      toast.success('Reply sent successfully')
      form.reset({ ticketId, message: '', isInternal: false })
      router.refresh()
    }
  }

  return (
    <Item variant="outline">
      <ItemHeader>
        <ItemTitle>Add Reply</ItemTitle>
        <ItemDescription>Continue the conversation with our support team</ItemDescription>
      </ItemHeader>
      <ItemContent className="basis-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldSet className="space-y-3">
              <FieldLegend>Reply message</FieldLegend>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldLayout
                        label="Your Reply"
                        description={
                          <span className="flex items-center gap-1">
                            Press <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> to send
                          </span>
                        }
                      >
                        <FormControl>
                          <Textarea
                            placeholder="Type your reply here..."
                            className="min-h-32"
                            {...field}
                            onKeyDown={(e) => {
                              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                e.preventDefault()
                                form.handleSubmit(onSubmit)()
                              }
                            }}
                          />
                        </FormControl>
                      </FormFieldLayout>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldGroup>

              {/* Internal Note Toggle - Only show for admin users */}
              {isAdmin && (
                <FieldGroup>
                  <FormField
                    control={form.control}
                    name="isInternal"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <label
                            className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                            onClick={() => field.onChange(!field.value)}
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Internal Note
                          </label>
                          <p className="text-xs text-muted-foreground">
                            This note will only be visible to staff members
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldGroup>
              )}
            </FieldSet>

            <div className="flex gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Spinner /> : 'Send Reply'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={form.formState.isSubmitting}
                onClick={() => form.reset({ ticketId, message: '', isInternal: false })}
              >
                Clear
              </Button>
            </div>
          </form>
        </Form>
      </ItemContent>
    </Item>
  )
}
