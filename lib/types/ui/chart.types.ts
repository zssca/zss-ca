export interface ChartDataPoint {
  label: string
  value: number
  comparisonValue?: number
  timestamp?: string
  meta?: Record<string, unknown>
}

export interface ChartSeries<TPoint extends ChartDataPoint = ChartDataPoint> {
  id: string
  name: string
  color?: string
  data: TPoint[]
}

export interface ChartTooltipFormatter<TPoint extends ChartDataPoint> {
  (point: TPoint): string
}

export interface ChartThreshold {
  label: string
  value: number
  color?: string
  comparison?: 'above' | 'below'
}
