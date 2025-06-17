import { NextRequest, NextResponse } from 'next/server'
import { getPlayerTournaments } from '@/lib/pandaScore'

type Props = {
    params: Promise<{
        playerId: string
    }>
}

export async function GET(
    request: NextRequest,
    { params }: Props
) {
    try {
        const { playerId } = await params
        
        if (!playerId) {
            return NextResponse.json(
                { error: 'Player ID is required' },
                { status: 400 }
            )
        }

        const tournaments = await getPlayerTournaments(playerId)
        
        return NextResponse.json(tournaments)
    } catch (error) {
        console.error('Error fetching player tournaments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch player tournaments' },
            { status: 500 }
        )
    }
} 