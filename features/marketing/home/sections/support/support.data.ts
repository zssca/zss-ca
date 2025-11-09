import { Headphones, RefreshCcw, Server, Target } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { SupportData } from './support.types'

export const supportData: SupportData = {
  heading: 'Support that feels like an in-house team',
  subheading:
    'Every subscription includes proactive monitoring, analytics reviews, and a dedicated Slack channel with guaranteed response times.',
  highlights: [
    {
      id: 'fast-iteration',
      eyebrow: 'Fast iteration',
      title: 'Unlimited update requests',
      description: 'Queue copy updates, new landing pages, or SEO tweaks anytime—your producer assigns and tracks everything for you.',
      helper: 'Most requests ship in under 3 business days.',
      icon: RefreshCcw,
      iconLabel: 'Iteration icon',
    },
    {
      id: 'reliable-infrastructure',
      eyebrow: 'Reliable infrastructure',
      title: 'Managed hosting & monitoring',
      description: 'Edge hosting with Canadian residency, automated backups, and 24/7 alerts keep marketing launches stable.',
      helper: '99.98% uptime over the past 12 months.',
      icon: Server,
      iconLabel: 'Hosting icon',
    },
    {
      id: 'strategic-partner',
      eyebrow: 'Strategic partner',
      title: 'Quarterly roadmap reviews',
      description: 'We analyze funnel metrics, prioritize new tests, and refresh creative so your site keeps outperforming goals.',
      helper: 'Includes KPI report and prioritized backlog.',
      icon: Target,
      iconLabel: 'Strategy icon',
    },
    {
      id: 'direct-line',
      eyebrow: 'Direct line',
      title: 'Dedicated Slack channel',
      description: 'Message your pod of designers, engineers, and strategists directly—no ticketing portals or delays.',
      helper: 'Median response time: 1h 42m during business hours.',
      icon: Headphones,
      iconLabel: 'Support headset icon',
    },
  ],
  cta: {
    ariaLabel: 'View subscription plans',
    label: 'See plans & SLAs',
    href: ROUTES.PRICING,
  },
}
