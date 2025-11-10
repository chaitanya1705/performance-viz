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
interface LineChartProps {
  data: DataPoint[]
  width: number
  height: number
  color?: string
  lineWidth?: number
  showGrid?: boolean
  category?: string
}

const LineChart = memo(function LineChart({
  data,
  width,
  height,
  color = '#3b82f6',
  lineWidth = 2,
  showGrid = true,
  category,
}: LineChartProps) {
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

        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.beginPath()

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

        if (filteredData.length < 100) {
          ctx.fillStyle = color
          sortedData.forEach((point) => {
            const screen = worldToScreen(
              point.timestamp,
              point.value,
              viewport,
              bounds
            )
            ctx.beginPath()
            ctx.arc(screen.x, screen.y, 3, 0, Math.PI * 2)
            ctx.fill()
          })
        }
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
  }, [data, width, height, bounds, viewport, color, lineWidth, showGrid, category])

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

export default LineChart

