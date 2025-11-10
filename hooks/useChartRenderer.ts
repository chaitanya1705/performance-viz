'use client'

import { useRef, useEffect, useMemo, useCallback } from 'react'
import { DataPoint, ChartBounds, Viewport } from '@/lib/types'
import {
  setupCanvas,
  clearCanvas,
  calculateViewport,
  worldToScreen,
} from '@/lib/canvasUtils'
import { measurePerformance } from '@/lib/performanceUtils'

interface UseChartRendererOptions {
  data: DataPoint[]
  width: number
  height: number
  color?: string
  lineWidth?: number
  onRenderComplete?: (time: number) => void
}

export function useChartRenderer(options: UseChartRendererOptions) {
  const {
    data,
    width,
    height,
    color = '#3b82f6',
    lineWidth = 2,
    onRenderComplete,
  } = options

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastDataRef = useRef<DataPoint[]>([])

  const bounds: ChartBounds = useMemo(
    () => ({
      x: 80,
      y: 20,
      width: width - 100,
      height: height - 60,
    }),
    [width, height]
  )

  const viewport: Viewport = useMemo(() => {
    if (data.length === 0) {
      return {
        xMin: 0,
        xMax: 1000,
        yMin: 0,
        yMax: 100,
      }
    }
    return calculateViewport(data)
  }, [data])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = setupCanvas(canvas, width, height)
    if (!ctx) return

    const { time } = measurePerformance(() => {
      clearCanvas(ctx, bounds)

      if (data.length > 0) {
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.beginPath()

        const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp)

        sortedData.forEach((point, index) => {
          const screen = worldToScreen(
            point.timestamp,
            point.value,
            viewport,
            bounds
          )

          if (index === 0) {
            ctx.moveTo(screen.x, screen.y)
          } else {
            ctx.lineTo(screen.x, screen.y)
          }
        })

        ctx.stroke()
      }
    })

    if (onRenderComplete) {
      onRenderComplete(time)
    }
  }, [data, width, height, bounds, viewport, color, lineWidth, onRenderComplete])

  useEffect(() => {
    const dataChanged =
      data.length !== lastDataRef.current.length ||
      data.some(
        (point, index) =>
          point.timestamp !== lastDataRef.current[index]?.timestamp ||
          point.value !== lastDataRef.current[index]?.value
      )

    if (dataChanged) {
      lastDataRef.current = data
      render()
    }
  }, [data, render])

  return { canvasRef, render, viewport, bounds }
}

