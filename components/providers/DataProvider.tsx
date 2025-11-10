'use client'

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import { DataPoint } from '@/lib/types'

interface DataContextValue {
  data: DataPoint[]
  setData: (data: DataPoint[]) => void
  filteredData: DataPoint[]
  setFilteredData: (data: DataPoint[]) => void
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataPoint[]>([])
  const [filteredData, setFilteredData] = useState<DataPoint[]>([])

  const value = useMemo(
    () => ({
      data,
      setData,
      filteredData,
      setFilteredData,
    }),
    [data, filteredData]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useDataContext() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider')
  }
  return context
}

