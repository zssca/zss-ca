export interface ServiceHeroBullet {
  title: string
  description: string
}

export interface ServiceHeroData {
  heading: string
  description: string
  bullets: ServiceHeroBullet[]
  cta: {
    primary: { label: string; href: string }
    secondary: { label: string; href: string }
  }
}
