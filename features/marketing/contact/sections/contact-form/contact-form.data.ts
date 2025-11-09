import type { ContactFormData } from './contact-form.types'

export const contactFormData: ContactFormData = {
  heading: 'Tell us about your next launch',
  description:
    'Share a few details and we will respond within one business day with pricing, timeline, and a recommended plan.',
  submitLabel: 'Send message',
  successMessage: "Thanks for reaching out! We'll review your details and reply shortly.",
  privacyNote: 'We keep your information confidential and will never share it with third parties.',
  marketingOptInLabel: 'Yes, email me launch resources and playbooks.',
  serviceOptions: [
    { value: 'website_build', label: 'Website build or redesign' },
    { value: 'ongoing_subscription', label: 'Ongoing subscription support' },
    { value: 'consultation', label: 'Strategy or consultation' },
    { value: 'other', label: 'Something else' },
  ],
}
