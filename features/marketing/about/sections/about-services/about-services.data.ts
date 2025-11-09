import type { AboutServicesData } from './about-services.types'

export const aboutServicesData: AboutServicesData = {
  title: 'How we plug into your team',
  items: [
    {
      id: 'subscription',
      title: 'Managed website subscription',
      description:
        'Strategy, copy, design, development, hosting, and analytics bundled into one predictable monthly invoice.',
      helper: 'Best for teams that want to move fast without hiring in-house.',
    },
    {
      id: 'support',
      title: 'Always-on optimization pod',
      description:
        'Dedicated PM, designer, and engineer who own the backlog, QA deploys, and report on KPIs every month.',
      helper: 'Includes Slack channel + shared dashboards.',
    },
    {
      id: 'advisory',
      title: 'Leadership advisory',
      description:
        'Quarterly roadmapping, experimentation planning, and executive-ready reporting to align revenue teams.',
      helper: 'Optional add-on for growth-stage organizations.',
    },
  ],
}
