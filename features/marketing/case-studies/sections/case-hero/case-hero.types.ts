export interface CaseHeroHighlight {
  value: string
  label: string
  helper: string
}

export interface CaseHeroData {
  heading: string
  description: string
  highlights: CaseHeroHighlight[]
}
