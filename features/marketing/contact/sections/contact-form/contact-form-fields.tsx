'use client'

import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormFieldLayout } from '@/features/shared/components/form-field-layout'
import type { UseFormReturn } from 'react-hook-form'
import type { ContactFormInput } from '../../api'
import { contactFormData } from './contact-form.data'

type ContactFormFieldsProps = {
  form: UseFormReturn<ContactFormInput>
}

export function ContactFormFields({ form }: ContactFormFieldsProps) {
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormFieldLayout label="Full Name">
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
              </FormFieldLayout>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormFieldLayout label="Email">
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
              </FormFieldLayout>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormFieldLayout label="Company Name (Optional)">
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
              </FormFieldLayout>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormFieldLayout label="Phone (Optional)">
                <FormControl>
                  <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
              </FormFieldLayout>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="serviceInterest"
        render={({ field }) => (
          <FormItem>
            <FormFieldLayout label="Service Interest">
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contactFormData.serviceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldLayout>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormFieldLayout label="Message">
              <FormControl>
                <Textarea placeholder="Tell us about your project..." rows={6} {...field} />
              </FormControl>
            </FormFieldLayout>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
