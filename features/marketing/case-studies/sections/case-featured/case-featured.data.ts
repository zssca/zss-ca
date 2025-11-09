import type { CaseFeaturedData } from './case-featured.types'

export const caseFeaturedData: CaseFeaturedData = {
  client: 'Maple & Main Accounting',
  industry: 'Professional Services',
  summary:
    'Migrated from a legacy WordPress site to a performant, component-driven marketing experience with conversion-focused landing pages and gated resources.',
  metrics: [
    { label: 'Lead conversion', value: '+58%' },
    { label: 'Page load speed', value: '-1.8s' },
    { label: 'New resources launched', value: '12' },
  ],
  services: ['Journey strategy', 'Next.js rebuild', 'Lead gen experiments'],
  testimonial: {
    quote:
      'The subscription model means our marketing roadmap keeps moving without scoping exercises or change orders. The team feels like an extension of our own.',
    author: 'Amelia Chen',
    role: 'Director of Marketing, Maple & Main Accounting',
  },
}
