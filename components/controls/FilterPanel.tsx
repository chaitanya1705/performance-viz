'use client'

import React, { memo, useState, useCallback } from 'react'
import { DataPoint } from '@/lib/types'
import { debounce } from '@/lib/performanceUtils'
import { Search, Filter, Thermometer, Gauge, Droplets, Bolt } from 'lucide-react'

interface FilterPanelProps {
  data: DataPoint[]
  categories: string[]
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
  onDataFiltered: (filtered: DataPoint[]) => void
}

const FilterPanel = memo(function FilterPanel({
  data,
  categories,
  selectedCategories,
  onCategoryChange,
  onDataFiltered,
}: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleCategoryToggle = useCallback(
    (category: string) => {
      const newCategories = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category]
      onCategoryChange(newCategories)
    },
    [selectedCategories, onCategoryChange]
  )

  const debouncedFilter = React.useMemo(
    () =>
      debounce((term: string, cats: string[]) => {
        let filtered = data

        if (cats.length > 0) {
          filtered = filtered.filter((point) =>
            cats.includes(point.category)
          )
        }

        if (term) {
          filtered = filtered.filter(
            (point) =>
              point.category.toLowerCase().includes(term.toLowerCase()) ||
              point.metadata?.sensorId?.toLowerCase().includes(term.toLowerCase())
          )
        }

        onDataFiltered(filtered)
      }, 300),
    [data, onDataFiltered]
  )

  React.useEffect(() => {
    debouncedFilter(searchTerm, selectedCategories)
  }, [searchTerm, selectedCategories, debouncedFilter])

  const categoryIcons: Record<string, React.ReactNode> = {
    temperature: <Thermometer className="w-4 h-4" />,
    pressure: <Gauge className="w-4 h-4" />,
    humidity: <Droplets className="w-4 h-4" />,
    voltage: <Bolt className="w-4 h-4" />,
  }

  return (
    <div className="glass-effect dark:glass-effect light:glass-effect-light rounded-2xl p-5 hover-lift">
      <h3 className="text-xl font-bold mb-5 text-white dark:text-white light:text-slate-900 flex items-center gap-2">
        <Filter className="w-5 h-5 text-blue-400" />
        Filters
      </h3>

      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400 light:text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 glass-effect dark:glass-effect light:glass-effect-light border border-white/20 dark:border-white/20 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-400 dark:placeholder-slate-400 light:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3 text-slate-300 dark:text-slate-300 light:text-slate-700 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span>Categories</span>
        </h4>
        <div className="space-y-2.5">
          {categories.map((category, index) => (
            <label
              key={category}
              className="flex items-center space-x-3 cursor-pointer text-white dark:text-white light:text-slate-900 group hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 rounded-lg p-2 transition-all duration-200"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-5 h-5 text-blue-600 bg-white/10 dark:bg-white/10 light:bg-slate-200 border-white/20 dark:border-white/20 light:border-slate-300 rounded focus:ring-blue-500 focus:ring-2 transition-all cursor-pointer"
              />
              <span className="text-blue-400 dark:text-blue-400 light:text-blue-600">{categoryIcons[category] || <Filter className="w-4 h-4" />}</span>
              <span className="capitalize font-medium group-hover:text-blue-400 dark:group-hover:text-blue-400 light:group-hover:text-blue-600 transition-colors">{category}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
})

export default FilterPanel

