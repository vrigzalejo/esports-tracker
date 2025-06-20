import { NextResponse } from 'next/server';
import { getCachedGames } from '@/lib/cachedApi';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
    try {
        // Check for force refresh parameter
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';
        
        logger.info(`Fetching games (force refresh: ${forceRefresh})`);
        
        const games = await getCachedGames({ forceRefresh });
        
        // Add cache headers
        const response = NextResponse.json(games);
        
        // Set cache headers for client-side caching (5 minutes)
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        
        return response;
    } catch (error) {
        logger.error('Error fetching games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    }
} 
