import { NextResponse } from 'next/server';
import { getTeams } from '@/lib/pandaScore';
import type { TeamFilters } from '@/lib/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters: TeamFilters = {
            game: searchParams.get('game') || undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
            per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined
        };

        const teams = await getTeams(filters);
        return NextResponse.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
        );
    }
} 
