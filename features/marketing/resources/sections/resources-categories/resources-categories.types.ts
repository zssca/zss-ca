import type { LucideIcon } from 'lucide-react'

export interface ResourceCategory {
  id: string
  eyebrow?: string
  name: string
  description: string
  icon?: LucideIcon
  iconLabel?: string
  href?: string
  linkLabel?: string
}

export interface ResourcesCategoriesData {
  heading: string
  categories: ResourceCategory[]
}
