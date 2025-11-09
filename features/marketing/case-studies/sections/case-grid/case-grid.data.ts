import { Gavel, HeartPulse, Home, Laptop } from 'lucide-react'
import type { CaseGridData } from './case-grid.types'

export const caseGridData: CaseGridData = {
  heading: 'Recent subscription wins',
  cases: [
    {
      id: 'prairie-clinic',
      name: 'Prairie Wellness Clinic',
      industry: 'Health & wellness',
      summary: 'Rebuilt the patient acquisition funnel with bilingual appointment flows, referral tracking, and WCAG 2.1 AA compliance.',
      services: ['UX Strategy', 'Web Development', 'Analytics'],
      icon: HeartPulse,
      iconLabel: 'Healthcare icon',
    },
    {
      id: 'north-peak',
      name: 'North Peak Roofing',
      industry: 'Home services',
      summary: 'Localized SEO hubs and seasonal landing campaigns doubled quote requests in 60 days.',
      services: ['Marketing Site', 'SEO Foundations', 'Ongoing Support'],
      icon: Home,
      iconLabel: 'Home services icon',
    },
    {
      id: 'lumen-software',
      name: 'Lumen Software',
      industry: 'Tech / SaaS',
      summary: 'Launched coordinated marketing site, docs hub, and changelog that ship in sync with weekly releases.',
      services: ['Design System', 'CMS Integration', 'Product Marketing'],
      icon: Laptop,
      iconLabel: 'Technology icon',
    },
    {
      id: 'harbour-legal',
      name: 'Harbour Legal',
      industry: 'Professional services',
      summary: 'Positioned a boutique legal firm with thought-leadership hubs and automated lead routing.',
      services: ['Brand Refresh', 'Web Development', 'Content Enablement'],
      icon: Gavel,
      iconLabel: 'Legal icon',
    },
  ],
}
