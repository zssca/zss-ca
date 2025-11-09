'use server'

import { updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateProfileSchema } from '../schema'

type ActionResult =
  | { error: string; fieldErrors?: Record<string, string[]> }
  | { error: null }

export async function updateProfileAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  // 1. Validate input with Zod
  const result = updateProfileSchema.safeParse({
    contact_name: formData.get('contact_name'),
    contact_email: formData.get('contact_email'),
    contact_phone: formData.get('contact_phone'),
    company_name: formData.get('company_name'),
    company_website: formData.get('company_website'),
    address_line1: formData.get('address_line1'),
    address_line2: formData.get('address_line2'),
    city: formData.get('city'),
    region: formData.get('region'),
    postal_code: formData.get('postal_code'),
    country: formData.get('country'),
  })

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  // 2. Create authenticated Supabase client
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 3. Perform database mutation
  const { error } = await supabase
    .from('profile')
    .update(result.data)
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to update profile' }
  }

  // 4. Invalidate cache with updateTag for immediate consistency
  updateTag(`profile:${user.id}`)
  updateTag('profiles')

  return { error: null }
}
