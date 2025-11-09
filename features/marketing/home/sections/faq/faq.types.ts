export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface FaqData {
  heading: string
  subheading: string
  items: FaqItem[]
  cta: {
    title: string
    description: string
    primary: {
      label: string
      href: string
    }
  }
}
