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

    // Log the request details
    console.log('🚀 PandaScore API Request:', {
        endpoint,
        params,
        fullUrl: url.toString()
    });

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

        // Log response status
        console.log('📡 PandaScore API Response:', {
            endpoint,
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            let errorBody = null;
            try {
                errorBody = await response.json();
            } catch {
                // Ignore JSON parse error
            }

            console.error('❌ PandaScore API Error:', {
                endpoint,
                status: response.status,
                statusText: response.statusText,
                url: url.toString(),
                errorBody
            });

            throw new Error(
                `API request failed: ${response.status} ${response.statusText}\n` +
                `URL: ${url.toString()}\n` +
                `Error details: ${JSON.stringify(errorBody, null, 2)}`
            );
        }

        const data = await response.json();
        console.log('✅ PandaScore API Success:', {
            endpoint,
            dataLength: Array.isArray(data) ? data.length : 'N/A (not array)',
            hasData: !!data
        });

        return data;
    } catch (error) {
        console.error('💥 PandaScore API Exception:', {
            endpoint,
            error: error instanceof Error ? error.message : error,
            params
        });
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

    // Don't use game filtering in API call - will be handled client-side
    // The tournaments endpoint doesn't support videogame filtering

    // Always fetch more data since we'll be filtering client-side
    // Use a larger per_page to get more tournaments for filtering
    const perPage = filters?.per_page || 50;
    params['per_page'] = Math.max(perPage * 3, 100).toString(); // Get 3x more data for filtering

    // Don't use page parameter when game filtering - we need all data for client-side filtering
    if (!filters?.game || filters.game === 'all') {
        if (filters?.page) {
            params['page'] = filters.page.toString();
        }
    }

    // Add date filtering for tournaments
    if (filters?.since || filters?.until) {
        const today = formatDateForApi(new Date());
        const farFuture = '2030-12-31';
        const start = filters?.since ? formatDateForApi(filters.since) : today;
        const end = filters?.until ? formatDateForApi(filters.until) : farFuture;
        params['range[begin_at]'] = `${start},${end}`;
        params['sort'] = 'begin_at'; // Sort by begin date ascending (earliest first)
    }

    // Include teams data in the response
    params['include'] = 'teams';

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

    if (filters?.search) {
        params['search[name]'] = filters.search;
    }

    // Include current videogame data
    params['include'] = 'current_videogame';

    return request('/teams', params);
}

export const getGames = async () => {
    return request('/videogames');
}

export const getTournamentRosters = async (tournamentId: string) => {
    return request(`/tournaments/${tournamentId}/rosters`);
}

export const getTeamMatches = async (teamId: string | number) => {
    return request(`/teams/${teamId}/matches`);
}

export const getTournamentStandings = async (tournamentId: string | number) => {
    return request(`/tournaments/${tournamentId}/standings`);
}

export const getTournamentMatches = async (tournamentId: string | number) => {
    return request(`/tournaments/${tournamentId}/matches`);
}

export const getMatchDetails = async (matchId: string | number) => {
    return request(`/matches/${matchId}`);
}

// Player endpoints
export const getPlayers = async (filters?: { per_page?: number; page?: number; search?: string; game?: string }) => {
    const params: Record<string, string> = {};
    
    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }
    
    if (filters?.page) {
        params['page'] = filters.page.toString();
    }
    
    if (filters?.search) {
        params['search[name]'] = filters.search;
    }
    
    // Include current team data with image_url
    params['include'] = 'current_team';
    
    return request('/players', params);
}

export const getPlayer = async (playerId: string | number) => {
    const params: Record<string, string> = {};
    
    // Include current team data with image_url
    params['include'] = 'current_team';
    
    return request(`/players/${playerId}`, params);
}

export const getPlayerMatches = async (playerId: string | number, filters?: { per_page?: number; page?: number }) => {
    const params: Record<string, string> = {};

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    return request(`/players/${playerId}/matches`, params);
}

export const getPlayerTournaments = async (playerId: string | number, filters?: { per_page?: number; page?: number }) => {
    const params: Record<string, string> = {};

    if (filters?.per_page) {
        params['per_page'] = filters.per_page.toString();
    }

    if (filters?.page) {
        params['page'] = filters.page.toString();
    }

    return request(`/players/${playerId}/tournaments`, params);
}
