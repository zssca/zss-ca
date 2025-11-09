import type { LucideIcon } from 'lucide-react'

export interface Industry {
  id: string
  name: string
  description: string
  icon: LucideIcon
  iconLabel: string
  stat: string
  statHelper: string
}

export interface IndustriesData {
  heading: string
  subheading: string
  industries: Industry[]
}
