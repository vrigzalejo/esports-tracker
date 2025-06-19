'use client'

/**
 * Client-side API wrapper that handles security errors and notifications
 */

import { cacheManager } from './cache'
import { logApiRequest, logApiResponse, logApiError } from './utils'

// Global reference to security alert function
let globalSecurityAlert: ((message: string, resetTime?: number) => void) | null = null

export function setSecurityAlertHandler(handler: (message: string, resetTime?: number) => void) {
  globalSecurityAlert = handler
}

// Request deduplication - store ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<unknown>>()

const clientRequest = async (endpoint: string, params?: Record<string, string>, options?: RequestInit) => {
    // Create a unique key for this request
    const requestKey = `${endpoint}?${new URLSearchParams(params || {}).toString()}`
    
    // Check cache first
    const cachedData = cacheManager.get(endpoint, params)
    if (cachedData) {
        return cachedData
    }
    
    // Check if this exact request is already in progress
    if (ongoingRequests.has(requestKey)) {
        return ongoingRequests.get(requestKey)
    }

    const url = new URL(`${window.location.origin}${endpoint}`)

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value)
            }
        })
    }

    // Log the API request
    logApiRequest(endpoint, url.toString(), options?.method || 'GET', params)

    // Create the request promise and store it for deduplication
    const requestPromise = (async () => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

            const startTime = Date.now()
            const response = await fetch(url.toString(), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options?.headers
                },
                signal: controller.signal,
                ...options
            })

            clearTimeout(timeoutId)
            const duration = Date.now() - startTime

            if (!response.ok) {
                let errorBody = null
                try {
                    errorBody = await response.json()
                    
                    // Check for SECURITY_ERROR
                    if (errorBody?.error === 'SECURITY_ERROR' && globalSecurityAlert) {
                        const message = errorBody.message || 'A security issue was detected with your request'
                        const resetTime = errorBody.resetTime ? Number(errorBody.resetTime) : undefined
                        globalSecurityAlert(message, resetTime)
                    }
                } catch {
                    // Ignore JSON parse error
                }

                throw new Error(
                    `API request failed: ${response.status} ${response.statusText}\n` +
                    `URL: ${url.toString()}\n` +
                    `Error details: ${JSON.stringify(errorBody, null, 2)}`
                )
            }

            const data = await response.json()
            
            // Cache the response
            cacheManager.set(endpoint, data, params)
            
            // Log the response
            logApiResponse(endpoint, response.status, response.statusText, duration, {
                count: Array.isArray(data) ? data.length : undefined,
                hasData: !!data
            })
            
            return data
        } catch (error) {
            logApiError(endpoint, error)
            throw error
        } finally {
            // Remove from ongoing requests when done (success or failure)
            ongoingRequests.delete(requestKey)
        }
    })()

    // Store the promise for deduplication
    ongoingRequests.set(requestKey, requestPromise)
    
    return requestPromise
}

// Re-export all the API functions but using the client-side wrapper
export interface MatchFilters {
    game?: string
    status?: string
    page?: number
    per_page?: number
    sort?: string
    since?: string
    until?: string
}

export interface TeamFilters {
    page?: number
    per_page?: number
    search?: string
}

export interface TournamentFilters {
    game?: string
    page?: number
    per_page?: number
    since?: string
    until?: string
}

export interface PlayerFilters {
    page?: number
    per_page?: number
    search?: string
}

export const getMatches = async (filters?: MatchFilters) => {
    const params: Record<string, string> = {}

    if (filters?.game && filters.game !== 'all') {
        params['game'] = filters.game
    }

    if (filters?.status && filters.status !== 'all') {
        params['status'] = filters.status
    }

    if (filters?.page) {
        params['page'] = filters.page.toString()
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString()
    }

    if (filters?.sort) {
        params['sort'] = filters.sort
    }

    if (filters?.since) {
        params['since'] = filters.since
    }

    if (filters?.until) {
        params['until'] = filters.until
    }

    return clientRequest('/api/matches', params)
}

export const getTournaments = async (filters?: TournamentFilters) => {
    const params: Record<string, string> = {}

    if (filters?.game && filters.game !== 'all') {
        params['game'] = filters.game
    }

    if (filters?.page) {
        params['page'] = filters.page.toString()
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString()
    }

    if (filters?.since) {
        params['since'] = filters.since
    }

    if (filters?.until) {
        params['until'] = filters.until
    }

    return clientRequest('/api/tournaments', params)
}

export const getTeams = async (filters?: TeamFilters) => {
    const params: Record<string, string> = {}

    if (filters?.page) {
        params['page'] = filters.page.toString()
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString()
    }

    if (filters?.search) {
        params['search'] = filters.search
    }

    return clientRequest('/api/teams', params)
}

export const getPlayers = async (filters?: PlayerFilters) => {
    const params: Record<string, string> = {}

    if (filters?.page) {
        params['page'] = filters.page.toString()
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString()
    }

    if (filters?.search) {
        params['search'] = filters.search
    }

    return clientRequest('/api/players', params)
}

export const getGames = async () => {
    return clientRequest('/api/games')
}

export const getMatchDetails = async (matchId: string | number) => {
    return clientRequest(`/api/matches/${matchId}`)
}

export const getUpcomingTournaments = async (filters?: { page?: number; per_page?: number }) => {
    const params: Record<string, string> = {}

    if (filters?.page) {
        params['page'] = filters.page.toString()
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString()
    }

    return clientRequest('/api/tournaments/upcoming', params)
}

export const getRunningTournaments = async (filters?: { page?: number; per_page?: number }) => {
    const params: Record<string, string> = {}

    if (filters?.page) {
        params['page'] = filters.page.toString()
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString()
    }

    return clientRequest('/api/tournaments/running', params)
}

export const getPastTournaments = async (filters?: { page?: number; per_page?: number }) => {
    const params: Record<string, string> = {}

    if (filters?.page) {
        params['page'] = filters.page.toString()
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString()
    }

    return clientRequest('/api/tournaments/past', params)
}

// Custom request for POST operations like analyze-match
export const analyzeMatch = async (match: unknown) => {
    return clientRequest('/api/analyze-match', undefined, {
        method: 'POST',
        body: JSON.stringify({ match })
    })
} 
