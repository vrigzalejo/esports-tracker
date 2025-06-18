'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { TournamentMatch } from '@/types/esports';
import { formatMatchDateRange } from '@/lib/textUtils';

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
    const router = useRouter();

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'finished':
                return 'text-green-400';
            case 'running':
                return 'text-red-400 animate-pulse';
            case 'not_started':
                return 'text-blue-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'finished':
                return 'FINISHED';
            case 'running':
                return 'LIVE';
            case 'not_started':
                return 'UPCOMING';
            default:
                return status.replace('_', ' ').toUpperCase();
        }
    };

    const getMatchResult = (match: TournamentMatch, teamId: number) => {
        if (match.status !== 'finished' || !match.results || match.results.length === 0) {
            return null;
        }
        
        const teamResult = match.results.find(result => result.team_id === teamId);
        const opponentResult = match.results.find(result => result.team_id !== teamId);
        
        if (!teamResult || !opponentResult) return null;
        
        const isWinner = teamResult.score > opponentResult.score;
        const isDraw = teamResult.score === opponentResult.score;
        
        return {
            result: isDraw ? 'D' : (isWinner ? 'W' : 'L'),
            teamScore: teamResult.score,
            opponentScore: opponentResult.score,
            isWinner,
            isDraw
        };
    };

    const getTeamMatches = (teamId: number) => {
        return matches.filter(match => 
            match.opponents.some(opponent => opponent.opponent.id === teamId)
        ).slice(0, 5); // Limit to 5 matches per team
    };

    const handleOpponentClick = (opponentId: number, opponentType?: 'Player' | 'Team') => {
        if (opponentId) {
            const basePath = opponentType === 'Player' ? '/players' : '/teams';
            router.push(`${basePath}/${opponentId}`);
        }
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
                                const isLive = match.status === 'running';
                                
                                return (
                                    <div
                                        key={match.id}
                                        className="bg-gray-600 rounded-lg p-3 hover:bg-gray-500 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {result && (
                                                    <div className="flex items-center space-x-2">
                                                        {/* Modern W/L/D Badge */}
                                                        <div className={`relative overflow-hidden rounded-full w-8 h-8 min-w-[2rem] min-h-[2rem] flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                                            result.isDraw
                                                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                                                                : result.isWinner 
                                                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
                                                                : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                                                        }`} style={{ aspectRatio: '1 / 1' }}>
                                                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full" />
                                                            <span className="relative z-10 font-extrabold">{result.result}</span>
                                                        </div>
                                                        
                                                        {/* Cool Score Display */}
                                                        <div className="flex items-center space-x-1 bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-lg px-2 py-1 border border-gray-600/30 shadow-lg backdrop-blur-sm">
                                                            <span className={`text-sm font-bold ${
                                                                result.isDraw ? 'text-amber-400' : 
                                                                result.isWinner ? 'text-emerald-400' : 'text-red-400'
                                                            }`}>
                                                                {result.teamScore}
                                                            </span>
                                                            <span className="text-gray-400 text-xs">-</span>
                                                            <span className={`text-sm font-bold ${
                                                                result.isDraw ? 'text-amber-400' : 
                                                                !result.isWinner ? 'text-emerald-400' : 'text-red-400'
                                                            }`}>
                                                                {result.opponentScore}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-white text-sm font-medium">
                                                        vs
                                                    </span>
                                                    {opponent?.image_url && (
                                                        <div 
                                                            className={`relative w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 ${
                                                                // Check if this is a player by looking at opponent type
                                                                match.opponents.find(opp => opp.opponent.id === opponent.id)?.type === 'Player' ? 'rounded-full' : 'rounded-lg'
                                                            } border border-gray-500/50 shadow-lg overflow-hidden backdrop-blur-sm cursor-pointer hover:border-cyan-500/50 transition-all duration-200`}
                                                            onClick={() => {
                                                                const opponentType = match.opponents.find(opp => opp.opponent.id === opponent.id)?.type as 'Player' | 'Team' | undefined;
                                                                handleOpponentClick(opponent.id, opponentType);
                                                            }}
                                                        >
                                                            <Image 
                                                                src={opponent.image_url} 
                                                                alt={opponent.name || 'Team/Player'}
                                                                fill
                                                                className={match.opponents.find(opp => opp.opponent.id === opponent.id)?.type === 'Player' ? 'object-cover object-center' : 'object-contain p-1'}
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement
                                                                    const isPlayer = match.opponents.find(opp => opp.opponent.id === opponent.id)?.type === 'Player'
                                                                    target.src = isPlayer ? '/images/placeholder-player.svg' : '/images/placeholder-team.svg'
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    <span 
                                                        className="text-white text-sm font-medium cursor-pointer hover:text-cyan-300 transition-colors duration-200"
                                                        onClick={() => {
                                                            const opponentType = match.opponents.find(opp => opp.opponent.id === opponent?.id)?.type as 'Player' | 'Team' | undefined;
                                                            handleOpponentClick(opponent?.id || 0, opponentType);
                                                        }}
                                                    >
                                                        {opponent?.acronym || opponent?.name || 'TBD'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-medium ${getStatusColor(match.status)} flex items-center justify-end space-x-1`}>
                                                    {isLive && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                                                    <span>{getStatusText(match.status)}</span>
                                                </div>
                                                <div className="text-gray-400 text-xs">
                                                    {formatMatchDateRange(match)}
                                                </div>
                                            </div>
                                        </div>
                                        

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
