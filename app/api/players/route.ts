import { NextRequest, NextResponse } from 'next/server';
import { getPlayers } from '@/lib/pandaScore';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        const filters = {
            per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
            search: searchParams.get('search') || undefined,
            game: searchParams.get('game') || undefined,
        };

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
