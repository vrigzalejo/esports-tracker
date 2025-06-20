import { NextResponse } from 'next/server';
import { getCachedRunningTournaments } from '@/lib/cachedApi';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const per_page = parseInt(searchParams.get('per_page') || '20');
        const forceRefresh = searchParams.get('force_refresh') === 'true';

        // Use cached running tournaments
        const tournaments = await getCachedRunningTournaments(page, per_page, { forceRefresh });
        
        return NextResponse.json(tournaments);
    } catch (error) {
        console.error('Error fetching running tournaments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch running tournaments' },
            { status: 500 }
        );
    }
} 
