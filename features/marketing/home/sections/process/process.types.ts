export interface ProcessStep {
  id: number
  label: string
  title: string
  description: string
  duration: string
  outcome: string
}

export interface ProcessData {
  heading: string
  subheading: string
  steps: ProcessStep[]
}
