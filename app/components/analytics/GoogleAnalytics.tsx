'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

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

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!measurementId || typeof window.gtag !== 'function') return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    window.gtag('config', measurementId, {
      page_path: url,
    })
  }, [pathname, searchParams, measurementId])

  if (!measurementId) {
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
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export const trackPageView = (url: string, title?: string) => {
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
