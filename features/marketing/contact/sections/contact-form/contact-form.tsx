'use client'

import { useActionState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { SectionContainer } from '@/components/layout/shared'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { submitContactForm } from '../../api'
import { contactFormData } from './contact-form.data'
import { ContactFormSubmitButton } from './contact-form-submit-button'

const contactFieldLabels: Record<string, string> = {
  fullName: 'Full Name',
  email: 'Email',
  companyName: 'Company Name',
  phone: 'Phone',
  serviceInterest: 'Service Interest',
  message: 'Message',
}

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, {})
  const headingId = 'contact-form-heading'
  const defaultServiceInterest = contactFormData.serviceOptions[0]?.value ?? 'website_build'

  useEffect(() => {
    if (!isPending && state) {
      if (state.success) {
        toast.success('Message sent successfully', {
          description: contactFormData.successMessage,
        })
      } else if (state.errors && Object.keys(state.errors).length > 0) {
        const firstErrorKey = Object.keys(state.errors)[0]
        if (firstErrorKey) {
          const target = document.getElementById(firstErrorKey)
          target?.focus()
        }
      } else if (state.message && !state.success) {
        toast.error('Failed to send message', {
          description: state.message,
        })
      }
    }
  }, [state, isPending])

  const hasErrors = Boolean(state?.errors && Object.keys(state.errors).length > 0)
  const errorSummaryId = hasErrors ? 'contact-form-errors' : undefined
  const getErrorMessage = (field: string) => state?.errors?.[field]?.[0]

  return (
    <SectionContainer aria-labelledby={headingId}>
      <ItemGroup className="gap-10">
        <Item
          className="flex w-full flex-col items-center border-0 p-0 text-center"
          aria-labelledby={headingId}
        >
          <ItemContent className="max-w-2xl items-center gap-3 text-center">
            <ItemTitle id={headingId} className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {contactFormData.heading}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {contactFormData.description}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <Item
            variant="outline"
            className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-border/70 bg-background/80 p-6 shadow-xs md:p-8"
          >
            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
              {isPending && 'Form is submitting, please wait'}
              {state?.success && !isPending && state.message}
            </div>

            {hasErrors && state?.errors ? (
              <Alert
                id={errorSummaryId}
                variant="destructive"
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
              >
                <AlertCircle className="size-4" aria-hidden="true" />
                <AlertTitle>Please fix the following errors</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-left">
                    {Object.entries(state.errors).map(([field, messages]) => {
                      const label = contactFieldLabels[field] ?? field
                      return (
                        <li key={field}>
                          <a href={`#${field}`} className="underline hover:no-underline">
                            {label}: {messages?.[0]}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}

            <form
              action={formAction}
              className="space-y-6"
              aria-describedby={errorSummaryId}
              noValidate
            >
              <FieldSet disabled={isPending}>
                <FieldDescription className="sr-only">
                  All fields marked with an asterisk are required.
                </FieldDescription>
                <FieldGroup className="grid gap-6 sm:grid-cols-2">
                  <Field data-invalid={Boolean(getErrorMessage('fullName'))}>
                    <FieldLabel htmlFor="fullName">
                      Full Name <span className="text-destructive" aria-hidden="true">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="John Doe"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(getErrorMessage('fullName'))}
                        aria-describedby={getErrorMessage('fullName') ? 'fullName-error' : undefined}
                      />
                      <FieldError id="fullName-error">
                        {getErrorMessage('fullName')}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <Field data-invalid={Boolean(getErrorMessage('email'))}>
                    <FieldLabel htmlFor="email">
                      Email <span className="text-destructive" aria-hidden="true">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(getErrorMessage('email'))}
                        aria-describedby={getErrorMessage('email') ? 'email-error' : undefined}
                      />
                      <FieldError id="email-error">{getErrorMessage('email')}</FieldError>
                    </FieldContent>
                  </Field>

                  <Field data-invalid={Boolean(getErrorMessage('companyName'))}>
                    <FieldLabel htmlFor="companyName">Company Name (Optional)</FieldLabel>
                    <FieldContent>
                      <Input
                        id="companyName"
                        name="companyName"
                        type="text"
                        placeholder="Acme Inc."
                        aria-invalid={Boolean(getErrorMessage('companyName'))}
                        aria-describedby={
                          getErrorMessage('companyName') ? 'companyName-error' : undefined
                        }
                      />
                      <FieldError id="companyName-error">
                        {getErrorMessage('companyName')}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <Field data-invalid={Boolean(getErrorMessage('phone'))}>
                    <FieldLabel htmlFor="phone">Phone (Optional)</FieldLabel>
                    <FieldContent>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        aria-invalid={Boolean(getErrorMessage('phone'))}
                        aria-describedby={getErrorMessage('phone') ? 'phone-error' : undefined}
                      />
                      <FieldError id="phone-error">{getErrorMessage('phone')}</FieldError>
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <Field data-invalid={Boolean(getErrorMessage('serviceInterest'))}>
                  <FieldLabel htmlFor="serviceInterest">
                    Service Interest <span className="text-destructive" aria-hidden="true">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      name="serviceInterest"
                      defaultValue={defaultServiceInterest}
                      disabled={isPending}
                      required
                    >
                      <SelectTrigger
                        id="serviceInterest"
                        aria-required="true"
                        aria-invalid={Boolean(getErrorMessage('serviceInterest'))}
                        aria-describedby={
                          getErrorMessage('serviceInterest') ? 'serviceInterest-error' : undefined
                        }
                        className={Boolean(getErrorMessage('serviceInterest')) ? 'border-destructive' : undefined}
                      >
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactFormData.serviceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError id="serviceInterest-error">
                      {getErrorMessage('serviceInterest')}
                    </FieldError>
                  </FieldContent>
                </Field>

                <Field data-invalid={Boolean(getErrorMessage('message'))}>
                  <FieldLabel htmlFor="message">
                    Message <span className="text-destructive" aria-hidden="true">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your project..."
                      rows={6}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(getErrorMessage('message'))}
                      aria-describedby={getErrorMessage('message') ? 'message-error' : undefined}
                    />
                    <FieldError id="message-error">{getErrorMessage('message')}</FieldError>
                  </FieldContent>
                </Field>

                <Field orientation="responsive">
                  <Checkbox id="marketingOptIn" name="marketingOptIn" value="true" />
                  <FieldContent>
                    <FieldLabel htmlFor="marketingOptIn">
                      {contactFormData.marketingOptInLabel}
                    </FieldLabel>
                    <FieldDescription>{contactFormData.privacyNote}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldSet>

              <ContactFormSubmitButton label={contactFormData.submitLabel} />
            </form>
          </Item>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
