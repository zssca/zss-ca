export interface AboutHeroHighlight {
  value: string
  label: string
  helper: string
}

export interface AboutHeroData {
  heading: string
  subheading: string
  tagline: string
  cta: {
    primary: { label: string; href: string }
    secondary: { label: string; href: string }
  }
  highlights: AboutHeroHighlight[]
}
