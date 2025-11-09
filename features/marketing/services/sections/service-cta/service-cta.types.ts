export interface ServiceCtaData {
  heading: string
  description: string
  supporting?: string
  bullets?: string[]
  ariaLabel: string
  primary: {
    label: string
    href: string
  }
  secondary: {
    label: string
    href: string
  }
}
