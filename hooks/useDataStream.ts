'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { DataPoint } from '@/lib/types'
import { generateTimeSeriesData } from '@/lib/dataGenerator'

interface UseDataStreamOptions {
  interval?: number
  initialCount?: number
  maxDataPoints?: number
}

export function useDataStream(options: UseDataStreamOptions = {}) {
  const {
    interval = 100,
    initialCount = 1000,
    maxDataPoints = 10000,
  } = options

  const [data, setData] = useState<DataPoint[]>(() =>
    generateTimeSeriesData(initialCount)
  )
  const [isPending, startTransition] = useTransition()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateRef = useRef<number>(Date.now())

  useEffect(() => {
    if (interval <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const updateData = () => {
      startTransition(() => {
        setData((prevData) => {
          const now = Date.now()
          const newPoint: DataPoint = {
            timestamp: now,
            value: 20 + Math.sin(now / 1000) * 5 + Math.random() * 2,
            category: ['temperature', 'pressure', 'humidity', 'voltage'][
              Math.floor(Math.random() * 4)
            ],
            metadata: {
              sensorId: `sensor-${Math.floor(Math.random() * 10) + 1}`,
            },
          }

          const updated = [...prevData, newPoint]
          if (updated.length > maxDataPoints) {
            return updated.slice(-maxDataPoints)
          }
          return updated
        })
        lastUpdateRef.current = Date.now()
      })
    }

    intervalRef.current = setInterval(updateData, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [interval, maxDataPoints])

  return { data, isPending }
}

