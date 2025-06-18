'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense, useState } from 'react'
import { logger } from '@/lib/logger'
import { isAnalyticsAllowed, hasConsentDecision } from '@/lib/cookieConsent'

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: {
        page_path?: string
        page_title?: string
        page_location?: string
        event_category?: string
        event_label?: string
        value?: number
        [key: string]: string | number | boolean | undefined
      }
    ) => void
  }
}

interface GoogleAnalyticsProps {
  measurementId: string
}

const isDevelopment = process.env.NODE_ENV === 'development'

// Component that uses useSearchParams and needs Suspense
function GoogleAnalyticsWithSearchParams({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    if (isDevelopment) {
      // Only log in development
      logger.log('📊 [Analytics] Page view:', {
        measurementId,
        page_path: url,
        timestamp: new Date().toISOString()
      })
      return
    }

    // Only make actual requests in production
    if (!measurementId || typeof window.gtag !== 'function') return
    
    window.gtag('config', measurementId, {
      page_path: url,
    })
  }, [pathname, searchParams, measurementId])

  return null
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    // Check consent status on mount and when localStorage changes
    const checkConsent = () => {
      setConsentGiven(isAnalyticsAllowed())
    }
    
    checkConsent()
    
    // Listen for storage changes (in case consent is given in another tab)
    window.addEventListener('storage', checkConsent)
    
    return () => {
      window.removeEventListener('storage', checkConsent)
    }
  }, [])

  if (!measurementId) {
    return null
  }

  // In development, don't load Google Analytics scripts but still track consent
  if (isDevelopment) {
    logger.log('📊 [Analytics] Development mode - Google Analytics scripts disabled', {
      consentGiven,
      hasDecision: hasConsentDecision()
    })
    return (
      <Suspense fallback={null}>
        <GoogleAnalyticsWithSearchParams measurementId={measurementId} />
      </Suspense>
    )
  }

  // Only load analytics if consent is given
  if (!consentGiven) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsWithSearchParams measurementId={measurementId} />
      </Suspense>
    </>
  )
}

// Utility functions for tracking events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (isDevelopment) {
    logger.log('📊 [Analytics] Event:', {
      action,
      category,
      label,
      value,
      timestamp: new Date().toISOString()
    })
    return
  }

  // Check consent before tracking
  if (!isAnalyticsAllowed()) {
    return
  }

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export const trackPageView = (url: string, title?: string) => {
  if (isDevelopment) {
    logger.log('📊 [Analytics] Page view:', {
      url,
      title,
      timestamp: new Date().toISOString()
    })
    return
  }

  // Check consent before tracking
  if (!isAnalyticsAllowed()) {
    return
  }

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: title,
    })
  }
}

// Esports-specific tracking functions
export const trackMatchView = (matchId: string, teams: string[]) => {
  trackEvent('view_match', 'engagement', `${teams.join(' vs ')} - ${matchId}`)
}

export const trackTournamentView = (tournamentId: string, tournamentName: string) => {
  trackEvent('view_tournament', 'engagement', `${tournamentName} - ${tournamentId}`)
}

export const trackTeamView = (teamId: string, teamName: string) => {
  trackEvent('view_team', 'engagement', `${teamName} - ${teamId}`)
}

export const trackPlayerView = (playerId: string, playerName: string) => {
  trackEvent('view_player', 'engagement', `${playerName} - ${playerId}`)
}

export const trackOddsAssistantUsage = () => {
  trackEvent('use_odds_assistant', 'feature', 'AI Odds Analysis')
}

export const trackSearchPerformed = (query: string, results: number) => {
  trackEvent('search', 'engagement', query, results)
} 
