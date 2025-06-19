'use client'

import { useEffect } from 'react'
import { useSecurityAlert } from '@/contexts/SecurityContext'
import { setSecurityAlertHandler } from '@/lib/clientApi'
import { setGlobalSecurityHandler, initializeFetchInterceptor } from '@/lib/fetchInterceptor'
import SecurityNotification from '@/components/ui/SecurityNotification'

export default function SecurityWrapper() {
  const { securityMessage, securityResetTime, showSecurityAlert, clearSecurityAlert } = useSecurityAlert()

  useEffect(() => {
    // Set up the global security alert handler for the client API
    setSecurityAlertHandler(showSecurityAlert)
    
    // Set up the global fetch interceptor for all API calls
    setGlobalSecurityHandler(showSecurityAlert)
    initializeFetchInterceptor()
    
    // Listen for custom security error events (for testing)
    const handleSecurityError = (event: CustomEvent) => {
      if (event.detail?.message) {
        showSecurityAlert(event.detail.message, event.detail.resetTime)
      }
    }
    
    window.addEventListener('securityError', handleSecurityError as EventListener)
    
    return () => {
      window.removeEventListener('securityError', handleSecurityError as EventListener)
    }
  }, [showSecurityAlert])



  return (
    <SecurityNotification 
      message={securityMessage || undefined}
      resetTime={securityResetTime || undefined}
      onClose={clearSecurityAlert} 
    />
  )
} 
