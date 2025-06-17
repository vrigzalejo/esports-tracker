import { NextRequest, NextResponse } from 'next/server'
import { logApiRequest, logApiResponse, logApiError } from '@/lib/utils'

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

        // Fetch matches for the specific team
        const apiUrl = `https://api.pandascore.co/teams/${teamId}/matches?token=${token}`
        logApiRequest(`/teams/${teamId}/matches`, apiUrl, 'GET')

        const startTime = Date.now()
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 300 } // Cache for 5 minutes
        })
        const duration = Date.now() - startTime

        if (!response.ok) {
            logApiError(`/teams/${teamId}/matches`, `${response.status} ${response.statusText}`, {
                status: response.status,
                statusText: response.statusText
            })
            return NextResponse.json(
                { error: 'Failed to fetch matches data' },
                { status: response.status }
            )
        }

        const matches = await response.json()
        logApiResponse(`/teams/${teamId}/matches`, response.status, response.statusText, duration, {
            count: matches.length
        })

        // Transform the data to match our interface
        const transformedMatches = matches.map((match: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
            league: match.league ? {
                id: match.league.id,
                name: match.league.name,
                image_url: match.league.image_url,
                slug: match.league.slug,
                url: match.league.url
            } : null,
            serie: match.serie ? {
                id: match.serie.id,
                name: match.serie.name,
                full_name: match.serie.full_name,
                slug: match.serie.slug,
                year: match.serie.year,
                begin_at: match.serie.begin_at,
                end_at: match.serie.end_at
            } : null,
            tournament: match.tournament ? {
                id: match.tournament.id,
                name: match.tournament.name,
                tier: match.tournament.tier,
                prizepool: match.tournament.prizepool,
                begin_at: match.tournament.begin_at,
                end_at: match.tournament.end_at
            } : null,
            videogame: match.videogame ? {
                id: match.videogame.id,
                name: match.videogame.name,
                slug: match.videogame.slug
            } : null,
            videogame_version: match.videogame_version ? {
                name: match.videogame_version.name,
                current: match.videogame_version.current
            } : null,
            opponents: match.opponents ? match.opponents.map((opp: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                type: opp.type,
                opponent: {
                    id: opp.opponent?.id || 0,
                    name: opp.opponent?.name || 'TBD',
                    image_url: opp.opponent?.image_url || '',
                    location: opp.opponent?.location || '',
                    slug: opp.opponent?.slug || '',
                    acronym: opp.opponent?.acronym || ''
                }
            })) : [],
            results: match.results ? match.results.map((result: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                team_id: result.team_id,
                score: result.score
            })) : []
        }))

        return NextResponse.json(transformedMatches)

    } catch (error) {
        logApiError(`/teams/${(await params).teamId}/matches`, error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 
