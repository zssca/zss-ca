import { ROUTES } from '@/lib/constants/routes'
import type { AboutHeroData } from './about-hero.types'

export const aboutHeroData: AboutHeroData = {
  heading: 'A dedicated marketing web team on subscription',
  subheading:
    'We assemble strategists, designers, and engineers around Canadian SMB teams that need enterprise-level websites without hiring in-house.',
  tagline: 'Canadian owned · Security-first · Subscription delivery',
  cta: {
    primary: {
      label: 'Meet the leadership team',
      href: ROUTES.ABOUT,
    },
    secondary: {
      label: 'Book a strategy call',
      href: ROUTES.CONTACT,
    },
  },
  highlights: [
    {
      value: '120+',
      label: 'launches per year',
      helper: 'Sites, microsites, and experiments shipped',
    },
    {
      value: '94%',
      label: 'client retention',
      helper: 'Multi-year partnerships renewed in 2024',
    },
    {
      value: '14 days',
      label: 'average time to launch',
      helper: 'From kickoff to production-ready pages',
    },
  ],
}
