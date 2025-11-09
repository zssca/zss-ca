import type { FeaturesData } from './features.types'

export const featuresData: FeaturesData = {
  heading: 'A full marketing web team in one subscription',
  subheading:
    'Every plan includes strategy, UX, copy, development, hosting, and optimization—so nothing slows down your next launch.',
  features: [
    {
      id: 'strategy-first',
      iconLabel: 'Strategy icon',
      title: 'Strategy-first design',
      description:
        'We audit your funnel, map user journeys, and design page systems that guide visitors to the next best action.',
      icon: '🧠',
    },
    {
      id: 'responsive',
      iconLabel: 'Responsive icon',
      title: 'Mobile-perfect experiences',
      description:
        'Edge-cached, responsive layouts deliver instant load times and frictionless browsing on any device.',
      icon: '📱',
    },
    {
      id: 'seo',
      iconLabel: 'SEO icon',
      title: 'Built-in SEO authority',
      description:
        'Technical SEO, schema, and content briefs baked into every launch so you capture intent-ready traffic.',
      icon: '🔍',
    },
    {
      id: 'hosting',
      iconLabel: 'Hosting icon',
      title: 'Proactive hosting & security',
      description:
        'Canadian data residency, daily backups, and active monitoring keep every launch compliant and resilient.',
      icon: '🛡️',
    },
    {
      id: 'support',
      iconLabel: 'Support icon',
      title: 'Dedicated growth team',
      description:
        'Message us for rollout plans, CRO ideas, or copy tweaks—your requests land directly with the builders.',
      icon: '🤝',
    },
    {
      id: 'maintenance',
      iconLabel: 'Maintenance icon',
      title: 'Continuous optimization',
      description:
        'Heatmap reviews, A/B testing, and quarterly roadmap sessions keep conversion rates climbing month after month.',
      icon: '📈',
    },
  ],
}
