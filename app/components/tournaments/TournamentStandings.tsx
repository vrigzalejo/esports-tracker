'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { TournamentStanding } from '@/types/esports';

interface TournamentStandingsProps {
    tournamentId: number;
    tournamentName: string;
    teamIds?: number[]; // Add team IDs to filter standings
}

export default function TournamentStandings({ tournamentId, tournamentName, teamIds = [] }: TournamentStandingsProps) {
    const router = useRouter();

    const handleTeamClick = (teamId: number) => {
        router.push(`/teams/${teamId}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent, teamId: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTeamClick(teamId);
        }
    };
    const [standings, setStandings] = useState<TournamentStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Memoize teamIds to prevent unnecessary re-renders
    const teamIdsString = JSON.stringify(teamIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedTeamIds = useMemo(() => teamIds, [teamIdsString]);

    const fetchStandings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`/api/tournaments/${tournamentId}/standings`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch tournament standings');
            }
            
            const data = await response.json();
            
            // Sort all standings by rank first
            const sortedData = data.sort((a: TournamentStanding, b: TournamentStanding) => {
                const rankA = a.rank || 999;
                const rankB = b.rank || 999;
                return rankA - rankB;
            });
            
            // If we have specific team IDs to highlight, take the top 8 but prioritize relevant teams
            let filteredStandings: TournamentStanding[];
            
            if (memoizedTeamIds.length > 0) {
                // Get all relevant teams regardless of rank
                const relevantStandings = sortedData.filter((standing: TournamentStanding) => 
                    memoizedTeamIds.includes(standing.team.id)
                );
                
                // Get other teams to fill remaining slots
                const otherStandings = sortedData.filter((standing: TournamentStanding) => 
                    !memoizedTeamIds.includes(standing.team.id)
                );
                
                // Combine but maintain overall rank order by sorting the final result
                const combined = [
                    ...relevantStandings,
                    ...otherStandings.slice(0, Math.max(0, 8 - relevantStandings.length))
                ];
                
                // Sort the final result by rank to maintain proper order
                filteredStandings = combined.sort((a: TournamentStanding, b: TournamentStanding) => {
                    const rankA = a.rank || 999;
                    const rankB = b.rank || 999;
                    return rankA - rankB;
                });
            } else {
                // No specific teams to highlight, just take top 8 by rank
                filteredStandings = sortedData.slice(0, 8);
            }
            
            setStandings(filteredStandings);
        } catch (err) {
            console.error('Error fetching tournament standings:', err);
            setError(err instanceof Error ? err.message : 'Failed to load standings');
        } finally {
            setLoading(false);
        }
    }, [tournamentId, memoizedTeamIds]);

    useEffect(() => {
        if (tournamentId) {
            fetchStandings();
        }
    }, [tournamentId, fetchStandings]);

    if (loading) {
        return (
            <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Tournament Standings - {tournamentName}
                </h3>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-12 bg-gray-600 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return null;
    }

    if (standings.length === 0) {
        return (
            <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Tournament Standings - {tournamentName}
                </h3>
                <div className="text-gray-400 text-sm">
                    No standings available
                </div>
            </div>
        );
    }

    // Check if we have meaningful W/L data
    const hasWinLossData = standings.some(standing => 
        (standing.wins > 0 || standing.losses > 0) && 
        standing.wins !== undefined && 
        standing.losses !== undefined
    );

    return (
        <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
                Tournament Standings - {tournamentName}
            </h3>
            <div className="space-y-2">
                {/* Header */}
                <div className={`grid gap-2 text-xs font-medium text-gray-400 pb-2 border-b border-gray-600 ${
                    hasWinLossData ? 'grid-cols-4' : 'grid-cols-2'
                }`}>
                    <div className={hasWinLossData ? 'col-span-2' : 'col-span-1'}>Team</div>
                    {hasWinLossData && (
                        <>
                            <div className="text-center">W</div>
                            <div className="text-center">L</div>
                        </>
                    )}
                    {!hasWinLossData && <div className="text-center">Rank</div>}
                </div>
                
                {/* Standings */}
                {standings.map((standing, index) => {
                    const isRelevantTeam = memoizedTeamIds.includes(standing.team.id);
                    return (
                        <div
                            key={standing.team.id}
                            onClick={() => handleTeamClick(standing.team.id)}
                            onKeyDown={(e) => handleKeyDown(e, standing.team.id)}
                            tabIndex={0}
                            role="button"
                            aria-label={`View details for ${standing.team.name}`}
                            className={`grid gap-2 items-center py-2 rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                                hasWinLossData ? 'grid-cols-4' : 'grid-cols-2'
                            } ${
                                isRelevantTeam 
                                    ? 'bg-blue-900/30 border border-blue-500/30 hover:bg-blue-800/40 hover:border-purple-500/50' 
                                    : 'hover:bg-gray-600 hover:bg-purple-900/20'
                            }`}
                        >
                            <div className={`flex items-center space-x-3 ${
                                hasWinLossData ? 'col-span-2' : 'col-span-1'
                            }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    standing.rank <= 3 ? 'bg-yellow-500 text-black' : 
                                    isRelevantTeam ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                                }`}>
                                    {standing.rank || index + 1}
                                </div>
                                {standing.team.image_url && (
                                    <div className="relative w-6 h-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-gray-600/40 shadow-lg overflow-hidden backdrop-blur-sm">
                                        <Image 
                                            src={standing.team.image_url} 
                                            alt={standing.team.name}
                                            fill
                                            className="object-contain p-0.5"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement
                                                target.src = '/images/placeholder-team.svg'
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className={`text-sm font-medium truncate ${
                                        isRelevantTeam ? 'text-blue-300' : 'text-white'
                                    }`}>
                                        {standing.team.acronym || standing.team.name}
                                    </div>
                                </div>
                            </div>
                            {hasWinLossData && (
                                <>
                                    <div className="text-center text-green-400 text-sm font-medium">
                                        {standing.wins}
                                    </div>
                                    <div className="text-center text-red-400 text-sm font-medium">
                                        {standing.losses}
                                    </div>
                                </>
                            )}
                            {!hasWinLossData && (
                                <div className="text-center text-gray-300 text-sm font-medium">
                                    #{standing.rank || index + 1}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 
