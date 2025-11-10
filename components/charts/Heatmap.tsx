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
interface HeatmapProps {
  data: DataPoint[]
  width: number
  height: number
  showGrid?: boolean
}

function getHeatmapColor(value: number, min: number, max: number): string {
  const normalized = (value - min) / (max - min)
  
  if (normalized < 0.5) {
    const t = normalized * 2
    const r = Math.floor(t * 255)
    const g = Math.floor(t * 255)
    const b = 255
    return `rgb(${r}, ${g}, ${b})`
  } else {
    const t = (normalized - 0.5) * 2
    const r = 255
    const g = Math.floor((1 - t) * 255)
    const b = Math.floor((1 - t) * 255)
    return `rgb(${r}, ${g}, ${b})`
  }
}

const Heatmap = memo(function Heatmap({
  data,
  width,
  height,
  showGrid = true,
}: HeatmapProps) {
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
    return calculateViewport(data)
  }, [data])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = setupCanvas(canvas, width, height)
    if (!ctx) return

    const render = () => {
      clearCanvas(ctx, bounds)

      if (showGrid) {
        drawGrid(ctx, bounds, viewport)
        drawAxes(ctx, bounds, viewport)
      }

      if (data.length > 0) {
        const values = data.map((d) => d.value)
        const minValue = Math.min(...values)
        const maxValue = Math.max(...values)

        const gridSize = 20
        const cellWidth = bounds.width / gridSize
        const cellHeight = bounds.height / gridSize

        const grid: Map<string, number[]> = new Map()

        data.forEach((point) => {
          const screen = worldToScreen(
            point.timestamp,
            point.value,
            viewport,
            bounds
          )
          const gridX = Math.floor((screen.x - bounds.x) / cellWidth)
          const gridY = Math.floor((screen.y - bounds.y) / cellHeight)

          if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
            const key = `${gridX},${gridY}`
            if (!grid.has(key)) {
              grid.set(key, [])
            }
            grid.get(key)!.push(point.value)
          }
        })

        grid.forEach((values, key) => {
          const [gridX, gridY] = key.split(',').map(Number)
          const avgValue = values.reduce((a, b) => a + b, 0) / values.length
          const intensity = values.length / data.length

          const color = getHeatmapColor(avgValue, minValue, maxValue)
          const alpha = Math.min(1, intensity * 10)

          ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${alpha})`)
          ctx.fillRect(
            bounds.x + gridX * cellWidth,
            bounds.y + gridY * cellHeight,
            cellWidth,
            cellHeight
          )
        })
      }

      lastDataRef.current = data
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
  }, [data, width, height, bounds, viewport, showGrid])

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

export default Heatmap

