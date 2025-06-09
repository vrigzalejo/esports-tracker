import { NextResponse } from 'next/server';
import { getTournamentMatches } from '@/lib/pandaScore';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ tournamentId: string }> }
) {
    try {
        const { tournamentId } = await params;
        
        if (!tournamentId) {
            return NextResponse.json(
                { error: 'Tournament ID is required' },
                { status: 400 }
            );
        }

        const matches = await getTournamentMatches(tournamentId);
        return NextResponse.json(matches);
    } catch (error) {
        console.error('Error fetching tournament matches:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tournament matches' },
            { status: 500 }
        );
    }
} 
