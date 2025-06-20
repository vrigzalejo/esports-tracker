import { NextResponse } from 'next/server';
import { cacheUtils } from '@/lib/cachedApi';
import { redisCache } from '@/lib/redis';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        const status = cacheUtils.getCacheStatus();
        
        return NextResponse.json({
            redis: {
                connected: status.connected,
                attempted: status.attempted,
                available: status.connected || !status.attempted
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error checking cache status:', error);
        return NextResponse.json(
            { error: 'Failed to check cache status' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        
        let cleared = 0;
        let message = '';
        
        switch (type) {
            case 'games':
                const gamesCleared = await cacheUtils.clearGamesCache();
                cleared = gamesCleared ? 1 : 0;
                message = `Cleared ${cleared} games cache entry`;
                break;
                
            case 'matches':
                cleared = await cacheUtils.clearMatchesCache();
                message = `Cleared ${cleared} matches cache entries`;
                break;
                
            case 'tournaments':
                cleared = await cacheUtils.clearTournamentsCache();
                message = `Cleared ${cleared} tournaments cache entries`;
                break;
                
            case 'teams':
                cleared = await cacheUtils.clearTeamsCache();
                message = `Cleared ${cleared} teams cache entries`;
                break;
                
            case 'players':
                cleared = await cacheUtils.clearPlayersCache();
                message = `Cleared ${cleared} players cache entries`;
                break;
                
            case 'all':
                cleared = await cacheUtils.clearAllCache();
                message = `Cleared ${cleared} total cache entries`;
                break;
                
            default:
                return NextResponse.json(
                    { error: 'Invalid cache type. Use: games, matches, tournaments, teams, players, or all' },
                    { status: 400 }
                );
        }
        
        logger.info(`Cache cleared: ${message}`);
        
        return NextResponse.json({
            success: true,
            message,
            cleared,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error clearing cache:', error);
        return NextResponse.json(
            { error: 'Failed to clear cache' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action } = body;
        
        if (action === 'disconnect') {
            await redisCache.disconnect();
            logger.info('Redis client disconnected via API');
            
            return NextResponse.json({
                success: true,
                message: 'Redis client disconnected',
                timestamp: new Date().toISOString()
            });
        }
        
        return NextResponse.json(
            { error: 'Invalid action. Use: disconnect' },
            { status: 400 }
        );
        
    } catch (error) {
        logger.error('Error performing cache action:', error);
        return NextResponse.json(
            { error: 'Failed to perform cache action' },
            { status: 500 }
        );
    }
} 
