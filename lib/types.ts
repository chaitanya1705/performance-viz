export interface DataPoint {
  timestamp: number
  value: number
  category: string
  metadata?: Record<string, any>
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'heatmap'
  dataKey: string
  color: string
  visible: boolean
}

export interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  renderTime: number
  dataProcessingTime: number
  frameCount: number
  lastFrameTime: number
}

export interface TimeRange {
  start: number
  end: number
}

export interface AggregationPeriod {
  type: '1min' | '5min' | '1hour' | 'raw'
  label: string
}

export interface ChartBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface Viewport {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

