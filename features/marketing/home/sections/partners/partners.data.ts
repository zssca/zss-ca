import { ROUTES } from '@/lib/constants/routes'
import type { PartnersData } from './partners.types'

export const partnersData: PartnersData = {
  eyebrow: 'Trusted delivery',
  heading: 'Canadian organizations who rely on Zenith',
  subheading:
    'We plug into in-house marketing and communications teams to keep regulated websites fast, accurate, and conversion-ready.',
  companies: [
    {
      id: 'prairie-health',
      name: 'Prairie Health Collective',
      industry: 'Healthcare network',
      detail: '14 multidisciplinary clinics across Alberta and Saskatchewan',
      impact: '+42% consult requests in 90 days',
    },
    {
      id: 'harbour-legal',
      name: 'Harbour Legal',
      industry: 'Professional services',
      detail: 'Boutique litigation firm serving national associations',
      impact: '3x organic lead volume',
    },
    {
      id: 'north-peak',
      name: 'North Peak Roofing',
      industry: 'Home services',
      detail: 'Seasonal campaign program across 28 municipalities',
      impact: '58% faster quote turnaround',
    },
    {
      id: 'compass-credit',
      name: 'Compass Credit Union',
      industry: 'Financial services',
      detail: 'Member-first banking across Western Canada',
      impact: '4.8 average visitor satisfaction',
    },
    {
      id: 'lumen-software',
      name: 'Lumen Software',
      industry: 'SaaS / Technology',
      detail: 'Product marketing + documentation pods running in parallel',
      impact: 'Weekly release microsites',
    },
    {
      id: 'civic-impact',
      name: 'Civic Impact Alliance',
      industry: 'Non-profit',
      detail: 'Campaign landing systems for 60+ chapters',
      impact: '+31% donor conversions',
    },
  ],
  highlights: [
    {
      id: 'retention',
      value: '94%',
      label: 'Client retention',
      helper: 'Multi-year retainers renewed in 2024',
    },
    {
      id: 'deployments',
      value: '120+',
      label: 'Launches per year',
      helper: 'New pages, microsites, and experiments shipped',
    },
    {
      id: 'response',
      value: '<24h',
      label: 'Average response time',
      helper: 'Dedicated success pod across time zones',
    },
  ],
  cta: {
    label: 'Review partnership model',
    href: ROUTES.SERVICES,
    ariaLabel: 'Learn about the Zenith partnership model on the services page',
    description: 'See how we staff pods, manage weekly reporting, and keep marketing launches moving without adding headcount.',
  },
}
