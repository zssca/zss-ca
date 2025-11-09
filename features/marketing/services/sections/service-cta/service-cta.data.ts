import { ROUTES } from '@/lib/constants/routes'
import type { ServiceCtaData } from './service-cta.types'

export const serviceCtaData: ServiceCtaData = {
  heading: 'Ready to plan your next launch?',
  description: 'Review pricing or jump on a 15-minute discovery call to see how the subscription fits your roadmap.',
  supporting: 'We will map scope, timelines, and next steps in your first conversation.',
  bullets: [
    'One subscription covers design, build, hosting, and optimization',
    'Canadian team responds in under two business hours',
    'No change orders or surprise invoices—ever',
  ],
  ariaLabel: 'Service plan actions',
  primary: {
    label: 'Compare pricing',
    href: ROUTES.PRICING,
  },
  secondary: {
    label: 'Talk to delivery',
    href: ROUTES.CONTACT,
  },
}
