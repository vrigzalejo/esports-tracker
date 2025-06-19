'use client'

import { createContext, useContext, ReactNode } from 'react'
import { getUserTimezone } from '@/lib/utils'

interface TimezoneContextType {
  currentTimezone: string
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined)

interface TimezoneProviderProps {
  children: ReactNode
}

export function TimezoneProvider({ children }: TimezoneProviderProps) {
  // Always use the user's current system timezone
  const currentTimezone = getUserTimezone()

  return (
    <TimezoneContext.Provider value={{ currentTimezone }}>
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone() {
  const context = useContext(TimezoneContext)
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider')
  }
  return context
}

// Hook to get current timezone
export function useCurrentTimezone() {
  const { currentTimezone } = useTimezone()
  return currentTimezone
} 
