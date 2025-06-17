export const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'finished': return 'bg-gray-500'
      case 'not_started': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
}
  
export const getStatusText = (status: string): string => {
    switch (status) {
      case 'running': return 'LIVE'
      case 'finished': return 'FINISHED'
      case 'not_started': return 'UPCOMING'
      default: return 'TBD'
    }
}
  
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
}

// Country to timezone mapping for tournaments
const countryToTimezone: Record<string, string> = {
  'United States': 'America/Los_Angeles',
  'USA': 'America/Los_Angeles',
  'US': 'America/Los_Angeles',
  'Canada': 'America/Toronto',
  'Brazil': 'America/Sao_Paulo',
  'United Kingdom': 'Europe/London',
  'UK': 'Europe/London',
  'England': 'Europe/London',
  'Germany': 'Europe/Berlin',
  'France': 'Europe/Paris',
  'Spain': 'Europe/Madrid',
  'Italy': 'Europe/Rome',
  'Netherlands': 'Europe/Amsterdam',
  'Sweden': 'Europe/Stockholm',
  'Denmark': 'Europe/Copenhagen',
  'Norway': 'Europe/Oslo',
  'Finland': 'Europe/Helsinki',
  'Poland': 'Europe/Warsaw',
  'Russia': 'Europe/Moscow',
  'Turkey': 'Europe/Istanbul',
  'South Korea': 'Asia/Seoul',
  'Korea': 'Asia/Seoul',
  'Japan': 'Asia/Tokyo',
  'China': 'Asia/Shanghai',
  'Singapore': 'Asia/Singapore',
  'Thailand': 'Asia/Bangkok',
  'Philippines': 'Asia/Manila',
  'Indonesia': 'Asia/Jakarta',
  'India': 'Asia/Kolkata',
  'Australia': 'Australia/Sydney',
  'New Zealand': 'Pacific/Auckland',
  'Chile': 'America/Santiago',
  'Argentina': 'America/Argentina/Buenos_Aires',
  'Mexico': 'America/Mexico_City',
  'Peru': 'America/Lima',
  'Colombia': 'America/Bogota',
  'Venezuela': 'America/Caracas',
  'South Africa': 'Africa/Johannesburg',
  'Egypt': 'Africa/Cairo',
  'Israel': 'Asia/Jerusalem',
  'UAE': 'Asia/Dubai',
  'Saudi Arabia': 'Asia/Riyadh'
}

// Region to timezone mapping as fallback
const regionToTimezone: Record<string, string> = {
  'North America': 'America/Los_Angeles',
  'South America': 'America/Sao_Paulo',
  'Europe': 'Europe/London',
  'Asia': 'Asia/Seoul',
  'Oceania': 'Australia/Sydney',
  'Africa': 'Africa/Johannesburg',
  'Middle East': 'Asia/Dubai'
}

export const formatTournamentDate = (dateString: string, country?: string, region?: string): string => {
    const date = new Date(dateString)
    
    // Determine timezone based on country first, then region, then default to UTC
    let timezone = 'UTC'
    
    if (country) {
      timezone = countryToTimezone[country] || timezone
    }
    
    if (timezone === 'UTC' && region) {
      timezone = regionToTimezone[region] || timezone
    }
    
    try {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
        timeZoneName: 'short'
      })
    } catch {
      // Fallback to UTC if timezone is invalid
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short'
      })
    }
}

/**
 * Logs API requests with query strings while hiding sensitive tokens
 */
export function logApiRequest(endpoint: string, url: string, method: string = 'GET', params?: Record<string, string>) {
  // Hide token in URL for logging
  const sanitizedUrl = url.replace(/([?&]token=)[^&]+/, '$1***HIDDEN***')
  
  console.log(`🌐 [API] ${method} ${endpoint}`, {
    url: sanitizedUrl,
    params: params ? Object.fromEntries(
      Object.entries(params).map(([key, value]) => 
        key.toLowerCase().includes('token') ? [key, '***HIDDEN***'] : [key, value]
      )
    ) : undefined,
    timestamp: new Date().toISOString()
  })
}

/**
 * Logs API responses with timing and status information
 */
export function logApiResponse(endpoint: string, status: number, statusText: string, duration: number, dataInfo?: { count?: number; hasData?: boolean }) {
  const emoji = status >= 200 && status < 300 ? '✅' : '❌'
  console.log(`${emoji} [API] ${endpoint} response`, {
    status,
    statusText,
    duration: `${duration}ms`,
    ...dataInfo
  })
}

/**
 * Logs API errors with context
 */
export function logApiError(endpoint: string, error: unknown, context?: Record<string, unknown>) {
  console.error(`💥 [API] ${endpoint} error:`, {
    error: error instanceof Error ? error.message : error,
    ...context,
    timestamp: new Date().toISOString()
  })
}
