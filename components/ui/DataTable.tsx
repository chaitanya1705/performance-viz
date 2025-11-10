'use client'

import React, { memo } from 'react'
import { DataPoint } from '@/lib/types'
import { useVirtualization } from '@/hooks/useVirtualization'
import { Table, Clock, BarChart3, Folder, Plug } from 'lucide-react'

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

interface DataTableProps {
  data: DataPoint[]
  height?: number
}

const DataTable = memo(function DataTable({
  data,
  height = 400,
}: DataTableProps) {
  const {
    containerRef,
    visibleItems,
    offsetY,
    totalHeight,
  } = useVirtualization<DataPoint>(data, {
    itemHeight: 40,
    containerHeight: height,
    overscan: 5,
  })

  return (
    <div className="glass-effect dark:glass-effect light:glass-effect-light rounded-2xl overflow-hidden hover-lift">
      <div className="p-5 border-b border-white/10 dark:border-white/10 light:border-slate-200">
        <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
          <Table className="w-5 h-5 text-blue-400" />
          <span>Data Table</span>
          <span className="text-sm font-normal text-slate-400 dark:text-slate-400 light:text-slate-600">({data.length.toLocaleString()} points)</span>
        </h3>
      </div>
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: `${height}px` }}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            <table className="w-full">
              <thead className="sticky top-0 glass-effect dark:glass-effect light:glass-effect-light backdrop-blur-xl">
                <tr className="text-left text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Timestamp</span>
                    </span>
                  </th>
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Value</span>
                    </span>
                  </th>
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      <span>Category</span>
                    </span>
                  </th>
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Plug className="w-4 h-4" />
                      <span>Sensor ID</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((point, index) => (
                  <tr
                    key={`${point.timestamp}-${index}`}
                    className="border-b border-white/5 dark:border-white/5 light:border-slate-200 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-100 transition-all duration-200 hover:shadow-lg"
                  >
                    <td className="px-4 py-2 text-white dark:text-white light:text-slate-900 text-sm" suppressHydrationWarning>
                      {formatTimestamp(point.timestamp)}
                    </td>
                    <td className="px-4 py-2 text-white dark:text-white light:text-slate-900 text-sm font-mono">
                      {point.value.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-white dark:text-white light:text-slate-900 text-sm capitalize">
                      {point.category}
                    </td>
                    <td className="px-4 py-2 text-white dark:text-white light:text-slate-900 text-sm">
                      {point.metadata?.sensorId || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
})

export default DataTable

