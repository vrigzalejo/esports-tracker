import type { Match, Tournament, Team } from '@/types/esports'

export const mockMatches: Match[] = [
  {
    id: 1,
    name: "Team Liquid vs Fnatic",
    status: "running",
    begin_at: "2025-05-30T18:00:00Z",
    tournament: {
      name: "LEC Summer Split",
      league: {
        name: "League of Legends European Championship",
        image_url: "/api/placeholder/40/40"
      }
    },
    opponents: [
      {
        opponent: {
          name: "Team Liquid",
          image_url: "/api/placeholder/40/40"
        }
      },
      {
        opponent: {
          name: "Fnatic",
          image_url: "/api/placeholder/40/40"
        }
      }
    ],
    games: [],
    videogame: {
      name: "League of Legends",
      slug: "lol"
    }
  },
  {
    id: 2,
    name: "G2 Esports vs MAD Lions",
    status: "finished",
    begin_at: "2025-05-30T16:00:00Z",
    tournament: {
      name: "LEC Summer Split",
      league: {
        name: "League of Legends European Championship",
        image_url: "/api/placeholder/40/40"
      }
    },
    opponents: [
      {
        opponent: {
          name: "G2 Esports",
          image_url: "/api/placeholder/40/40"
        }
      },
      {
        opponent: {
          name: "MAD Lions",
          image_url: "/api/placeholder/40/40"
        }
      }
    ],
    games: [{ winner: { id: 1 } }],
    videogame: {
      name: "League of Legends",
      slug: "lol"
    }
  },
  {
    id: 3,
    name: "FaZe Clan vs NAVI",
    status: "not_started",
    begin_at: "2025-05-30T20:00:00Z",
    tournament: {
      name: "IEM Cologne",
      league: {
        name: "Intel Extreme Masters",
        image_url: "/api/placeholder/40/40"
      }
    },
    opponents: [
      {
        opponent: {
          name: "FaZe Clan",
          image_url: "/api/placeholder/40/40"
        }
      },
      {
        opponent: {
          name: "NAVI",
          image_url: "/api/placeholder/40/40"
        }
      }
    ],
    games: [],
    videogame: {
      name: "Counter-Strike 2",
      slug: "cs2"
    }
  }
]

export const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: "The International 2025",
    begin_at: "2025-10-15T00:00:00Z",
    end_at: "2025-10-30T00:00:00Z",
    prize_pool: "$40,000,000",
    league: {
      name: "The International",
      image_url: "/api/placeholder/50/50"
    },
    videogame: {
      name: "Dota 2"
    }
  },
  {
    id: 2,
    name: "Worlds 2025",
    begin_at: "2025-09-25T00:00:00Z",
    end_at: "2025-11-05T00:00:00Z",
    prize_pool: "$5,000,000",
    league: {
      name: "League of Legends World Championship",
      image_url: "/api/placeholder/50/50"
    },
    videogame: {
      name: "League of Legends"
    }
  },
  {
    id: 3,
    name: "PGL Major Copenhagen 2025",
    begin_at: "2025-08-01T00:00:00Z",
    end_at: "2025-08-15T00:00:00Z",
    prize_pool: "$1,250,000",
    league: {
      name: "PGL Major",
      image_url: "/api/placeholder/50/50"
    },
    videogame: {
      name: "Counter-Strike 2"
    }
  }
]

export const mockTeams: Team[] = [
  {
    id: 1,
    name: "Team Liquid",
    image_url: "/api/placeholder/60/60",
    acronym: "TL",
    location: "Netherlands"
  },
  {
    id: 2,
    name: "Fnatic",
    image_url: "/api/placeholder/60/60",
    acronym: "FNC",
    location: "United Kingdom"
  },
  {
    id: 3,
    name: "G2 Esports",
    image_url: "/api/placeholder/60/60",
    acronym: "G2",
    location: "Germany"
  },
  {
    id: 4,
    name: "FaZe Clan",
    image_url: "/api/placeholder/60/60",
    acronym: "FAZE",
    location: "United States"
  }
]
