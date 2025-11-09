import { ROUTES } from '@/lib/constants/routes'
import type { ServiceHeroData } from './service-hero.types'

export const serviceHeroData: ServiceHeroData = {
  heading: 'Ship every marketing idea with a dedicated web team',
  description:
    'Strategy, UX, copy, design, development, hosting, and optimization under one predictable subscription built for Canadian organizations.',
  bullets: [
    {
      title: 'Launch in 14 days',
      description: 'Kickoff to production-ready hero, feature, and CTA pages in the first sprint.',
    },
    {
      title: 'Unlimited requests',
      description: 'Add pages, tests, and iterations anytime—your backlog stays moving without change orders.',
    },
    {
      title: 'Security-first hosting',
      description: 'Canadian data residency, monitoring, and backups baked in.',
    },
  ],
  cta: {
    primary: { label: 'Compare plans', href: ROUTES.PRICING },
    secondary: { label: 'Talk to delivery', href: ROUTES.CONTACT },
  },
}
