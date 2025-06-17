import { NextResponse } from 'next/server';
import { getTeams } from '@/lib/pandaScore';
import type { TeamFilters } from '@/lib/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters: TeamFilters = {
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
            per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined,
            search: searchParams.get('search') || undefined
        };

        // Get teams data directly from the teams endpoint
        const teamsResponse = await getTeams(filters);
        
        // Handle different response formats from teams API
        const teams = teamsResponse && typeof teamsResponse === 'object' && 'data' in teamsResponse 
            ? teamsResponse.data 
            : teamsResponse;
        
        // Return teams data as-is from the API
        return NextResponse.json(teams || []);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
        );
    }
} 
