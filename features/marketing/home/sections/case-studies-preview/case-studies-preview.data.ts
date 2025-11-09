import { ROUTES } from '@/lib/constants/routes'
import type { CaseStudiesPreviewData } from './case-studies-preview.types'

export const caseStudiesPreviewData: CaseStudiesPreviewData = {
  heading: 'Playbooks that prove the subscription works',
  subheading:
    'Each engagement launches with a KPI target, weekly reporting, and transparent backlog so marketing leaders see impact in real time.',
  cases: [
    {
      id: 'evergreen-health',
      client: 'Evergreen Health Network',
      industry: 'Healthcare',
      summary:
        'Multilingual clinic pages, automated provider bios, and referral tracking delivered during the first 30-day sprint.',
      metric: {
        value: '+37%',
        label: 'booked consultations in 90 days',
      },
      services: ['Journey Strategy', 'CMS Build', 'Analytics'],
      href: `${ROUTES.CASE_STUDIES}#evergreen-health`,
    },
    {
      id: 'lumen-software',
      client: 'Lumen Software',
      industry: 'SaaS',
      summary:
        'Embedded with the product marketing team to ship weekly launch microsites, release notes, and changelog content.',
      metric: {
        value: '11 days',
        label: 'idea-to-production average',
      },
      services: ['Design System', 'Web Development', 'Docs Enablement'],
      href: `${ROUTES.CASE_STUDIES}#lumen-software`,
    },
    {
      id: 'civic-impact',
      client: 'Civic Impact Alliance',
      industry: 'Non-profit',
      summary:
        'Rolled out a campaign framework and donor analytics dashboard for 60+ regional chapters with localized messaging.',
      metric: {
        value: '+31%',
        label: 'donation conversion year over year',
      },
      services: ['Information Architecture', 'Landing Pages', 'Insights'],
      href: `${ROUTES.CASE_STUDIES}#civic-impact`,
    },
  ],
  cta: {
    label: 'Explore full customer stories',
    href: ROUTES.CASE_STUDIES,
    ariaLabel: 'Explore the complete collection of client case studies',
  },
}
