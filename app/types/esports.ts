export interface Match {
    id: number
    name: string
    status: 'running' | 'finished' | 'not_started'
    begin_at: string
    scheduled_at: string
    league: {
      name: string
      image_url: string
    }
    opponents: Array<{
      opponent: {
        name: string
        image_url: string
      }
    }>
    games: Array<{
      winner: {
        id: number
      }
    }>
    videogame: {
      name: string
      slug: string
    }
}
  
export interface Tournament {
    id: number
    name: string
    begin_at: string
    end_at: string
    prize_pool: string
    league: {
      name: string
      image_url: string
    }
    videogame: {
      name: string
    }
}
  
export interface Team {
    id: number
    name: string
    image_url: string
    acronym: string
    location: string
}
  
export interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>
    title: string
    value: string
    subtitle?: string
    trend?: string
}

export type TabType = 'matches' | 'tournaments' | 'teams' | 'stats'
