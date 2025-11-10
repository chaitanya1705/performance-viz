import { PerformanceMetrics } from './types'

export class PerformanceMonitor {
  private frameCount: number = 0
  private lastFrameTime: number = performance.now()
  private fps: number = 60
  private frameTimes: number[] = []
  private readonly maxFrameTimeHistory = 60

  update(): PerformanceMetrics {
    const now = performance.now()
    const deltaTime = now - this.lastFrameTime
    this.lastFrameTime = now
    this.frameCount++

    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime
      this.frameTimes.push(currentFPS)
      if (this.frameTimes.length > this.maxFrameTimeHistory) {
        this.frameTimes.shift()
      }
      this.fps =
        this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    }

    const memoryUsage =
      (performance as any).memory?.usedJSHeapSize || 0

    return {
      fps: Math.round(this.fps * 10) / 10,
      memoryUsage: Math.round(memoryUsage / 1024 / 1024 * 100) / 100,
      renderTime: Math.round(deltaTime * 100) / 100,
      dataProcessingTime: 0,
      frameCount: this.frameCount,
      lastFrameTime: now,
    }
  }

  reset(): void {
    this.frameCount = 0
    this.lastFrameTime = performance.now()
    this.frameTimes = []
    this.fps = 60
  }
}

export function measurePerformance<T>(
  fn: () => T,
  label?: string
): { result: T; time: number } {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  const time = end - start

  if (label && process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}: ${time.toFixed(2)}ms`)
  }

  return { result, time }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

