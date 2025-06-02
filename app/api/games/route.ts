import { NextResponse } from 'next/server';
import { getGames } from '@/lib/pandaScore';

export async function GET() {
    try {
        const games = await getGames();
        return NextResponse.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    }
} 
