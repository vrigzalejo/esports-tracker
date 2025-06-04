import { NextResponse } from 'next/server';
import { getTournamentStandings } from '@/lib/pandaScore';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json(
                { error: 'Tournament ID is required' },
                { status: 400 }
            );
        }

        const standings = await getTournamentStandings(id);
        return NextResponse.json(standings);
    } catch (error) {
        console.error('Error fetching tournament standings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tournament standings' },
            { status: 500 }
        );
    }
} 
