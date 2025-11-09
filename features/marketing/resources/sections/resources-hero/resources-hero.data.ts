import { ROUTES } from '@/lib/constants/routes'
import type { ResourcesHeroData } from './resources-hero.types'

export const resourcesHeroData: ResourcesHeroData = {
  heading: 'Guides, templates, and playbooks',
  description:
    'Stay ahead with launch checklists, conversion benchmarks, and growth playbooks crafted for Canadian SMB teams.',
  cta: {
    label: 'Subscribe for updates',
    href: ROUTES.CONTACT,
  },
}
