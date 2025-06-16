import { NextRequest, NextResponse } from 'next/server';
import { getPlayerMatches } from '@/lib/pandaScore';

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
        const { searchParams } = new URL(request.url);
        
        if (!playerId) {
            return NextResponse.json(
                { error: 'Player ID is required' },
                { status: 400 }
            );
        }

        const filters = {
            per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
        };

        const matches = await getPlayerMatches(playerId, filters);
        return NextResponse.json(matches);
    } catch (error) {
        console.error('Error fetching player matches:', error);
        return NextResponse.json(
            { error: 'Failed to fetch player matches' },
            { status: 500 }
        );
    }
} 
