export interface PricingPreviewGuarantee {
  id: string
  title: string
  description: string
  helper: string
}

export interface PricingPreviewData {
  heading: string
  subheading: string
  pill: string
  guarantees: PricingPreviewGuarantee[]
  cta: {
    label: string
    href: string
    secondaryLabel: string
    secondaryHref: string
  }
}
