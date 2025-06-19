'use client'

import { useCurrentTimezone } from '@/contexts/TimezoneContext'
import { formatMatchDateTime, formatMatchDateSmart } from '@/lib/utils'

interface TimezoneAwareDateProps {
  dateString: string
  format?: 'smart' | 'full' | 'date' | 'time' | 'compact'
  className?: string
  includeYear?: boolean
  includeWeekday?: boolean
  fallback?: string
}

export default function TimezoneAwareDate({
  dateString,
  format = 'smart',
  className = '',
  includeYear = false,
  includeWeekday = false,
  fallback = 'TBD'
}: TimezoneAwareDateProps) {
  const currentTimezone = useCurrentTimezone()

  if (!dateString) {
    return <span className={className}>{fallback}</span>
  }

  const getFormattedDate = () => {
    switch (format) {
      case 'smart':
        return formatMatchDateSmart(dateString, currentTimezone, { includeYear })
      case 'full':
        return formatMatchDateTime(dateString, currentTimezone, {
          includeDate: true,
          includeTime: true,
          includeTimezone: true,
          includeWeekday,
          includeYear
        })
      case 'date':
        return formatMatchDateTime(dateString, currentTimezone, {
          includeDate: true,
          includeTime: false,
          includeTimezone: false,
          includeWeekday,
          includeYear
        })
      case 'time':
        return formatMatchDateTime(dateString, currentTimezone, {
          includeDate: false,
          includeTime: true,
          includeTimezone: true
        })
      case 'compact':
        return formatMatchDateTime(dateString, currentTimezone, {
          includeDate: true,
          includeTime: true,
          includeTimezone: true,
          compact: true,
          includeYear,
          includeWeekday
        })
      default:
        return formatMatchDateSmart(dateString, currentTimezone, { includeYear })
    }
  }

  return (
    <span className={className} title={formatMatchDateTime(dateString, currentTimezone, {
      includeDate: true,
      includeTime: true,
      includeTimezone: true,
      includeWeekday: true,
      includeYear: true
    })}>
      {getFormattedDate()}
    </span>
  )
}

// Hook for components that need direct access to timezone-formatted dates
export function useTimezoneAwareDate() {
  const currentTimezone = useCurrentTimezone()
  
  const formatDate = (
    dateString: string,
    options?: {
      includeDate?: boolean
      includeTime?: boolean
      includeTimezone?: boolean
      includeWeekday?: boolean
      includeYear?: boolean
      compact?: boolean
    }
  ) => {
    if (!dateString) return 'TBD'
    return formatMatchDateTime(dateString, currentTimezone, options)
  }

  const formatDateSmart = (dateString: string, options?: { includeYear?: boolean }) => {
    if (!dateString) return 'TBD'
    return formatMatchDateSmart(dateString, currentTimezone, options)
  }

  return {
    timezone: currentTimezone,
    formatDate,
    formatDateSmart
  }
} 
