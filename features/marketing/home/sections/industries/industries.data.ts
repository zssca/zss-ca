import { Briefcase, Hammer, Rocket, Stethoscope } from 'lucide-react'
import type { IndustriesData } from './industries.types'

export const industriesData: IndustriesData = {
  heading: 'Built for service-driven teams',
  subheading:
    'We partner with Canadian organizations who rely on compelling storytelling and consistent lead flow.',
  industries: [
    {
      id: 'professional-services',
      name: 'Professional services',
      description: 'Consultancies, accountants, and legal teams that need compliant, conversion-optimized landing pages.',
      icon: Briefcase,
      iconLabel: 'Professional services icon',
      stat: '+48% MQL lift',
      statHelper: 'after CRO-focused redesigns',
    },
    {
      id: 'home-services',
      name: 'Home & trade services',
      description: 'Contractors and franchises using localized SEO hubs, quote calculators, and reputation workflows.',
      icon: Hammer,
      iconLabel: 'Home services icon',
      stat: '3.2x ROI',
      statHelper: 'from call-tracking attribution',
    },
    {
      id: 'health-wellness',
      name: 'Health & wellness',
      description: 'Clinics and wellness networks with secure intake forms, bilingual content, and referral routing.',
      icon: Stethoscope,
      iconLabel: 'Health and wellness icon',
      stat: '-35% no-shows',
      statHelper: 'with automated reminders',
    },
    {
      id: 'tech-startups',
      name: 'Tech & SaaS',
      description: 'Product marketers that need marketing, documentation, and changelog sites without hiring in-house.',
      icon: Rocket,
      iconLabel: 'Tech icon',
      stat: '11-day sprints',
      statHelper: 'from brief to release',
    },
  ],
}
