import { NextResponse } from 'next/server';
import { getTeamMatches } from '@/lib/pandaScore';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
        
        if (!teamId) {
            return NextResponse.json(
                { error: 'Team ID is required' },
                { status: 400 }
            );
        }

        const matches = await getTeamMatches(teamId);
        return NextResponse.json(matches);
    } catch (error) {
        console.error('Error fetching team matches:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team matches' },
            { status: 500 }
        );
    }
} 
