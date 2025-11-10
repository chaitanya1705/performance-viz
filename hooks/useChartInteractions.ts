'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Viewport, ChartBounds } from '@/lib/types'
import { screenToWorld } from '@/lib/canvasUtils'

interface UseChartInteractionsOptions {
  initialViewport: Viewport
  bounds: ChartBounds
  onViewportChange?: (viewport: Viewport) => void
  minZoom?: number
  maxZoom?: number
}

export function useChartInteractions(options: UseChartInteractionsOptions) {
  const {
    initialViewport,
    bounds,
    onViewportChange,
    minZoom = 0.1,
    maxZoom = 10,
  } = options

  const [viewport, setViewport] = useState<Viewport>(initialViewport)
  const lastWheelTimeRef = useRef<number>(0)
  const initialViewportRef = useRef<Viewport>(initialViewport)
  const userHasInteractedRef = useRef<boolean>(false)
  const stableViewportRef = useRef<Viewport>(initialViewport)

  React.useEffect(() => {
    if (!userHasInteractedRef.current) {
      const xRangeChange = Math.abs((initialViewport.xMax - initialViewport.xMin) - (stableViewportRef.current.xMax - stableViewportRef.current.xMin)) / (stableViewportRef.current.xMax - stableViewportRef.current.xMin) > 0.1
      const yRangeChange = Math.abs((initialViewport.yMax - initialViewport.yMin) - (stableViewportRef.current.yMax - stableViewportRef.current.yMin)) / (stableViewportRef.current.yMax - stableViewportRef.current.yMin) > 0.1
      
      if (xRangeChange || yRangeChange) {
        initialViewportRef.current = initialViewport
        stableViewportRef.current = initialViewport
        setViewport(initialViewport)
      } else {
        initialViewportRef.current = initialViewport
      }
    } else {
      initialViewportRef.current = initialViewport
    }
  }, [initialViewport])

  const updateViewport = useCallback(
    (newViewport: Viewport) => {
      setViewport(newViewport)
      if (onViewportChange) {
        onViewportChange(newViewport)
      }
    },
    [onViewportChange]
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      userHasInteractedRef.current = true
      const now = performance.now()
      if (now - lastWheelTimeRef.current < 16) return
      lastWheelTimeRef.current = now

      const canvas = e.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const worldPos = screenToWorld(x, y, viewport, bounds)
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9

      const xRange = viewport.xMax - viewport.xMin
      const yRange = viewport.yMax - viewport.yMin

      const newXRange = xRange * zoomFactor
      const newYRange = yRange * zoomFactor

      if (newXRange / (viewport.xMax - viewport.xMin) < minZoom) return
      if (newXRange / (viewport.xMax - viewport.xMin) > maxZoom) return

      const xCenter = worldPos.x
      const yCenter = worldPos.y

      const newXMin = xCenter - (xCenter - viewport.xMin) * zoomFactor
      const newXMax = xCenter + (viewport.xMax - xCenter) * zoomFactor
      const newYMin = yCenter - (yCenter - viewport.yMin) * zoomFactor
      const newYMax = yCenter + (viewport.yMax - yCenter) * zoomFactor

      updateViewport({
        xMin: newXMin,
        xMax: newXMax,
        yMin: newYMin,
        yMax: newYMax,
      })
    },
    [viewport, bounds, minZoom, maxZoom, updateViewport]
  )


  const resetViewport = useCallback(() => {
    userHasInteractedRef.current = false
    updateViewport({ ...initialViewportRef.current })
  }, [updateViewport])

  return {
    viewport,
    handleWheel,
    resetViewport,
  }
}

