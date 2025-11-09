import { LifeBuoy, Flag, PiggyBank, ShieldCheck } from 'lucide-react'
import type { AboutValuesData } from './about-values.types'

export const aboutValuesData: AboutValuesData = {
  title: 'Values that guide every engagement',
  values: [
    {
      title: 'Transparent partnership',
      description: 'Flat-rate subscriptions, shared roadmaps, and weekly demos keep everyone aligned.',
      helper: 'Average variance between estimate & delivery: <3%',
      icon: PiggyBank,
      iconLabel: 'Predictable pricing icon',
    },
    {
      title: 'Canadian-first mindset',
      description: 'Accessibility, bilingual content, and data residency tailored to Canadian regulations.',
      helper: 'WCAG 2.1 AA audits run each quarter',
      icon: Flag,
      iconLabel: 'Canadian focus icon',
    },
    {
      title: 'Craft backed by rigor',
      description: 'Design systems, QA scripts, and observability baked into every deploy.',
      helper: 'Lighthouse scores average 95+',
      icon: ShieldCheck,
      iconLabel: 'Quality shield icon',
    },
    {
      title: 'Care without ticket walls',
      description: 'Direct collaboration via Slack with the people actually shipping your work.',
      helper: 'Median first response: 1h 42m',
      icon: LifeBuoy,
      iconLabel: 'Support icon',
    },
  ],
}
