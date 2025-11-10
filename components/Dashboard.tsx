'use client'

import React, { useState, useMemo, useCallback, Suspense } from 'react'
import { DataProvider } from '@/components/providers/DataProvider'
import { useDataStream } from '@/hooks/useDataStream'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import ScatterPlot from '@/components/charts/ScatterPlot'
import Heatmap from '@/components/charts/Heatmap'
import FilterPanel from '@/components/controls/FilterPanel'
import TimeRangeSelector from '@/components/controls/TimeRangeSelector'
import DataTable from '@/components/ui/DataTable'
import PerformanceMonitor from '@/components/ui/PerformanceMonitor'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { DataPoint, AggregationPeriod } from '@/lib/types'
import { aggregateData, filterDataByTimeRange, filterDataByCategory } from '@/lib/dataGenerator'
import { measurePerformance } from '@/lib/performanceUtils'
import { BarChart3, LineChart as LineChartIcon, Activity, Grid3x3, Play, Pause, TrendingUp, Bolt } from 'lucide-react'

type ChartType = 'line' | 'bar' | 'scatter' | 'heatmap'

export default function Dashboard() {
  const [chartType, setChartType] = useState<ChartType>('line')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  })
  const [aggregation, setAggregation] = useState<AggregationPeriod['type']>('raw')
  const [dataPointCount, setDataPointCount] = useState(1000)
  const [filteredData, setFilteredData] = useState<DataPoint[]>([])
  const [updateInterval, setUpdateInterval] = useState(100)
  const [isPaused, setIsPaused] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [snapshotData, setSnapshotData] = useState<DataPoint[]>([])

  React.useEffect(() => {
    const now = Date.now()
    setTimeRange({
      start: now - 3600000,
      end: now,
    })
  }, [])

  const { data, isPending } = useDataStream({
    interval: isPaused ? 0 : updateInterval,
    initialCount: dataPointCount,
    maxDataPoints: 10000,
  })

  const { metrics, recordDataProcessingTime } = usePerformanceMonitor(true)
  const processingTimeRef = React.useRef<number>(0)

  const categories = useMemo(() => {
    const cats = new Set<string>()
    data.forEach((point) => cats.add(point.category))
    return Array.from(cats)
  }, [data])

  const processedData = useMemo(() => {
    const { result, time } = measurePerformance(() => {
      let processed = data

      if (timeRange.start && timeRange.end) {
        processed = filterDataByTimeRange(processed, timeRange.start, timeRange.end)
      }

      if (selectedCategories.length > 0) {
        processed = filterDataByCategory(processed, selectedCategories)
      }

      if (aggregation !== 'raw') {
        processed = aggregateData(processed, aggregation)
      }

      return processed
    }, 'Data Processing')

    processingTimeRef.current = time
    return result
  }, [data, timeRange, selectedCategories, aggregation])

  React.useEffect(() => {
    recordDataProcessingTime(processingTimeRef.current)
  }, [processedData, recordDataProcessingTime])

  React.useEffect(() => {
    setFilteredData(processedData)
  }, [processedData])

  const handleCategoryChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories)
  }, [])

  const handleTimeRangeChange = useCallback((start: number, end: number) => {
    setTimeRange({ start, end })
  }, [])

  const handleAggregationChange = useCallback((period: AggregationPeriod['type']) => {
    setAggregation(period)
  }, [])

  const handleDataFiltered = useCallback((filtered: DataPoint[]) => {
    setFilteredData(filtered)
  }, [])

  const handlePause = useCallback(() => {
    setIsPaused(true)
    setSnapshotData(processedData)
  }, [processedData])

  const handleResume = useCallback(() => {
    setIsPaused(false)
    setHasStarted(true)
    if (snapshotData.length === 0 && processedData.length > 0) {
      setSnapshotData(processedData)
    }
  }, [processedData, snapshotData.length])

  const chartData = isPaused && snapshotData.length > 0 
    ? snapshotData 
    : (filteredData.length > 0 ? filteredData : processedData)

  return (
    <DataProvider>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="animate-slide-in">
              <h1 className="text-4xl font-bold text-white dark:text-white light:text-slate-900 mb-2 flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-blue-400" />
                Performance Dashboard
              </h1>
              <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 flex items-center gap-2">
                {isPaused ? (
                  <>
                    <Pause className="w-4 h-4 text-yellow-400 animate-pulse-slow" />
                    <span className="text-yellow-400 dark:text-yellow-400 light:text-amber-600">
                      {snapshotData.length > 0 ? 'Paused - Showing snapshot' : 'Stopped - Click Start to begin'}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
                    <span>Real-time data visualization with {data.length.toLocaleString()} data points</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <ThemeToggle />
              <div className="glass-effect dark:glass-effect light:glass-effect-light rounded-lg px-3 py-1.5 hover-lift">
                <label className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 mr-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Data Points:</span>
                </label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={dataPointCount}
                  onChange={(e) => setDataPointCount(parseInt(e.target.value) || 1000)}
                  className="bg-transparent text-white dark:text-white light:text-slate-900 w-20 text-right text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1.5 transition-all"
                />
              </div>
              <div className="glass-effect dark:glass-effect light:glass-effect-light rounded-lg px-3 py-1.5 hover-lift">
                <label className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 mr-2 flex items-center gap-1">
                  <Bolt className="w-3 h-3" />
                  <span>Update:</span>
                </label>
                <select
                  value={updateInterval}
                  onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
                  className="bg-transparent text-white dark:text-white light:text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1.5 transition-all cursor-pointer"
                >
                  <option value={50} className="bg-slate-800">50ms</option>
                  <option value={100} className="bg-slate-800">100ms</option>
                  <option value={250} className="bg-slate-800">250ms</option>
                  <option value={500} className="bg-slate-800">500ms</option>
                  <option value={1000} className="bg-slate-800">1000ms</option>
                  <option value={2000} className="bg-slate-800">2000ms</option>
                </select>
              </div>
              <button
                onClick={isPaused ? handleResume : handlePause}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover-lift flex items-center gap-1.5 ${
                  isPaused
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md shadow-green-500/20'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/20'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3 h-3" />
                    <span>{hasStarted ? 'Resume' : 'Start'}</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Pause</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Suspense fallback={<div className="text-white animate-pulse">Loading...</div>}>
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <PerformanceMonitor metrics={metrics} />
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <FilterPanel
                    data={data}
                    categories={categories}
                    selectedCategories={selectedCategories}
                    onCategoryChange={handleCategoryChange}
                    onDataFiltered={handleDataFiltered}
                  />
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <TimeRangeSelector
                    onTimeRangeChange={handleTimeRangeChange}
                    onAggregationChange={handleAggregationChange}
                    currentAggregation={aggregation}
                  />
                </div>
              </Suspense>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="glass-effect dark:glass-effect light:glass-effect-light rounded-2xl p-6 hover-lift animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                    Chart View
                  </h2>
                  <div className="flex gap-1.5">
                    {(['line', 'bar', 'scatter', 'heatmap'] as ChartType[]).map((type, index) => {
                      const icons = {
                        line: <LineChartIcon className="w-3 h-3" />,
                        bar: <BarChart3 className="w-3 h-3" />,
                        scatter: <Activity className="w-3 h-3" />,
                        heatmap: <Grid3x3 className="w-3 h-3" />,
                      }
                      const colors = { line: 'blue', bar: 'purple', scatter: 'green', heatmap: 'orange' }
                      return (
                        <button
                          key={type}
                          onClick={() => setChartType(type)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 capitalize flex items-center gap-1.5 hover-lift ${
                            chartType === type
                              ? `bg-gradient-to-r from-${colors[type]}-600 to-${colors[type]}-500 text-white shadow-md shadow-${colors[type]}-500/30`
                              : 'glass-effect dark:glass-effect light:glass-effect-light text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                          }`}
                          style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                        >
                          {icons[type]}
                          <span>{type}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="h-[500px] w-full">
                  {chartType === 'line' && (
                    <LineChart
                      data={chartData}
                      width={800}
                      height={500}
                      color="#3b82f6"
                      lineWidth={2}
                      showGrid={true}
                    />
                  )}
                  {chartType === 'bar' && (
                    <BarChart
                      data={chartData}
                      width={800}
                      height={500}
                      color="#8b5cf6"
                      showGrid={true}
                    />
                  )}
                  {chartType === 'scatter' && (
                    <ScatterPlot
                      data={chartData}
                      width={800}
                      height={500}
                      color="#10b981"
                      pointSize={4}
                      showGrid={true}
                    />
                  )}
                  {chartType === 'heatmap' && (
                    <Heatmap
                      data={chartData}
                      width={800}
                      height={500}
                      showGrid={true}
                    />
                  )}
                </div>
              </div>

              <Suspense fallback={<div className="text-white">Loading table...</div>}>
                <DataTable data={chartData.slice(0, 1000)} height={400} />
              </Suspense>
            </div>
          </div>

          {isPending && (
            <div className="fixed bottom-6 right-6 glass-effect dark:glass-effect light:glass-effect-light text-white dark:text-white light:text-slate-900 px-5 py-3 rounded-xl shadow-2xl animate-slide-up flex items-center gap-2 backdrop-blur-xl">
              <Bolt className="w-4 h-4 animate-pulse-slow" />
              <span className="font-medium">Updating data...</span>
            </div>
          )}

          <footer className="mt-12 pt-8 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 animate-fade-in">
            <div className="text-center text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm">
              Built by <span className="font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Chaitanya N</span>, <span className="font-mono">PES2UG22CS138</span> - <span className="font-medium">PES University</span>
            </div>
          </footer>
        </div>
      </div>
    </DataProvider>
  )
}

