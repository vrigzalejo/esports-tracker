export interface Match {
    id: number
    name: string
    status: 'running' | 'finished' | 'not_started' | 'completed'
    begin_at: string
    scheduled_at: string
    end_at?: string
    number_of_games: number
    winner_id?: number
    results: Array<{
        score: number
    }>
    streams_list?: Array<{
        raw_url?: string
        embed_url?: string
        url?: string
        platform?: string
        language?: string
        official?: boolean
        live?: boolean
    }>
    league: {
        name: string
        image_url: string
        region?: string
        tier?: string
        streams?: Array<{
            raw_url?: string
            embed_url?: string
            url?: string
        }>
    }
    serie: {
        name: string
        full_name?: string
        region?: string
        tier?: string
    }
    tournament: {
        id: number
        name: string
        region?: string
        tier?: string
        streams?: Array<{
            raw_url?: string
            embed_url?: string
            url?: string
        }>
    }
    opponents: Array<{
        opponent: {
            id: number
            name: string
            image_url: string
        }
    }>
    videogame: {
        name: string
        slug: string
    }
    region?: string
}
  
export interface Tournament {
    id: number
    name: string
    begin_at: string
    end_at: string
    prizepool: string
    tier?: string
    league: {
      name: string
      image_url: string
      region?: string
    }
    serie?: {
      id: number
      name: string
      full_name?: string
      slug: string
      year?: number
    }
    videogame: {
      name: string
      slug: string
    }
    region?: string
    country?: string
    teams?: Array<{
      id: number
      name: string
      acronym?: string
      image_url?: string
      location?: string
    }>
}
  
export interface Team {
    id: number
    name: string
    image_url: string
    acronym: string
    location: string
    matches_played?: number
    matches_won?: number
    matches_lost?: number
    matches_draw?: number
    current_streak?: number
    win_rate?: number
    rating?: number
}
  
export interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>
    title: string
    value: string
    subtitle?: string
    trend?: string
}

export type TabType = 'matches' | 'tournaments' | 'teams' | 'stats'

export interface TeamMatch {
    id: number
    name: string
    status: 'running' | 'finished' | 'not_started' | 'completed'
    begin_at: string
    scheduled_at: string
    end_at?: string
    number_of_games: number
    match_type: string
    winner_id?: number
    results: Array<{
        score: number
        team_id: number
    }>
    opponents: Array<{
        opponent: {
            id: number
            name: string
            acronym: string
            image_url?: string
            location: string
        }
        type: string
    }>
    league: {
        id: number
        name: string
        image_url?: string
        slug: string
    }
    serie: {
        id: number
        name: string
        full_name: string
        slug: string
        year: number
    }
    tournament: {
        id: number
        name: string
        slug: string
        tier: string
        type: string
        region: string
    }
    videogame: {
        id: number
        name: string
        slug: string
    }
    games: Array<{
        id: number
        position: number
        status: string
        winner?: {
            id?: number
            type: string
        }
        finished: boolean
        forfeit: boolean
    }>
}

export interface TournamentStanding {
    rank: number
    team: {
        id: number
        name: string
        acronym: string
        image_url?: string
        location: string
    }
    wins: number
    losses: number
    draws: number
    points: number
    matches_played: number
    win_rate: number
}

export interface TournamentMatch {
    id: number
    name: string
    status: 'running' | 'finished' | 'not_started' | 'completed'
    begin_at: string
    scheduled_at: string
    end_at?: string
    number_of_games: number
    match_type: string
    winner_id?: number
    results: Array<{
        score: number
        team_id: number
    }>
    opponents: Array<{
        opponent: {
            id: number
            name: string
            acronym: string
            image_url?: string
            location: string
        }
        type: string
    }>
    league: {
        id: number
        name: string
        image_url?: string
        slug: string
    }
    serie: {
        id: number
        name: string
        full_name: string
        slug: string
        year: number
    }
    tournament: {
        id: number
        name: string
        slug: string
        tier: string
        type: string
        region: string
    }
    videogame: {
        id: number
        name: string
        slug: string
    }
}
