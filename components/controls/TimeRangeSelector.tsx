'use client'

import React, { memo, useState, useCallback } from 'react'
import { AggregationPeriod } from '@/lib/types'
import { Clock, Calendar, Settings, BarChart3, Timer, Hourglass } from 'lucide-react'

interface TimeRangeSelectorProps {
  onTimeRangeChange: (start: number, end: number) => void
  onAggregationChange: (period: AggregationPeriod['type']) => void
  currentAggregation: AggregationPeriod['type']
}

const aggregationOptions: AggregationPeriod[] = [
  { type: 'raw', label: 'Raw Data' },
  { type: '1min', label: '1 Minute' },
  { type: '5min', label: '5 Minutes' },
  { type: '1hour', label: '1 Hour' },
]

const TimeRangeSelector = memo(function TimeRangeSelector({
  onTimeRangeChange,
  onAggregationChange,
  currentAggregation,
}: TimeRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<'1h' | '6h' | '24h' | 'custom'>('1h')

  const handleRangeSelect = useCallback(
    (range: '1h' | '6h' | '24h' | 'custom') => {
      setSelectedRange(range)
      const now = Date.now()
      let start: number

      switch (range) {
        case '1h':
          start = now - 3600000
          break
        case '6h':
          start = now - 21600000
          break
        case '24h':
          start = now - 86400000
          break
        default:
          start = now - 3600000
      }

      onTimeRangeChange(start, now)
    },
    [onTimeRangeChange]
  )

  React.useEffect(() => {
    handleRangeSelect(selectedRange)
  }, [selectedRange, handleRangeSelect])

  const rangeIcons: Record<string, React.ReactNode> = {
    '1h': <Clock className="w-4 h-4" />,
    '6h': <Timer className="w-4 h-4" />,
    '24h': <Calendar className="w-4 h-4" />,
    'custom': <Settings className="w-4 h-4" />,
  }

  const aggregationIcons: Record<string, React.ReactNode> = {
    'raw': <BarChart3 className="w-4 h-4" />,
    '1min': <Timer className="w-4 h-4" />,
    '5min': <Hourglass className="w-4 h-4" />,
    '1hour': <Clock className="w-4 h-4" />,
  }

  return (
    <div className="glass-effect dark:glass-effect light:glass-effect-light rounded-2xl p-5 hover-lift">
      <h3 className="text-xl font-bold mb-5 text-white dark:text-white light:text-slate-900 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-400" />
        Time Range
      </h3>

      <div className="mb-4">
        <div className="grid grid-cols-4 gap-1.5">
          {(['1h', '6h', '24h', 'custom'] as const).map((range, index) => (
            <button
              key={range}
              onClick={() => handleRangeSelect(range)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover-lift flex flex-col items-center gap-0.5 ${
                selectedRange === range
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/30'
                  : 'glass-effect dark:glass-effect light:glass-effect-light text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="text-blue-400 dark:text-blue-400 light:text-blue-600 scale-75">{rangeIcons[range]}</span>
              <span className="text-[10px]">{range === 'custom' ? 'Custom' : range.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3 text-slate-300 dark:text-slate-300 light:text-slate-700 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <span>Aggregation</span>
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {aggregationOptions.map((option, index) => (
            <button
              key={option.type}
              onClick={() => onAggregationChange(option.type)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover-lift flex items-center justify-center gap-1.5 ${
                currentAggregation === option.type
                  ? 'bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-md shadow-purple-500/30'
                  : 'glass-effect dark:glass-effect light:glass-effect-light text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="text-purple-400 dark:text-purple-400 light:text-purple-600 scale-75">{aggregationIcons[option.type] || <BarChart3 className="w-3 h-3" />}</span>
              <span className="text-[10px]">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})

export default TimeRangeSelector

