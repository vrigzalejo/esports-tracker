/**
 * Frontend API client for making requests to the Next.js API routes
 */

const request = async (endpoint: string, params?: Record<string, string>) => {
    const url = new URL(`${window.location.origin}${endpoint}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });
    }

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

        return response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
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
    game?: string;
    page?: number;
    per_page?: number;
}

export interface TournamentFilters {
    game?: string;
    page?: number;
    per_page?: number;
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

    return request('/api/tournaments', params);
}

export const getTeams = async (filters?: TeamFilters) => {
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

    return request('/api/teams', params);
}

export const getGames = async () => {
    return request('/api/games');
}
