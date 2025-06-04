'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TournamentMatch } from '@/types/esports';

interface TournamentMatchesProps {
    tournamentId: number;
    tournamentName: string;
    teamIds?: number[]; // Add team IDs to filter matches
    teamNames?: string[]; // Add team names for display
}

export default function TournamentMatches({ tournamentId, tournamentName, teamIds = [], teamNames = [] }: TournamentMatchesProps) {
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Memoize arrays to prevent unnecessary re-renders
    const teamIdsString = JSON.stringify(teamIds);
    const teamNamesString = JSON.stringify(teamNames);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedTeamIds = useMemo(() => teamIds, [teamIdsString]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedTeamNames = useMemo(() => teamNames, [teamNamesString]);

    const fetchMatches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`/api/tournaments/${tournamentId}/matches`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch tournament matches');
            }
            
            const data = await response.json();
            
            // Filter matches to show only those involving the relevant teams
            const relevantMatches = data.filter((match: TournamentMatch) => 
                match.opponents.some(opponent => memoizedTeamIds.includes(opponent.opponent.id))
            );
            
            // Limit to recent 10 matches for display
            setMatches(relevantMatches.slice(0, 10));
        } catch (err) {
            console.error('Error fetching tournament matches:', err);
            setError(err instanceof Error ? err.message : 'Failed to load matches');
        } finally {
            setLoading(false);
        }
    }, [tournamentId, memoizedTeamIds]);

    useEffect(() => {
        if (tournamentId && memoizedTeamIds.length > 0) {
            fetchMatches();
        }
    }, [tournamentId, memoizedTeamIds.length, fetchMatches]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'finished':
                return 'text-green-400';
            case 'running':
                return 'text-yellow-400';
            case 'not_started':
                return 'text-blue-400';
            default:
                return 'text-gray-400';
        }
    };

    const getMatchResult = (match: TournamentMatch, teamId: number) => {
        if (match.status !== 'finished' || !match.results || match.results.length === 0) {
            return null;
        }
        
        const teamResult = match.results.find(result => result.team_id === teamId);
        const opponentResult = match.results.find(result => result.team_id !== teamId);
        
        if (!teamResult || !opponentResult) return null;
        
        if (teamResult.score > opponentResult.score) return 'W';
        if (teamResult.score < opponentResult.score) return 'L';
        return 'D';
    };

    const getTeamMatches = (teamId: number) => {
        return matches.filter(match => 
            match.opponents.some(opponent => opponent.opponent.id === teamId)
        ).slice(0, 5); // Limit to 5 matches per team
    };

    // Don't show anything if no team IDs provided
    if (memoizedTeamIds.length === 0) {
        return null;
    }

    if (loading) {
        return (
            <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Tournament Matches - {tournamentName}
                </h3>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-16 bg-gray-600 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return null;
    }

    if (matches.length === 0) {
        return (
            <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Tournament Matches - {tournamentName}
                </h3>
                <div className="text-gray-400 text-sm">
                    No matches found for these teams
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
                Tournament Matches - {tournamentName}
            </h3>
            <div className="space-y-6">
                {memoizedTeamIds.map((teamId, index) => {
                    const teamMatches = getTeamMatches(teamId);
                    const teamName = memoizedTeamNames[index] || `Team ${index + 1}`;
                    
                    if (teamMatches.length === 0) return null;
                    
                    return (
                        <div key={teamId} className="space-y-3">
                            <h4 className="text-md font-semibold text-blue-300 border-b border-blue-500/30 pb-1">
                                {teamName} Matches
                            </h4>
                            {teamMatches.map((match) => {
                                const opponent = match.opponents.find(opp => opp.opponent.id !== teamId)?.opponent;
                                const result = getMatchResult(match, teamId);
                                
                                return (
                                    <div
                                        key={match.id}
                                        className="bg-gray-600 rounded-lg p-3 hover:bg-gray-500 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {result && (
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        result === 'W' ? 'bg-green-500 text-white' : 
                                                        result === 'L' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                                                    }`}>
                                                        {result}
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-2">
                                                    {opponent?.image_url && (
                                                        <img 
                                                            src={opponent.image_url} 
                                                            alt={opponent.name}
                                                            className="w-5 h-5 rounded object-cover"
                                                        />
                                                    )}
                                                    <span className="text-white text-sm font-medium">
                                                        vs {opponent?.acronym || opponent?.name || 'TBD'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-medium ${getStatusColor(match.status)}`}>
                                                    {match.status.replace('_', ' ').toUpperCase()}
                                                </div>
                                                <div className="text-gray-400 text-xs">
                                                    {formatDate(match.begin_at)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {match.status === 'finished' && match.results.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-500">
                                                <div className="flex justify-center space-x-4 text-sm">
                                                    {match.results.map((result, resultIndex) => {
                                                        const team = match.opponents.find(opp => opp.opponent.id === result.team_id);
                                                        const isCurrentTeam = result.team_id === teamId;
                                                        return (
                                                            <span key={resultIndex} className={`${
                                                                isCurrentTeam ? 'text-blue-300 font-medium' : 'text-gray-300'
                                                            }`}>
                                                                {team?.opponent.acronym || 'Team'}: {result.score}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 