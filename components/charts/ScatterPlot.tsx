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
interface ScatterPlotProps {
  data: DataPoint[]
  width: number
  height: number
  color?: string
  pointSize?: number
  showGrid?: boolean
  category?: string
}

const ScatterPlot = memo(function ScatterPlot({
  data,
  width,
  height,
  color = '#10b981',
  pointSize = 4,
  showGrid = true,
  category,
}: ScatterPlotProps) {
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
        ctx.fillStyle = color
        ctx.strokeStyle = color
        ctx.lineWidth = 1

        const density = Math.max(1, Math.floor(filteredData.length / 1000))
        const pointsToRender = filteredData.filter(
          (_, index) => index % density === 0
        )

        pointsToRender.forEach((point) => {
          const screen = worldToScreen(
            point.timestamp,
            point.value,
            viewport,
            bounds
          )

          ctx.beginPath()
          ctx.arc(screen.x, screen.y, pointSize, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
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
  }, [data, width, height, bounds, viewport, color, pointSize, showGrid, category])

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

export default ScatterPlot

