import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getMatches } from '@/lib/pandaScore';
import { performSecurityCheck, createSecurityErrorResponse } from '@/lib/apiSecurity';
import { serverLogger } from '@/lib/logger';
import type { MatchFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
    try {
        // Perform security checks
        const securityCheck = performSecurityCheck(request);
        if (!securityCheck.allowed) {
            return createSecurityErrorResponse(
                securityCheck.error || 'Access denied',
                403
            );
        }

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
        serverLogger.error('Error fetching matches:', error);
        return NextResponse.json(
            { error: 'Failed to fetch matches' },
            { status: 500 }
        );
    }
} 
