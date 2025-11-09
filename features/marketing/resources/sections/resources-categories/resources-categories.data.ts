import { BarChart3, Rocket, Users } from 'lucide-react'
import type { ResourcesCategoriesData } from './resources-categories.types'

export const resourcesCategoriesData: ResourcesCategoriesData = {
  heading: 'Browse by outcome',
  categories: [
    {
      id: 'launch',
      eyebrow: 'Kickoff',
      name: 'Launch faster',
      description: 'Kickoff checklists, stakeholder templates, and launch communication kits.',
      icon: Rocket,
      iconLabel: 'Launch icon',
      href: '#launch',
      linkLabel: 'Open launch tools',
    },
    {
      id: 'convert',
      eyebrow: 'Conversion',
      name: 'Boost conversions',
      description: 'Landing page frameworks, copy prompts, and analytics dashboards.',
      icon: BarChart3,
      iconLabel: 'Conversion icon',
      href: '#conversion',
      linkLabel: 'View conversion kits',
    },
    {
      id: 'retain',
      eyebrow: 'Retention',
      name: 'Retain customers',
      description: 'Email nurture maps, onboarding guides, and support playbooks.',
      icon: Users,
      iconLabel: 'Retention icon',
      href: '#retention',
      linkLabel: 'See retention guides',
    },
  ],
}
