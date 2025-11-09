export interface ContactStep {
  id: number
  label: string
  title: string
  description: string
  helper?: string
}

export interface ContactStepsData {
  heading: string
  steps: ContactStep[]
}
