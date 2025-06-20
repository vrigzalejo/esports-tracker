import { NextResponse } from 'next/server';
import { getCachedHomeData } from '@/lib/cachedApi';
import { logger } from '@/lib/logger';
import type { Match, Tournament } from '@/types/esports';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('force_refresh') === 'true';

        logger.debug('Fetching home page data...');

        // Fetch cached home page data
        const homeData = await getCachedHomeData({ forceRefresh });
        const { matches, tournaments, teams } = homeData;

        // Calculate statistics
        const stats = {
            liveMatches: matches?.filter((match: Match) => match.status === 'running').length || 0,
            upcomingMatches: matches?.filter((match: Match) => match.status === 'not_started').length || 0,
            totalActiveMatches: (matches?.filter((match: Match) => match.status === 'running' || match.status === 'not_started').length || 0),
            activeTournaments: tournaments?.filter((tournament: Tournament) => tournament.status !== 'finished').length || 0,
            featuredTeams: teams?.length || 0,
            samplePrizePool: tournaments?.reduce((total: number, tournament: Tournament) => {
                if (!tournament.prizepool) return total;
                
                // Handle different currency formats and extract numeric value
                let prizepool = tournament.prizepool.toLowerCase();
                let multiplier = 1;
                
                // Check for K/M suffixes
                if (prizepool.includes('k') && !prizepool.includes('m')) {
                    multiplier = 1000;
                    prizepool = prizepool.replace(/k/g, '');
                } else if (prizepool.includes('m')) {
                    multiplier = 1000000;
                    prizepool = prizepool.replace(/m/g, '');
                }
                
                // Extract numeric value (remove currency symbols and text)
                const numericValue = parseFloat(prizepool.replace(/[^0-9.]/g, ''));
                
                if (isNaN(numericValue)) return total;
                
                return total + (numericValue * multiplier);
            }, 0) || 0
        };

        // Get recent matches for the featured matches section
        const recentMatches = matches?.slice(0, 10) || [];

        const responseData = {
            stats,
            recentMatches,
            dataCount: {
                matches: matches?.length || 0,
                tournaments: tournaments?.length || 0,
                teams: teams?.length || 0
            },
            timestamp: new Date().toISOString()
        };

        logger.debug('Home page data fetched successfully', {
            matchesCount: matches?.length,
            tournamentsCount: tournaments?.length,
            teamsCount: teams?.length,
            stats
        });

        return NextResponse.json(responseData);
    } catch (error) {
        logger.error('Error fetching home page data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch home page data' },
            { status: 500 }
        );
    }
} 