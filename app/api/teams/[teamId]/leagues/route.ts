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

        // Fetch leagues for the specific team
        const response = await fetch(
            `https://api.pandascore.co/teams/${teamId}/leagues?token=${token}`,
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
                { error: 'Failed to fetch leagues data' },
                { status: response.status }
            )
        }

        const leagues = await response.json()

        // Transform the data to match our interface
        const transformedLeagues = leagues.map((league: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            id: league?.id || 0,
            name: league?.name || 'Unknown League',
            slug: league?.slug || '',
            image_url: league?.image_url || null,
            url: league?.url || null,
            modified_at: league?.modified_at || '',
            live_supported: league?.live_supported || false,
            videogame: league?.videogame ? {
                id: league.videogame.id || 0,
                name: league.videogame.name || 'Unknown Game',
                slug: league.videogame.slug || ''
            } : null,
            series: league?.series ? league.series.map((serie: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
                winner_type: serie?.winner_type || null
            })) : [],
            tournaments: league?.tournaments ? league.tournaments.map((tournament: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
            })) : []
        }))

        return NextResponse.json(transformedLeagues)

    } catch (error) {
        console.error('Error fetching leagues:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 
