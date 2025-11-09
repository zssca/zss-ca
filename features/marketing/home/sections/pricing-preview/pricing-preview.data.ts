import { ROUTES } from '@/lib/constants/routes'
import type { PricingPreviewData } from './pricing-preview.types'

export const pricingPreviewData: PricingPreviewData = {
  heading: 'Predictable subscriptions for every roadmap',
  subheading:
    'Transparent pricing, no surprise invoices, and SLAs that scale from solo founders to national teams.',
  pill: 'All plans include hosting, analytics, and unlimited requests',
  guarantees: [
    {
      id: 'launch',
      title: 'Launch sprint included',
      description: 'Kickoff, design, build, QA, and deployment are covered in your first month—no setup fees.',
      helper: 'Average time to launch: 14 days',
    },
    {
      id: 'support',
      title: 'Dedicated Slack pod',
      description: 'Direct access to designers, engineers, and strategists with sub-two-hour response times.',
      helper: 'Response SLA: 2h business / 6h off-hours',
    },
    {
      id: 'security',
      title: 'Security-first hosting',
      description: 'Canadian data residency, daily backups, and automated rollbacks keep launches resilient.',
      helper: 'Uptime last 12 months: 99.98%',
    },
  ],
  cta: {
    label: 'Compare full pricing',
    href: ROUTES.PRICING,
    secondaryLabel: 'Download SLA overview',
    secondaryHref: ROUTES.CONTACT,
  },
}
