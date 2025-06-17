/**
 * Analytics utilities for tracking user interactions and page views
 * Provides a centralized way to track esports-specific events
 */

import { isAnalyticsAllowed } from '@/lib/cookieConsent'

// Re-export analytics functions from the GoogleAnalytics component
export {
  trackEvent,
  trackPageView,
  trackMatchView,
  trackTournamentView,
  trackTeamView,
  trackPlayerView,
  trackOddsAssistantUsage,
  trackSearchPerformed
} from '@/components/analytics/GoogleAnalytics'

// Additional analytics functions for specific user interactions

/**
 * Track when a user clicks on a match to view details
 */
export const trackMatchClick = (matchId: string, matchTitle: string, source: string) => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'click', {
      event_category: 'engagement',
      event_label: `Match: ${matchTitle} from ${source}`,
      value: 1,
    })
  }
}

/**
 * Track when a user clicks on a tournament to view details
 */
export const trackTournamentClick = (tournamentId: string, tournamentName: string, source: string) => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'click', {
      event_category: 'engagement',
      event_label: `Tournament: ${tournamentName} from ${source}`,
      value: 1,
    })
  }
}

/**
 * Track when a user clicks on a team to view details
 */
export const trackTeamClick = (teamId: string, teamName: string, source: string) => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'click', {
      event_category: 'engagement',
      event_label: `Team: ${teamName} from ${source}`,
      value: 1,
    })
  }
}

/**
 * Track when a user filters content (e.g., by game, status, etc.)
 */
export const trackFilter = (filterType: string, filterValue: string, resultsCount: number) => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'filter', {
      event_category: 'interaction',
      event_label: `${filterType}: ${filterValue}`,
      value: resultsCount,
    })
  }
}

/**
 * Track when a user navigates between sections
 */
export const trackNavigation = (from: string, to: string) => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'navigate', {
      event_category: 'navigation',
      event_label: `${from} → ${to}`,
      value: 1,
    })
  }
}

/**
 * Track when a user views match standings
 */
export const trackStandingsView = (tournamentId: string, tournamentName: string) => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'view_standings', {
      event_category: 'engagement',
      event_label: `${tournamentName} - ${tournamentId}`,
      value: 1,
    })
  }
}

/**
 * Track when a user views team roster
 */
export const trackRosterView = (teamId: string, teamName: string, context: string) => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'view_roster', {
      event_category: 'engagement',
      event_label: `${teamName} roster in ${context}`,
      value: 1,
    })
  }
}

/**
 * Track errors or issues that occur
 */
export const trackError = (errorType: string, errorMessage: string, location: string) => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'exception', {
      description: `${errorType}: ${errorMessage} at ${location}`,
      fatal: false,
    })
  }
}

/**
 * Track API response times for performance monitoring
 */
export const trackAPIPerformance = (endpoint: string, responseTime: number, success: boolean) => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'timing_complete', {
      name: `API_${endpoint}`,
      value: responseTime,
      event_category: 'performance',
      event_label: success ? 'success' : 'failure',
    })
  }
}

/**
 * Track when users interact with live match features
 */
export const trackLiveMatchInteraction = (matchId: string, interactionType: 'refresh' | 'stream_click' | 'odds_view') => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'live_match_interaction', {
      event_category: 'engagement',
      event_label: `${interactionType} - ${matchId}`,
      value: 1,
    })
  }
}

/**
 * Track game-specific engagement
 */
export const trackGameEngagement = (gameName: string, action: string) => {
  if (!isAnalyticsAllowed()) return
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'game_engagement', {
      event_category: 'games',
      event_label: `${gameName}: ${action}`,
      value: 1,
    })
  }
} 
