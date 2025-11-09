export interface CtaData {
  heading: string
  description: string
  ariaLabel: string
  bullets: string[]
  cta: {
    primary: {
      label: string
      href: string
    }
    secondary: {
      label: string
      href: string
    }
  }
}
