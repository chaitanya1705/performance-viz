import { DataPoint } from './types'

export function generateTimeSeriesData(
  count: number,
  startTime: number = Date.now() - 3600000,
  interval: number = 1000
): DataPoint[] {
  const data: DataPoint[] = []
  const categories = ['temperature', 'pressure', 'humidity', 'voltage']
  
  for (let i = 0; i < count; i++) {
    const timestamp = startTime + i * interval
    const category = categories[i % categories.length]
    
    let value: number
    switch (category) {
      case 'temperature':
        value = 20 + Math.sin(i / 100) * 5 + Math.random() * 2
        break
      case 'pressure':
        value = 1013 + Math.cos(i / 150) * 10 + Math.random() * 3
        break
      case 'humidity':
        value = 50 + Math.sin(i / 200) * 20 + Math.random() * 5
        break
      case 'voltage':
        value = 12 + Math.sin(i / 80) * 2 + Math.random() * 0.5
        break
      default:
        value = Math.random() * 100
    }
    
    data.push({
      timestamp,
      value: Math.round(value * 100) / 100,
      category,
      metadata: {
        sensorId: `sensor-${(i % 10) + 1}`,
        quality: Math.random() > 0.1 ? 'good' : 'warning',
      },
    })
  }
  
  return data
}

export function aggregateData(
  data: DataPoint[],
  period: '1min' | '5min' | '1hour'
): DataPoint[] {
  const periodMs: Record<string, number> = {
    '1min': 60000,
    '5min': 300000,
    '1hour': 3600000,
  }
  
  const interval = periodMs[period]
  const aggregated: Map<number, DataPoint[]> = new Map()
  
  data.forEach((point) => {
    const bucket = Math.floor(point.timestamp / interval) * interval
    if (!aggregated.has(bucket)) {
      aggregated.set(bucket, [])
    }
    aggregated.get(bucket)!.push(point)
  })
  
  const result: DataPoint[] = []
  aggregated.forEach((points, bucket) => {
    const avgValue =
      points.reduce((sum, p) => sum + p.value, 0) / points.length
    const categories = [...new Set(points.map((p) => p.category))]
    
    categories.forEach((category) => {
      const categoryPoints = points.filter((p) => p.category === category)
      const categoryAvg =
        categoryPoints.reduce((sum, p) => sum + p.value, 0) /
        categoryPoints.length
      
      result.push({
        timestamp: bucket,
        value: Math.round(categoryAvg * 100) / 100,
        category,
        metadata: {
          count: categoryPoints.length,
          aggregated: true,
        },
      })
    })
  })
  
  return result.sort((a, b) => a.timestamp - b.timestamp)
}

export function filterDataByTimeRange(
  data: DataPoint[],
  start: number,
  end: number
): DataPoint[] {
  return data.filter(
    (point) => point.timestamp >= start && point.timestamp <= end
  )
}

export function filterDataByCategory(
  data: DataPoint[],
  categories: string[]
): DataPoint[] {
  if (categories.length === 0) return data
  return data.filter((point) => categories.includes(point.category))
}

