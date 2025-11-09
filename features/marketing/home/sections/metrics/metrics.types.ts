export interface Metric {
  label: string
  value: string
  helper: string
}

export interface MetricsData {
  heading: string
  subheading: string
  metrics: Metric[]
}
