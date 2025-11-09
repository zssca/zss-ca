import { ROUTES } from '@/lib/constants/routes'
import type { CtaData } from './cta.types'

export const ctaData: CtaData = {
  heading: 'Ready to launch your next conversion sprint?',
  description:
    'Book a quick strategy session and walk away with a tailored roadmap, pricing breakdown, and launch timeline built for your growth targets.',
  ariaLabel: 'Home page call to action',
  bullets: [
    'White-glove onboarding with Canadian strategists',
    'Unlimited design, copy, and optimization requests',
    'Security-forward hosting with Canadian residency',
  ],
  cta: {
    primary: {
      label: 'Start my launch plan',
      href: ROUTES.PRICING,
    },
    secondary: {
      label: 'Schedule a strategy call',
      href: ROUTES.CONTACT,
    },
  },
}
