export interface PartnerCompany {
  id: string
  name: string
  industry: string
  detail: string
  impact: string
}

export interface PartnerHighlight {
  id: string
  value: string
  label: string
  helper: string
}

export interface PartnersData {
  eyebrow: string
  heading: string
  subheading: string
  companies: PartnerCompany[]
  highlights: PartnerHighlight[]
  cta: {
    label: string
    href: string
    ariaLabel: string
    description?: string
  }
}
