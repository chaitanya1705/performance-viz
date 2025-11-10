'use client'

import React, { memo } from 'react'
import { DataPoint, ChartBounds, Viewport } from '@/lib/types'
import {
  setupCanvas,
  clearCanvas,
  calculateViewport,
  worldToScreen,
  drawGrid,
  drawAxes,
} from '@/lib/canvasUtils'
interface BarChartProps {
  data: DataPoint[]
  width: number
  height: number
  color?: string
  showGrid?: boolean
  category?: string
}

const BarChart = memo(function BarChart({
  data,
  width,
  height,
  color = '#8b5cf6',
  showGrid = true,
  category,
}: BarChartProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const animationFrameRef = React.useRef<number | null>(null)
  const lastDataRef = React.useRef<DataPoint[]>([])

  const bounds: ChartBounds = React.useMemo(
    () => ({
      x: 80,
      y: 20,
      width: width - 100,
      height: height - 60,
    }),
    [width, height]
  )

  const viewport: Viewport = React.useMemo(() => {
    const filteredData = category
      ? data.filter((d) => d.category === category)
      : data
    return calculateViewport(filteredData)
  }, [data, category])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = setupCanvas(canvas, width, height)
    if (!ctx) return

    const filteredData = category
      ? data.filter((d) => d.category === category)
      : data

    const render = () => {
      clearCanvas(ctx, bounds)

      if (showGrid) {
        drawGrid(ctx, bounds, viewport)
        drawAxes(ctx, bounds, viewport)
      }

      if (filteredData.length > 0) {
        const sortedData = [...filteredData].sort(
          (a, b) => a.timestamp - b.timestamp
        )

        const barWidth = Math.max(
          1,
          bounds.width / sortedData.length - 2
        )

        ctx.fillStyle = color
        ctx.strokeStyle = color
        ctx.lineWidth = 1

        sortedData.forEach((point) => {
          const screen = worldToScreen(
            point.timestamp,
            point.value,
            viewport,
            bounds
          )
          const zeroScreen = worldToScreen(
            point.timestamp,
            viewport.yMin,
            viewport,
            bounds
          )

          const barHeight = zeroScreen.y - screen.y

          ctx.fillRect(
            screen.x - barWidth / 2,
            screen.y,
            barWidth,
            barHeight
          )
        })
      }

      lastDataRef.current = filteredData
    }

    const animate = () => {
      render()
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [data, width, height, bounds, viewport, color, showGrid, category])

  return (
    <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
          />
    </div>
  )
})

export default BarChart

