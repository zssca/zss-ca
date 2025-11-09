import type { ProcessData } from './process.types'

export const processData: ProcessData = {
  heading: 'A proven launch-to-optimization workflow',
  subheading: 'Every subscription follows the same four-step playbook so you know exactly what ships and when.',
  steps: [
    {
      id: 1,
      label: 'Week 1',
      title: 'Strategy blueprint',
      description: 'Audit your current site, map personas, and align KPIs. We capture content gaps and prioritize the first sprint.',
      duration: '2 working sessions',
      outcome: 'Launch kit + prioritized backlog',
    },
    {
      id: 2,
      label: 'Week 2',
      title: 'Design & build sprint',
      description: 'Ship responsive hero, feature, and CTA sections with approved copy, illustrations, and analytics events.',
      duration: '10 business days',
      outcome: 'Production-ready page bundle',
    },
    {
      id: 3,
      label: 'Week 3',
      title: 'Launch & QA',
      description: 'Deploy to global edge hosting, run accessibility + performance sweeps, and hand off dashboards.',
      duration: '3-day QA window',
      outcome: 'Live site + measurement stack',
    },
    {
      id: 4,
      label: 'Ongoing',
      title: 'Optimize & scale',
      description: 'Queue unlimited requests, review experiments in your client portal, and plan quarterly roadmap refreshers.',
      duration: 'Monthly iteration cycle',
      outcome: 'Compounding CRO & SEO gains',
    },
  ],
}
