import { NextResponse } from 'next/server';
import { getMatches } from '@/lib/pandaScore';
import type { MatchFilters } from '@/lib/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters: MatchFilters = {
            game: searchParams.get('game') || undefined,
            status: searchParams.get('status') || undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
            per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined,
            sort: searchParams.get('sort') || undefined,
            since: searchParams.get('since') || undefined,
            until: searchParams.get('until') || undefined
        };

        const matches = await getMatches(filters);
        return NextResponse.json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json(
            { error: 'Failed to fetch matches' },
            { status: 500 }
        );
    }
} 
