/**
 * Cookie consent management utilities
 * Handles user preferences for analytics and tracking cookies
 */

export type CookieConsentStatus = 'accepted' | 'declined' | null

/**
 * Get the current cookie consent status from localStorage
 */
export const getCookieConsent = (): CookieConsentStatus => {
  if (typeof window === 'undefined') return null
  
  try {
    const consent = localStorage.getItem('cookie-consent')
    return consent as CookieConsentStatus
  } catch (error) {
    console.warn('Failed to read cookie consent from localStorage:', error)
    return null
  }
}

/**
 * Set cookie consent status in localStorage
 */
export const setCookieConsent = (status: CookieConsentStatus) => {
  if (typeof window === 'undefined') return
  
  try {
    if (status === null) {
      localStorage.removeItem('cookie-consent')
      localStorage.removeItem('cookie-consent-date')
    } else {
      localStorage.setItem('cookie-consent', status)
      localStorage.setItem('cookie-consent-date', new Date().toISOString())
    }
  } catch (error) {
    console.warn('Failed to save cookie consent to localStorage:', error)
  }
}

/**
 * Check if analytics cookies are allowed
 */
export const isAnalyticsAllowed = (): boolean => {
  return getCookieConsent() === 'accepted'
}

/**
 * Check if user has made a cookie consent decision
 */
export const hasConsentDecision = (): boolean => {
  return getCookieConsent() !== null
}

/**
 * Get the date when consent was given/declined
 */
export const getConsentDate = (): Date | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const dateString = localStorage.getItem('cookie-consent-date')
    return dateString ? new Date(dateString) : null
  } catch (error) {
    console.warn('Failed to read consent date from localStorage:', error)
    return null
  }
}

/**
 * Check if consent is older than specified days (for re-prompting)
 */
export const isConsentExpired = (days: number = 365): boolean => {
  const consentDate = getConsentDate()
  if (!consentDate) return true
  
  const expirationDate = new Date(consentDate)
  expirationDate.setDate(expirationDate.getDate() + days)
  
  return new Date() > expirationDate
} 
