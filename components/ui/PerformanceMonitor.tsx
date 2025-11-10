'use client'

import React, { memo } from 'react'
import { PerformanceMetrics } from '@/lib/types'
import { Target, HardDrive, Clock, RefreshCw, BarChart3, Bolt } from 'lucide-react'

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics
}

const PerformanceMonitor = memo(function PerformanceMonitor({
  metrics,
}: PerformanceMonitorProps) {
  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400'
    if (fps >= 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="glass-effect dark:glass-effect light:glass-effect-light rounded-2xl p-5 hover-lift">
      <h3 className="text-xl font-bold mb-5 text-white dark:text-white light:text-slate-900 flex items-center gap-2">
        <Bolt className="w-5 h-5 text-blue-400" />
        Performance
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="animate-scale-in">
          <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mb-1.5 flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>FPS</span>
          </div>
          <div className={`text-3xl font-bold ${getFPSColor(metrics.fps)} transition-all duration-300`}>
            {metrics.fps.toFixed(1)}
          </div>
        </div>
        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mb-1.5 flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            <span>Memory</span>
          </div>
          <div className="text-3xl font-bold text-blue-400 transition-all duration-300">
            {metrics.memoryUsage.toFixed(1)} <span className="text-lg">MB</span>
          </div>
        </div>
        <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mb-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Render Time</span>
          </div>
          <div className="text-xl font-bold text-purple-400 transition-all duration-300">
            {metrics.renderTime.toFixed(2)} ms
          </div>
        </div>
        <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mb-1.5 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            <span>Processing</span>
          </div>
          <div className="text-xl font-bold text-green-400 transition-all duration-300">
            {metrics.dataProcessingTime.toFixed(2)} ms
          </div>
        </div>
        <div className="col-span-2 pt-2 border-t border-white/10 dark:border-white/10 light:border-slate-200 animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mb-1.5 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            <span>Frame Count</span>
          </div>
          <div className="text-lg font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 transition-all duration-300">
            {metrics.frameCount.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
})

export default PerformanceMonitor

