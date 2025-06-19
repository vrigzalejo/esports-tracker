'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SecurityContextType {
  securityMessage: string | null
  securityResetTime: number | null
  showSecurityAlert: (message: string, resetTime?: number) => void
  clearSecurityAlert: () => void
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined)

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [securityMessage, setSecurityMessage] = useState<string | null>(null)
  const [securityResetTime, setSecurityResetTime] = useState<number | null>(null)

  const showSecurityAlert = (message: string, resetTime?: number) => {
    setSecurityMessage(message)
    setSecurityResetTime(resetTime || null)
  }

  const clearSecurityAlert = () => {
    setSecurityMessage(null)
    setSecurityResetTime(null)
  }

  return (
    <SecurityContext.Provider value={{
      securityMessage,
      securityResetTime,
      showSecurityAlert,
      clearSecurityAlert
    }}>
      {children}
    </SecurityContext.Provider>
  )
}

export function useSecurityAlert() {
  const context = useContext(SecurityContext)
  if (context === undefined) {
    throw new Error('useSecurityAlert must be used within a SecurityProvider')
  }
  return context
} 
