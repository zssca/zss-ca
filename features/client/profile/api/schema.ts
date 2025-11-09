import { z } from 'zod'
import { optionalUrlSchema } from '@/lib/utils/url'

export const updateProfileSchema = z.object({
  contact_name: z.string().min(1, 'Name is required').max(255),
  contact_email: z.string().email('Invalid email address').max(255),
  contact_phone: z.string().max(50).default(''),
  company_name: z.string().max(255).default(''),
  company_website: optionalUrlSchema,
  address_line1: z.string().max(255).default(''),
  address_line2: z.string().max(255).default(''),
  city: z.string().max(100).default(''),
  region: z.string().max(100).default(''),
  postal_code: z.string().max(20).default(''),
  country: z.string().max(100).default(''),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const appearanceOptions = ['system', 'light', 'dark'] as const
export const languageOptions = ['en', 'fr'] as const
export const timezoneOptions = [
  'UTC',
  'America/Toronto',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Tokyo',
] as const

export const userPreferencesRowSchema = z.object({
  profile_id: z.string().uuid(),
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  marketing_opt_in: z.boolean(),
  appearance: z.enum(appearanceOptions),
  language: z.string().min(2).max(10),
  timezone: z.string().min(1).max(100),
  created_at: z.string(),
  updated_at: z.string(),
})

export type UserPreferences = z.infer<typeof userPreferencesRowSchema>

export const defaultUserPreferences: Omit<UserPreferences, 'profile_id' | 'created_at' | 'updated_at'> = {
  email_notifications: true,
  sms_notifications: false,
  marketing_opt_in: false,
  appearance: 'system',
  language: 'en',
  timezone: 'UTC',
}

export const updatePreferencesSchema = z.object({
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  marketing_opt_in: z.boolean().default(false),
  appearance: z.enum(appearanceOptions),
  language: z.enum(languageOptions),
  timezone: z.enum(timezoneOptions),
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
