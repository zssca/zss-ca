import type { MetricsData } from './metrics.types'

export const metricsData: MetricsData = {
  heading: 'Results that compound over every engagement',
  subheading: 'Measured across active Canadian SMB subscriptions from 2022–2024.',
  metrics: [
    {
      label: 'Average launch sprint',
      value: '14 days',
      helper: 'From strategy kickoff to production-ready hero, features, and CTA pages.',
    },
    {
      label: 'Quarterly conversion lift',
      value: '+38%',
      helper: 'Median increase in qualified demo requests after three optimization cycles.',
    },
    {
      label: 'Responses under 2 hours',
      value: '94%',
      helper: 'Support replies during business hours through your dedicated Slack channel.',
    },
    {
      label: 'Platform uptime',
      value: '99.98%',
      helper: 'Redundant Canadian hosting with global CDN caching and proactive monitoring.',
    },
  ],
}
