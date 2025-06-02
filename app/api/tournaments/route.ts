import { NextResponse } from 'next/server';
import { getTournaments } from '@/lib/pandaScore';
import type { TournamentFilters } from '@/lib/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters: TournamentFilters = {
            game: searchParams.get('game') || undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
            per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined
        };

        const tournaments = await getTournaments(filters);
        return NextResponse.json(tournaments);
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tournaments' },
            { status: 500 }
        );
    }
} 
