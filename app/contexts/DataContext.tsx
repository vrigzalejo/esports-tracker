'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { cacheManager } from '@/lib/cache'

interface DataContextType {
  clearAllCache: () => void
  clearExpiredCache: () => void
  getCacheInfo: () => { size: number; entries: Array<{ key: string; expiresIn: number }> }
  getCacheStats: () => {
    totalEntries: number
    gamesEntries: number
    matchesEntries: number
    matchDetailsEntries: number
    tournamentsEntries: number
    teamsEntries: number
    expiredEntries: number
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined)

interface DataProviderProps {
  children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const clearAllCache = () => {
    cacheManager.clear()
    console.log('All cache cleared')
  }

  const clearExpiredCache = () => {
    cacheManager.clearExpired()
    console.log('Expired cache entries cleared')
  }

  const getCacheInfo = () => {
    return cacheManager.getCacheInfo()
  }

  const getCacheStats = () => {
    const info = cacheManager.getCacheInfo()
    
    let gamesEntries = 0
    let matchesEntries = 0
    let matchDetailsEntries = 0
    let tournamentsEntries = 0
    let teamsEntries = 0
    let expiredEntries = 0

    info.entries.forEach(entry => {
      if (entry.expiresIn <= 0) {
        expiredEntries++
      } else if (entry.key.includes('/api/games')) {
        gamesEntries++
      } else if (entry.key.includes('/api/matches/') && entry.key.match(/\/api\/matches\/\d+/)) {
        matchDetailsEntries++
      } else if (entry.key.includes('/api/matches')) {
        matchesEntries++
      } else if (entry.key.includes('/api/tournaments')) {
        tournamentsEntries++
      } else if (entry.key.includes('/api/teams')) {
        teamsEntries++
      }
    })

    return {
      totalEntries: info.size,
      gamesEntries,
      matchesEntries,
      matchDetailsEntries,
      tournamentsEntries,
      teamsEntries,
      expiredEntries
    }
  }

  return (
    <DataContext.Provider value={{ 
      clearAllCache, 
      clearExpiredCache, 
      getCacheInfo, 
      getCacheStats 
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useDataContext() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}

// Hook to get cache status for debugging
export function useCacheStatus() {
  const { getCacheStats } = useDataContext()
  
  const [stats, setStats] = React.useState(getCacheStats())
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(getCacheStats())
    }, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [getCacheStats])
  
  return stats
} 