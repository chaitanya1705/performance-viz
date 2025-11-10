'use client'

import React, { useState, useEffect, useRef } from 'react'
import { PerformanceMetrics } from '@/lib/types'
import { PerformanceMonitor } from '@/lib/performanceUtils'

export function usePerformanceMonitor(enabled: boolean = true) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    dataProcessingTime: 0,
    frameCount: 0,
    lastFrameTime: 0,
  })

  const monitorRef = useRef<PerformanceMonitor | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    monitorRef.current = new PerformanceMonitor()

    let lastUpdateTime = 0
    const updateMetrics = () => {
      const now = performance.now()
      if (now - lastUpdateTime < 100) {
        animationFrameRef.current = requestAnimationFrame(updateMetrics)
        return
      }
      lastUpdateTime = now

      if (monitorRef.current) {
        const newMetrics = monitorRef.current.update()
        setMetrics(newMetrics)
      }
      animationFrameRef.current = requestAnimationFrame(updateMetrics)
    }

    animationFrameRef.current = requestAnimationFrame(updateMetrics)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [enabled])

  const recordDataProcessingTime = React.useCallback((time: number) => {
    setMetrics((prev) => ({
      ...prev,
      dataProcessingTime: time,
    }))
  }, [])

  return { metrics, recordDataProcessingTime }
}

