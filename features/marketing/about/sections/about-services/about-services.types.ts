export interface AboutServiceItem {
  id: string
  title: string
  description: string
  helper?: string
}

export interface AboutServicesData {
  title: string
  items: AboutServiceItem[]
}
