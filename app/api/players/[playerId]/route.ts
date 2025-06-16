import { NextRequest, NextResponse } from 'next/server';
import { getPlayer } from '@/lib/pandaScore';

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
        const { playerId } = await params;
        
        if (!playerId) {
            return NextResponse.json(
                { error: 'Player ID is required' },
                { status: 400 }
            );
        }

        const player = await getPlayer(playerId);
        return NextResponse.json(player);
    } catch (error) {
        console.error('Error fetching player:', error);
        return NextResponse.json(
            { error: 'Failed to fetch player' },
            { status: 500 }
        );
    }
} 
