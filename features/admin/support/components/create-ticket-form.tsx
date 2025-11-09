'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Form } from '@/components/ui/form'
import {
  FieldDescription,
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
import { createTicketSchema, type CreateTicketInput } from '../api/schema'
import { createTicketAction } from '../api/mutations'
import { ROUTES } from '@/lib/constants/routes'
import { CreateTicketSubjectField } from './create-ticket-subject-field'
import { CreateTicketRoutingFields } from './create-ticket-routing-fields'
import { CreateTicketMessageField } from './create-ticket-message-field'

export function CreateTicketForm(): React.JSX.Element {
  const router = useRouter()
  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: '',
      message: '',
      category: 'general_inquiry',
      priority: 'medium',
    },
  })

  async function onSubmit(data: CreateTicketInput): Promise<void> {
    const result = await createTicketAction(data)

    if ('error' in result) {
      toast.error('Failed to create ticket', {
        description: result.error,
      })
    } else {
      toast.success('Ticket created successfully', {
        description: 'We will respond to your ticket as soon as possible.',
      })
      form.reset()
      router.push(ROUTES.CLIENT_SUPPORT)
      router.refresh()
    }
  }

  return (
    <Item variant="outline" className="flex flex-col gap-4 p-6">
      <ItemHeader className="flex-col items-start gap-2">
        <ItemTitle>Create Support Ticket</ItemTitle>
        <ItemDescription>We&apos;ll respond to your ticket as soon as possible</ItemDescription>
      </ItemHeader>
      <ItemContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldSet className="space-y-4">
              <FieldLegend>Ticket summary</FieldLegend>
              <FieldGroup className="space-y-4">
                <CreateTicketSubjectField control={form.control} />
              </FieldGroup>
            </FieldSet>

            <FieldSet className="space-y-4">
              <FieldLegend>Routing details</FieldLegend>
              <FieldDescription>Select the category and urgency so support can triage faster.</FieldDescription>
              <FieldGroup className="grid gap-6 sm:grid-cols-2">
                <CreateTicketRoutingFields control={form.control} />
              </FieldGroup>
            </FieldSet>

            <CreateTicketMessageField
              control={form.control}
              handleSubmit={form.handleSubmit}
              onSubmit={onSubmit}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Spinner /> : 'Create Ticket'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </ItemContent>
    </Item>
  )
}
