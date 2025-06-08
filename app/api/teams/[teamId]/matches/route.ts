import { NextRequest, NextResponse } from 'next/server'

const PANDASCORE_TOKEN = process.env.PANDASCORE_TOKEN

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    if (!PANDASCORE_TOKEN) {
        return NextResponse.json(
            { error: 'API token not configured' },
            { status: 500 }
        )
    }

    try {
        const { teamId } = await params
        const teamIdNum = parseInt(teamId)
        console.log('Fetching matches for team ID:', teamIdNum)

        // Try to fetch team matches from the matches endpoint
        try {
            const response = await fetch(
                `https://api.pandascore.co/matches?filter[opponent_id]=${teamIdNum}&sort=-begin_at&per_page=20&token=${PANDASCORE_TOKEN}`,
                {
                    headers: {
                        'Accept': 'application/json',
                    },
                    next: { revalidate: 300 }
                }
            )

            console.log('Matches API response status:', response.status)

            if (response.ok) {
                const matches = await response.json()
                console.log('Found', matches.length, 'matches for team')
                return NextResponse.json(matches)
            }
        } catch (matchesError) {
            console.log('Matches API failed:', matchesError)
        }

        // Fallback: return empty array if no matches found
        console.log('No matches found, returning empty array')
        return NextResponse.json([])

    } catch (error) {
        console.error('Error fetching team matches:', error)
        return NextResponse.json(
            { error: 'Failed to fetch team matches' },
            { status: 500 }
        )
    }
} 
