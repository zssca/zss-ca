'use server'

import { headers, cookies } from 'next/headers'
import { contactFormSchema } from '../schema'
import { createClient } from '@/lib/supabase/server'
import { rateLimits, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

export async function submitContactForm(
  prevState: { message?: string; errors?: Record<string, string[]>; success?: boolean } | null,
  formData: FormData
): Promise<{
  message?: string
  errors?: Record<string, string[]>
  success?: boolean
}> {
  // Rate limit by IP address - 3 submissions per hour using Upstash Redis
  const headersList = await headers()
  const identifier = getClientIdentifier(headersList)
  const rateCheck = await checkRateLimit(rateLimits.contactForm, identifier)

  if (!rateCheck.success) {
    const minutesUntilReset = Math.ceil((rateCheck.reset - Date.now()) / 60000)
    return {
      message: `Too many submissions. Please try again in ${minutesUntilReset} minute(s).`,
    }
  }

  // Validate input with Zod
  const validatedFields = contactFormSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    companyName: formData.get('companyName') || undefined,
    phone: formData.get('phone') || undefined,
    serviceInterest: formData.get('serviceInterest'),
    message: formData.get('message'),
  })

  if (!validatedFields.success) {
    return {
      message: 'Please fix the errors below',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { fullName, email, companyName, phone, serviceInterest, message } =
    validatedFields.data

  // Get attribution data from cookies (headers already fetched above)
  const cookieStore = await cookies()
  const supabase = await createClient()

  // Save to database
  const { data: submission, error } = await supabase
    .from('contact_submission')
    .insert({
      full_name: fullName,
      email,
      company_name: companyName,
      phone,
      service_interest: serviceInterest,
      message,

      // Attribution tracking from cookies
      utm_source: cookieStore.get('utm_source')?.value,
      utm_medium: cookieStore.get('utm_medium')?.value,
      utm_campaign: cookieStore.get('utm_campaign')?.value,
      utm_content: cookieStore.get('utm_content')?.value,
      utm_term: cookieStore.get('utm_term')?.value,
      referrer_url: headersList.get('referer'),
      landing_page: cookieStore.get('landing_page')?.value,

      // Consent and IP tracking
      consent_ip_address: headersList.get('x-forwarded-for') || headersList.get('x-real-ip'),
      marketing_opt_in: formData.get('marketingOptIn') === 'true',
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to save contact submission:', error)
    return {
      message: 'Failed to submit form. Please try again or email us directly.',
    }
  }

  console.log('Contact submission saved:', submission.id)

  // Send email notifications asynchronously (don't block response)
  Promise.all([
    // Send admin notification
    import('@/lib/email/send').then((emailLib) =>
      emailLib.sendNewLeadNotification({
        fullName,
        email,
        companyName,
        phone,
        serviceInterest,
        message,
        utmSource: cookieStore.get('utm_source')?.value,
        utmMedium: cookieStore.get('utm_medium')?.value,
        utmCampaign: cookieStore.get('utm_campaign')?.value,
      })
    ),
    // Send confirmation email to lead
    import('@/lib/email/send').then((emailLib) =>
      emailLib.sendLeadConfirmation(email, fullName)
    ),
  ]).catch((error) => {
    console.error('Failed to send email notifications:', error)
    // Don't fail the submission if emails fail
  })

  // TODO: Add to newsletter if opted in

  return {
    message: 'Thank you! We will be in touch soon.',
    success: true,
  }
}
