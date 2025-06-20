import { NextResponse } from 'next/server';
import { getCachedUpcomingTournaments } from '@/lib/cachedApi';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const per_page = parseInt(searchParams.get('per_page') || '20');
        const forceRefresh = searchParams.get('force_refresh') === 'true';

        // Use cached upcoming tournaments
        const tournaments = await getCachedUpcomingTournaments(page, per_page, { forceRefresh });
        
        return NextResponse.json(tournaments);
    } catch (error) {
        console.error('Error fetching upcoming tournaments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch upcoming tournaments' },
            { status: 500 }
        );
    }
} 
