export interface CaseStudyPreview {
  id: string
  client: string
  industry: string
  summary: string
  metric: {
    value: string
    label: string
  }
  services: string[]
  href: string
}

export interface CaseStudiesPreviewData {
  heading: string
  subheading: string
  cases: CaseStudyPreview[]
  cta: {
    label: string
    href: string
    ariaLabel: string
  }
}
