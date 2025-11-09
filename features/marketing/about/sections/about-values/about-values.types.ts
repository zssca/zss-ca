import type { LucideIcon } from 'lucide-react'

export interface AboutValueItem {
  title: string
  description: string
  icon?: LucideIcon
  iconLabel?: string
  helper?: string
}

export interface AboutValuesData {
  title: string
  values: AboutValueItem[]
}
