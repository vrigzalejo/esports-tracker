'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TournamentStanding } from '@/types/esports';

interface TournamentStandingsProps {
    tournamentId: number;
    tournamentName: string;
    teamIds?: number[]; // Add team IDs to filter standings
}

export default function TournamentStandings({ tournamentId, tournamentName, teamIds = [] }: TournamentStandingsProps) {
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
            
            // Filter standings to show only relevant teams first, then others
            const relevantStandings = data.filter((standing: TournamentStanding) => 
                memoizedTeamIds.includes(standing.team.id)
            );
            const otherStandings = data.filter((standing: TournamentStanding) => 
                !memoizedTeamIds.includes(standing.team.id)
            );
            
            // Show relevant teams first, then top 5 others
            const filteredStandings = [
                ...relevantStandings,
                ...otherStandings.slice(0, Math.max(0, 8 - relevantStandings.length))
            ];
            
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

    return (
        <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
                Tournament Standings - {tournamentName}
            </h3>
            <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-400 pb-2 border-b border-gray-600">
                    <div className="col-span-2">Team</div>
                    <div className="text-center">W</div>
                    <div className="text-center">L</div>
                </div>
                
                {/* Standings */}
                {standings.map((standing, index) => {
                    const isRelevantTeam = memoizedTeamIds.includes(standing.team.id);
                    return (
                        <div
                            key={standing.team.id}
                            className={`grid grid-cols-4 gap-2 items-center py-2 rounded transition-colors ${
                                isRelevantTeam 
                                    ? 'bg-blue-900/30 border border-blue-500/30 hover:bg-blue-800/40' 
                                    : 'hover:bg-gray-600'
                            }`}
                        >
                            <div className="col-span-2 flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    standing.rank <= 3 ? 'bg-yellow-500 text-black' : 
                                    isRelevantTeam ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                                }`}>
                                    {standing.rank || index + 1}
                                </div>
                                {standing.team.image_url && (
                                    <img 
                                        src={standing.team.image_url} 
                                        alt={standing.team.name}
                                        className="w-6 h-6 rounded object-cover"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className={`text-sm font-medium truncate ${
                                        isRelevantTeam ? 'text-blue-300' : 'text-white'
                                    }`}>
                                        {standing.team.acronym || standing.team.name}
                                    </div>
                                </div>
                            </div>
                            <div className="text-center text-green-400 text-sm font-medium">
                                {standing.wins}
                            </div>
                            <div className="text-center text-red-400 text-sm font-medium">
                                {standing.losses}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 