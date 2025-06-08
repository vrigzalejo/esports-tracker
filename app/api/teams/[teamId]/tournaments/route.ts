import { NextRequest, NextResponse } from 'next/server'



interface PandaScoreMatch {
    id: number
    name: string
    status: string
    begin_at: string
    end_at: string | null
    scheduled_at: string
    original_scheduled_at: string
    winner_id: number | null
    winner_type: string
    match_type: string
    number_of_games: number
    detailed_stats: boolean
    draw: boolean
    forfeit: boolean
    rescheduled: boolean
    slug: string
    streams_list: Array<{
        main: boolean
        language: string
        embed_url: string
        official: boolean
        raw_url: string
    }>
    opponents: Array<{
        opponent: {
            id: number
            name: string
            image_url: string
        }
    }>
    results: Array<{
        score: number
        team_id: number
    }>
}



export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params
        const token = process.env.PANDASCORE_TOKEN

        if (!token) {
            return NextResponse.json(
                { error: 'PandaScore API token not configured' },
                { status: 500 }
            )
        }

        // Fetch tournaments for the specific team
        const response = await fetch(
            `https://api.pandascore.co/teams/${teamId}/tournaments?token=${token}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 300 } // Cache for 5 minutes
            }
        )

        if (!response.ok) {
            console.error('PandaScore API error:', response.status, response.statusText)
            return NextResponse.json(
                { error: 'Failed to fetch tournaments data' },
                { status: response.status }
            )
        }

        const tournaments = await response.json()

        // Transform the data to match our interface
        const transformedTournaments = tournaments.map((tournament: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            id: tournament.id,
            name: tournament.name,
            type: tournament.type,
            begin_at: tournament.begin_at,
            end_at: tournament.end_at,
            tier: tournament.tier,
            prizepool: tournament.prizepool,
            winner_id: tournament.winner_id,
            winner_type: tournament.winner_type,
            slug: tournament.slug,
            league: tournament.league ? {
                id: tournament.league.id,
                name: tournament.league.name,
                image_url: tournament.league.image_url,
                slug: tournament.league.slug,
                url: tournament.league.url
            } : null,
            serie: tournament.serie ? {
                id: tournament.serie.id,
                name: tournament.serie.name,
                full_name: tournament.serie.full_name,
                slug: tournament.serie.slug,
                year: tournament.serie.year,
                begin_at: tournament.serie.begin_at,
                end_at: tournament.serie.end_at
            } : null,
            videogame: tournament.videogame ? {
                id: tournament.videogame.id,
                name: tournament.videogame.name,
                slug: tournament.videogame.slug
            } : null,
            matches: tournament.matches ? tournament.matches.map((match: PandaScoreMatch) => ({
                id: match.id,
                name: match.name,
                status: match.status,
                begin_at: match.begin_at,
                end_at: match.end_at,
                scheduled_at: match.scheduled_at,
                original_scheduled_at: match.original_scheduled_at,
                winner_id: match.winner_id,
                winner_type: match.winner_type,
                match_type: match.match_type,
                number_of_games: match.number_of_games,
                detailed_stats: match.detailed_stats,
                draw: match.draw,
                forfeit: match.forfeit,
                rescheduled: match.rescheduled,
                slug: match.slug,
                streams_list: match.streams_list || [],
                opponents: match.opponents || [],
                results: match.results || []
            })) : [],
            teams: tournament.teams ? tournament.teams.map((teamData: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                // Handle both possible structures: direct team object or nested team object
                const team = teamData.team || teamData;
                const players = teamData.players || [];
                
                return {
                    team: {
                        id: team?.id || 0,
                        name: team?.name || 'Unknown Team',
                        acronym: team?.acronym || '',
                        location: team?.location || '',
                        slug: team?.slug || '',
                        image_url: team?.image_url || '',
                        modified_at: team?.modified_at || ''
                    },
                    players: players.map((player: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                        id: player?.id || 0,
                        name: player?.name || 'Unknown Player',
                        slug: player?.slug || '',
                        first_name: player?.first_name || '',
                        last_name: player?.last_name || '',
                        nationality: player?.nationality || '',
                        image_url: player?.image_url || null,
                        role: player?.role || null,
                        age: player?.age || 0,
                        birthday: player?.birthday || null,
                        active: player?.active || false,
                        modified_at: player?.modified_at || ''
                    }))
                };
            }) : [],
            expected_roster: tournament.expected_roster ? tournament.expected_roster.map((rosterEntry: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                team: {
                    id: rosterEntry.team?.id || 0,
                    name: rosterEntry.team?.name || 'Unknown Team',
                    location: rosterEntry.team?.location || '',
                    slug: rosterEntry.team?.slug || '',
                    modified_at: rosterEntry.team?.modified_at || '',
                    acronym: rosterEntry.team?.acronym || '',
                    image_url: rosterEntry.team?.image_url || ''
                },
                players: rosterEntry.players ? rosterEntry.players.map((player: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                    active: player?.active || false,
                    id: player?.id || 0,
                    name: player?.name || 'Unknown Player',
                    role: player?.role || null,
                    slug: player?.slug || '',
                    modified_at: player?.modified_at || '',
                    age: player?.age || 0,
                    birthday: player?.birthday || null,
                    first_name: player?.first_name || '',
                    last_name: player?.last_name || '',
                    nationality: player?.nationality || '',
                    image_url: player?.image_url || null
                })) : []
            })) : []
        }))

        return NextResponse.json(transformedTournaments)

    } catch (error) {
        console.error('Error fetching tournaments:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 
