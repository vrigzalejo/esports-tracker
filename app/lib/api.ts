/**
 * Frontend API client for making requests to the Next.js API routes
 */

import { cacheManager } from './cache'

// Request deduplication - store ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<unknown>>()

const request = async (endpoint: string, params?: Record<string, string>) => {
    // Create a unique key for this request
    const requestKey = `${endpoint}?${new URLSearchParams(params || {}).toString()}`
    
    // Check cache first
    const cachedData = cacheManager.get(endpoint, params)
    if (cachedData) {
        console.log(`🎯 Cache HIT for ${endpoint}`, params)
        return cachedData
    }
    
    // Check if this exact request is already in progress
    if (ongoingRequests.has(requestKey)) {
        console.log(`🔄 Request DEDUPLICATION for ${endpoint}`, params)
        return ongoingRequests.get(requestKey)
    }
    
    console.log(`🌐 Cache MISS for ${endpoint}, fetching...`, params)

    const url = new URL(`${window.location.origin}${endpoint}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });
    }

    // Create the request promise and store it for deduplication
    const requestPromise = (async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(url.toString(), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorBody = null;
                try {
                    errorBody = await response.json();
                } catch {
                    // Ignore JSON parse error
                }

                throw new Error(
                    `API request failed: ${response.status} ${response.statusText}\n` +
                    `URL: ${url.toString()}\n` +
                    `Error details: ${JSON.stringify(errorBody, null, 2)}`
                );
            }

            const data = await response.json();
            
            // Cache the response
            cacheManager.set(endpoint, data, params)
            console.log(`💾 Cached response for ${endpoint}`, params)
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        } finally {
            // Remove from ongoing requests when done (success or failure)
            ongoingRequests.delete(requestKey)
        }
    })()

    // Store the promise for deduplication
    ongoingRequests.set(requestKey, requestPromise)
    
    return requestPromise
};

export interface MatchFilters {
    game?: string;
    status?: string;
    page?: number;
    per_page?: number;
    sort?: string;
    since?: string;
    until?: string;
}

export interface TeamFilters {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface TournamentFilters {
    game?: string;
    page?: number;
    per_page?: number;
    since?: string;
    until?: string;
}

export interface PlayerFilters {
    page?: number;
    per_page?: number;
    search?: string;
}

export const getMatches = async (filters?: MatchFilters) => {
    const params: Record<string, string> = {};

    if (filters?.game && filters.game !== 'all') {
        params['game'] = filters.game;
    }

    if (filters?.status && filters.status !== 'all') {
        params['status'] = filters.status;
    }

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    if (filters?.sort) {
        params['sort'] = filters.sort;
    }

    if (filters?.since) {
        params['since'] = filters.since;
    }

    if (filters?.until) {
        params['until'] = filters.until;
    }

    return request('/api/matches', params);
}

export const getTournaments = async (filters?: TournamentFilters) => {
    const params: Record<string, string> = {};

    if (filters?.game && filters.game !== 'all') {
        params['game'] = filters.game;
    }

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    if (filters?.since) {
        params['since'] = filters.since;
    }

    if (filters?.until) {
        params['until'] = filters.until;
    }

    return request('/api/tournaments', params);
}

export const getTeams = async (filters?: TeamFilters) => {
    const params: Record<string, string> = {};

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    if (filters?.search) {
        params['search'] = filters.search;
    }

    return request('/api/teams', params);
}

export const getPlayers = async (filters?: PlayerFilters) => {
    const params: Record<string, string> = {};

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    if (filters?.search) {
        params['search'] = filters.search;
    }

    return request('/api/players', params);
}

export const getGames = async () => {
    return request('/api/games');
}

export const getMatchDetails = async (matchId: string | number) => {
    return request(`/api/matches/${matchId}`);
}

// New tournament endpoints for different statuses
export const getUpcomingTournaments = async (filters?: { page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    return request('/api/tournaments/upcoming', params);
}

export const getRunningTournaments = async (filters?: { page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    return request('/api/tournaments/running', params);
}

export const getPastTournaments = async (filters?: { page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    return request('/api/tournaments/past', params);
}
