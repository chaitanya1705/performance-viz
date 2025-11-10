import { DataPoint, ChartBounds, Viewport } from './types'

export interface RenderContext {
  ctx: CanvasRenderingContext2D
  bounds: ChartBounds
  viewport: Viewport
  pixelRatio: number
}

export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return null

  const pixelRatio = window.devicePixelRatio || 1

  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio

  ctx.scale(pixelRatio, pixelRatio)

  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  return ctx
}

export function clearCanvas(ctx: CanvasRenderingContext2D, bounds: ChartBounds): void {
  ctx.clearRect(bounds.x, bounds.y, bounds.width, bounds.height)
}

export function worldToScreen(
  x: number,
  y: number,
  viewport: Viewport,
  bounds: ChartBounds
): { x: number; y: number } {
  const scaleX = bounds.width / (viewport.xMax - viewport.xMin)
  const scaleY = bounds.height / (viewport.yMax - viewport.yMin)

  return {
    x: bounds.x + (x - viewport.xMin) * scaleX,
    y: bounds.y + bounds.height - (y - viewport.yMin) * scaleY,
  }
}

export function screenToWorld(
  x: number,
  y: number,
  viewport: Viewport,
  bounds: ChartBounds
): { x: number; y: number } {
  const scaleX = bounds.width / (viewport.xMax - viewport.xMin)
  const scaleY = bounds.height / (viewport.yMax - viewport.yMin)

  return {
    x: viewport.xMin + (x - bounds.x) / scaleX,
    y: viewport.yMax - (y - bounds.y) / scaleY,
  }
}

export function calculateViewport(
  data: DataPoint[],
  padding: number = 0.1
): Viewport {
  if (data.length === 0) {
    return {
      xMin: 0,
      xMax: 1000,
      yMin: 0,
      yMax: 100,
    }
  }

  const timestamps = data.map((d) => d.timestamp)
  const values = data.map((d) => d.value)

  const xMin = Math.min(...timestamps)
  const xMax = Math.max(...timestamps)
  const yMin = Math.min(...values)
  const yMax = Math.max(...values)

  const xRange = xMax - xMin
  const yRange = yMax - yMin

  return {
    xMin: xMin - xRange * padding,
    xMax: xMax + xRange * padding,
    yMin: yMin - yRange * padding,
    yMax: yMax + yRange * padding,
  }
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  bounds: ChartBounds,
  viewport: Viewport,
  gridColor: string = 'rgba(255, 255, 255, 0.1)',
  textColor: string = 'rgba(255, 255, 255, 0.6)'
): void {
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1
  ctx.font = '12px monospace'
  ctx.fillStyle = textColor

  const xRange = viewport.xMax - viewport.xMin
  const yRange = viewport.yMax - viewport.yMin

  const xSteps = 10
  const ySteps = 10

  const xStep = xRange / xSteps
  const yStep = yRange / ySteps

  for (let i = 0; i <= xSteps; i++) {
    const x = viewport.xMin + i * xStep
    const screen = worldToScreen(x, viewport.yMin, viewport, bounds)
    ctx.beginPath()
    ctx.moveTo(screen.x, bounds.y)
    ctx.lineTo(screen.x, bounds.y + bounds.height)
    ctx.stroke()

    const date = new Date(x)
    const label = date.toLocaleTimeString()
    ctx.fillText(label, screen.x - 30, bounds.y + bounds.height + 15)
  }

  for (let i = 0; i <= ySteps; i++) {
    const y = viewport.yMin + i * yStep
    const screen = worldToScreen(viewport.xMin, y, viewport, bounds)
    ctx.beginPath()
    ctx.moveTo(bounds.x, screen.y)
    ctx.lineTo(bounds.x + bounds.width, screen.y)
    ctx.stroke()

    ctx.fillText(y.toFixed(1), bounds.x - 50, screen.y + 4)
  }
}

export function drawAxes(
  ctx: CanvasRenderingContext2D,
  bounds: ChartBounds,
  viewport: Viewport,
  axisColor: string = 'rgba(255, 255, 255, 0.8)'
): void {
  ctx.strokeStyle = axisColor
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.moveTo(bounds.x, bounds.y + bounds.height)
  ctx.lineTo(bounds.x + bounds.width, bounds.y + bounds.height)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(bounds.x, bounds.y)
  ctx.lineTo(bounds.x, bounds.y + bounds.height)
  ctx.stroke()
}

