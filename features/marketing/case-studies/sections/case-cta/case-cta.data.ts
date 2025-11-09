import { ROUTES } from '@/lib/constants/routes'
import type { CaseCtaData } from './case-cta.types'

export const caseCtaData: CaseCtaData = {
  heading: 'Imagine what we can build together',
  description: 'Book a strategy session to roadmap your launch or browse our subscription plans to get started right away.',
  supporting: 'Our strategists can align deliverables to your next launch in a single call.',
  bullets: [
    'Dedicated pod of strategists, designers, and engineers',
    'Weekly reporting with measurable KPIs',
    'Security-first hosting with Canadian residency',
  ],
  ariaLabel: 'Case studies actions',
  primary: {
    label: 'Start a project',
    href: ROUTES.CONTACT,
  },
  secondary: {
    label: 'Compare subscriptions',
    href: ROUTES.PRICING,
  },
}
