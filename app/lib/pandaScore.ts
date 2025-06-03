import type { MatchFilters, TeamFilters, TournamentFilters } from './types';

const BASE_URL = 'https://api.pandascore.co';

function formatDateForApi(date: string | Date): string {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toISOString().split('T')[0];
}

const request = async (endpoint: string, params?: Record<string, string>) => {
    const url = new URL(`${BASE_URL}${endpoint}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });
    }

    // Add API token
    url.searchParams.append('token', process.env.PANDASCORE_TOKEN || '');

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            signal: controller.signal,
            next: { revalidate: 60 } // Cache for 60 seconds
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
}

export const getMatches = async (filters?: MatchFilters) => {
    const params: Record<string, string> = {};

    if (filters?.game && filters.game !== 'all') {
        params['filter[videogame]'] = filters.game;
    }

    if (filters?.status && filters.status !== 'all') {
        switch (filters.status) {
            case 'running':
                params['filter[status]'] = 'running';
                break;
            case 'finished':
                params['filter[status]'] = 'finished';
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                params['range[begin_at]'] = `${formatDateForApi(thirtyDaysAgo)},${formatDateForApi(new Date())}`;
                break;
            case 'not_started':
                params['filter[status]'] = 'not_started,postponed';
                const today = formatDateForApi(new Date());
                const farFuture = '2030-12-31';
                params['range[begin_at]'] = `${today},${farFuture}`;
                break;
        }
    } else {
        const today = formatDateForApi(new Date());
        const farFuture = '2030-12-31';
        const start = filters?.since ? formatDateForApi(filters.since) : today;
        const end = filters?.until ? formatDateForApi(filters.until) : farFuture;
        params['range[begin_at]'] = `${start},${end}`;
    }

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    params['sort'] = filters?.sort || '-begin_at';

    return request('/matches', params);
}

export const getTournaments = async (filters?: TournamentFilters) => {
    const params: Record<string, string> = {};

    if (filters?.game && filters.game !== 'all') {
        params['filter[videogame]'] = filters.game;
    }

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    return request('/tournaments', params);
}

export const getTeams = async (filters?: TeamFilters) => {
    const params: Record<string, string> = {};

    if (filters?.game && filters.game !== 'all') {
        params['filter[videogame]'] = filters.game;
    }

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    return request('/teams', params);
}

export const getGames = async () => {
    return request('/videogames');
}

export const getTournamentRosters = async (tournamentId: string) => {
    return request(`/tournaments/${tournamentId}/rosters`);
}
