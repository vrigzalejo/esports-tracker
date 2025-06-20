import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getTeams } from '@/lib/pandaScore';
import { getCachedTeams } from '@/lib/cachedApi';
import { performSecurityCheck, createSecurityErrorResponse } from '@/lib/apiSecurity';
import { serverLogger } from '@/lib/logger';
import type { TeamFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
    try {
        // Perform security checks
        const securityCheck = performSecurityCheck(request);
        if (!securityCheck.allowed) {
            return createSecurityErrorResponse(
                securityCheck.error || 'Access denied',
                403,
                securityCheck.resetTime
            );
        }

        const { searchParams } = new URL(request.url);
        const filters: TeamFilters = {
            game: searchParams.get('game') || undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
            per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined,
            search: searchParams.get('search') || undefined,
        };

        // Check for force refresh parameter
        const forceRefresh = searchParams.get('force_refresh') === 'true';
        
        // Use cached teams if no complex filters are applied (game/search filtering needs direct API)
        if (!filters.game && !filters.search) {
            const page = filters.page || 1;
            const teams = await getCachedTeams(page, { forceRefresh });
            return NextResponse.json(teams || []);
        }

        // For complex filters, use direct API call
        const teamsResponse = await getTeams(filters);
        
        // Handle different response formats from teams API
        const teams = teamsResponse && typeof teamsResponse === 'object' && 'data' in teamsResponse 
            ? teamsResponse.data 
            : teamsResponse;
        
        // Return teams data as-is from the API
        return NextResponse.json(teams || []);
    } catch (error) {
        serverLogger.error('Error fetching teams:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
        );
    }
} 
