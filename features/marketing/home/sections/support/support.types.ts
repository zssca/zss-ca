import type { LucideIcon } from 'lucide-react'

export interface SupportHighlight {
  id: string
  eyebrow?: string
  title: string
  description: string
  icon?: LucideIcon
  iconLabel?: string
  helper?: string
}

export interface SupportData {
  heading: string
  subheading: string
  highlights: SupportHighlight[]
  cta: {
    ariaLabel?: string
    label: string
    href: string
  }
}
