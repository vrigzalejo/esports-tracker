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

export interface Match {
    id: number;
    name: string;
    status: 'running' | 'finished' | 'not_started' | 'completed';
    begin_at: string;
    scheduled_at: string;
    number_of_games: number;
    winner_id?: number;
    results: Array<{
        score: number;
    }>;
    streams_list?: Array<{
        raw_url?: string;
        embed_url?: string;
        url?: string;
        platform?: string;
        language?: string;
        official?: boolean;
        live?: boolean;
    }>;
    league: {
        name: string;
        image_url: string;
        region?: string;
        tier?: string;
        streams?: Array<{
            raw_url?: string;
            embed_url?: string;
            url?: string;
        }>;
    };
    serie: {
        name: string;
        full_name?: string;
        region?: string;
        tier?: string;
    };
    tournament: {
        name: string;
        region?: string;
        tier?: string;
        streams?: Array<{
            raw_url?: string;
            embed_url?: string;
            url?: string;
        }>;
    };
    opponents: Array<{
        opponent: {
            id: number;
            name: string;
            image_url: string;
        };
    }>;
    videogame: {
        name: string;
        slug: string;
    };
    region?: string;
}

export interface Team {
    id: number;
    name: string;
    image_url: string;
    acronym: string;
    location: string;
    matches_played?: number;
    matches_won?: number;
    matches_lost?: number;
    matches_draw?: number;
    current_streak?: number;
    win_rate?: number;
    rating?: number;
}

export interface Tournament {
    id: number;
    name: string;
    begin_at: string;
    end_at: string;
    league: {
        name: string;
        image_url: string;
    };
    serie: {
        name: string;
        full_name?: string;
    };
    videogame: {
        name: string;
        slug: string;
    };
    teams_count: number;
    matches_count: number;
    status: string;
    prize_pool?: string;
}
