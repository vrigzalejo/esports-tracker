import { NextRequest, NextResponse } from 'next/server';
import { getPlayers } from '@/lib/pandaScore';
import { getCachedPlayers } from '@/lib/cachedApi';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        const filters = {
            per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
            search: searchParams.get('search') || undefined,
            game: searchParams.get('game') || undefined,
        };

        // Check for force refresh parameter
        const forceRefresh = searchParams.get('force_refresh') === 'true';
        
        // Use cached players if no complex filters are applied (game/search filtering needs direct API)
        if (!filters.game && !filters.search) {
            const page = filters.page || 1;
            const players = await getCachedPlayers(page, { forceRefresh });
            return NextResponse.json(players || []);
        }

        // For complex filters, use direct API call
        const players = await getPlayers(filters);
        return NextResponse.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        return NextResponse.json(
            { error: 'Failed to fetch players' },
            { status: 500 }
        );
    }
} 
