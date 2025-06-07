import { NextResponse } from 'next/server';
import { getTournaments } from '@/lib/pandaScore';
import type { TournamentFilters } from '@/lib/types';
import type { Tournament, Team } from '@/types/esports';

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
        
        const regionFilter = searchParams.get('region');

        // Get tournaments data which includes teams
        const tournamentsResponse = await getTournaments(filters);
        
        // Handle different response formats from tournaments API
        const tournaments = tournamentsResponse && typeof tournamentsResponse === 'object' && 'data' in tournamentsResponse 
            ? tournamentsResponse.data 
            : tournamentsResponse;
        
        // Extract unique teams from tournaments
        const teamsMap = new Map<number, Team>();
        
        tournaments.forEach((tournament: Tournament) => {
            // Extract teams primarily from expected_roster (which has player information)
            if (tournament.expected_roster && Array.isArray(tournament.expected_roster)) {
                tournament.expected_roster.forEach((roster) => {
                    if (roster.team && roster.players) {
                        const teamId = roster.team.id;
                        
                        if (!teamsMap.has(teamId)) {
                            // Create new team entry with players and tournament context
                            teamsMap.set(teamId, {
                                id: roster.team.id,
                                name: roster.team.name,
                                image_url: roster.team.image_url,
                                acronym: roster.team.acronym,
                                location: roster.team.location,
                                players: roster.players.map((player) => ({
                                    id: player.id,
                                    name: player.name,
                                    first_name: player.first_name,
                                    last_name: player.last_name,
                                    nationality: player.nationality,
                                    image_url: player.image_url,
                                    role: player.role,
                                    active: player.active,
                                    slug: player.slug,
                                    modified_at: player.modified_at,
                                    age: player.age,
                                    birthday: player.birthday
                                })),
                                tournaments: [{
                                    id: tournament.id,
                                    name: tournament.name,
                                    begin_at: tournament.begin_at,
                                    end_at: tournament.end_at,
                                    videogame: tournament.videogame,
                                    status: tournament.status,
                                    tier: tournament.tier,
                                    region: tournament.region,
                                    league: tournament.league,
                                    serie: tournament.serie
                                }]
                            });
                        } else {
                            // Add tournament to existing team
                            const existingTeam = teamsMap.get(teamId)!;
                            if (!existingTeam.tournaments) {
                                existingTeam.tournaments = [];
                            }
                            existingTeam.tournaments.push({
                                id: tournament.id,
                                name: tournament.name,
                                begin_at: tournament.begin_at,
                                end_at: tournament.end_at,
                                videogame: tournament.videogame,
                                status: tournament.status,
                                tier: tournament.tier,
                                region: tournament.region,
                                league: tournament.league,
                                serie: tournament.serie
                            });
                        }
                    }
                });
            }

            // Fallback: Extract teams from the teams field only if they're not already in expected_roster
            if (tournament.teams && Array.isArray(tournament.teams)) {
                tournament.teams.forEach((team: Team) => {
                    if (!teamsMap.has(team.id)) {
                        // Add tournament context to team (without players since they're not available here)
                        teamsMap.set(team.id, {
                            ...team,
                            tournaments: [{
                                id: tournament.id,
                                name: tournament.name,
                                begin_at: tournament.begin_at,
                                end_at: tournament.end_at,
                                videogame: tournament.videogame,
                                status: tournament.status,
                                tier: tournament.tier,
                                region: tournament.region,
                                league: tournament.league,
                                serie: tournament.serie
                            }]
                        });
                    } else {
                        // Add tournament to existing team
                        const existingTeam = teamsMap.get(team.id)!;
                        if (!existingTeam.tournaments) {
                            existingTeam.tournaments = [];
                        }
                        existingTeam.tournaments.push({
                            id: tournament.id,
                            name: tournament.name,
                            begin_at: tournament.begin_at,
                            end_at: tournament.end_at,
                            videogame: tournament.videogame,
                            status: tournament.status,
                            tier: tournament.tier,
                            region: tournament.region,
                            league: tournament.league,
                            serie: tournament.serie
                        });
                    }
                });
            }
        });

        let teams = Array.from(teamsMap.values());
        
        // Filter by game if specified
        if (filters.game && filters.game !== 'all') {
            teams = teams.filter((team: Team) => 
                team.tournaments?.some(tournament => 
                    tournament.videogame?.slug === filters.game
                )
            );
        }

        // Filter by region if specified
        if (regionFilter && regionFilter !== 'all') {
            teams = teams.filter((team: Team) => {
                const teamLocation = team.location?.toLowerCase() || '';
                return teamLocation.includes(regionFilter.toLowerCase());
            });
        }

        // Handle client-side pagination when filtering is applied
        if ((filters.game && filters.game !== 'all') || (regionFilter && regionFilter !== 'all')) {
            const page = filters.page || 1;
            const perPage = filters.per_page || 20;
            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            
            const paginatedTeams = teams.slice(startIndex, endIndex);
            
            // Return paginated response with metadata
            return NextResponse.json({
                data: paginatedTeams,
                pagination: {
                    current_page: page,
                    per_page: perPage,
                    total: teams.length,
                    total_pages: Math.ceil(teams.length / perPage)
                }
            });
        }
        
        // For non-filtered requests, return as-is
        return NextResponse.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
        );
    }
} 
