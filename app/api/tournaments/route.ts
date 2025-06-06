import { NextResponse } from 'next/server';
import { getTournaments } from '@/lib/pandaScore';
import type { TournamentFilters } from '@/lib/types';
import type { Tournament } from '@/types/esports';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters: TournamentFilters = {
            game: searchParams.get('game') || undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
            per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined,
            since: searchParams.get('since') || undefined,
            until: searchParams.get('until') || undefined
        };

        const tournaments = await getTournaments(filters);
        
        // Handle client-side filtering and pagination
        let filteredTournaments = tournaments;
        
        // Filter by game if specified
        if (filters.game && filters.game !== 'all') {
            filteredTournaments = tournaments.filter((tournament: Tournament) => 
                tournament.videogame?.slug === filters.game
            );
        }
        
        // Handle client-side pagination when game filtering is applied
        if (filters.game && filters.game !== 'all') {
            const page = filters.page || 1;
            const perPage = filters.per_page || 20;
            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            
            const paginatedTournaments = filteredTournaments.slice(startIndex, endIndex);
            
            // Return paginated response with metadata
            return NextResponse.json({
                data: paginatedTournaments,
                pagination: {
                    current_page: page,
                    per_page: perPage,
                    total: filteredTournaments.length,
                    total_pages: Math.ceil(filteredTournaments.length / perPage)
                }
            });
        }
        
        // For non-filtered requests, return as-is (API handles pagination)
        return NextResponse.json(tournaments);
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tournaments' },
            { status: 500 }
        );
    }
} 
