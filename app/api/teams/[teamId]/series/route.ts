import { NextRequest, NextResponse } from 'next/server'

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

        // Fetch series for the specific team
        const response = await fetch(
            `https://api.pandascore.co/teams/${teamId}/series?token=${token}`,
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
                { error: 'Failed to fetch series data' },
                { status: response.status }
            )
        }

        const series = await response.json()

        // Transform the data to match our interface
        const transformedSeries = series.map((serie: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            id: serie?.id || 0,
            name: serie?.name || 'Unknown Serie',
            full_name: serie?.full_name || serie?.name || 'Unknown Serie',
            slug: serie?.slug || '',
            year: serie?.year || null,
            begin_at: serie?.begin_at || null,
            end_at: serie?.end_at || null,
            modified_at: serie?.modified_at || '',
            description: serie?.description || null,
            tier: serie?.tier || null,
            prizepool: serie?.prizepool || null,
            winner_id: serie?.winner_id || null,
            winner_type: serie?.winner_type || null,
            league: serie?.league ? {
                id: serie.league.id || 0,
                name: serie.league.name || 'Unknown League',
                image_url: serie.league.image_url || null,
                slug: serie.league.slug || '',
                url: serie.league.url || null
            } : null,
            videogame: serie?.videogame ? {
                id: serie.videogame.id || 0,
                name: serie.videogame.name || 'Unknown Game',
                slug: serie.videogame.slug || ''
            } : null,
            tournaments: serie?.tournaments ? serie.tournaments.map((tournament: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                id: tournament?.id || 0,
                name: tournament?.name || 'Unknown Tournament',
                slug: tournament?.slug || '',
                tier: tournament?.tier || null,
                begin_at: tournament?.begin_at || null,
                end_at: tournament?.end_at || null,
                prizepool: tournament?.prizepool || null,
                winner_id: tournament?.winner_id || null,
                winner_type: tournament?.winner_type || null,
                modified_at: tournament?.modified_at || ''
            })) : [],
            matches: serie?.matches ? serie.matches.map((match: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                id: match?.id || 0,
                name: match?.name || 'Unknown Match',
                status: match?.status || 'unknown',
                begin_at: match?.begin_at || '',
                end_at: match?.end_at || null,
                winner_id: match?.winner_id || null,
                winner_type: match?.winner_type || null,
                slug: match?.slug || '',
                detailed_stats: match?.detailed_stats || false,
                draw: match?.draw || false,
                forfeit: match?.forfeit || false
            })) : []
        }))

        return NextResponse.json(transformedSeries)

    } catch (error) {
        console.error('Error fetching series:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 