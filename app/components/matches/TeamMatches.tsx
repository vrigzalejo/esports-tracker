'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { TeamMatch, Match } from '@/types/esports';
import { formatMatchDateRange, parseLeagueInfo, cleanMatchName, capitalizeWords } from '@/lib/textUtils';

interface TeamMatchesProps {
    teamId: number;
    teamName: string;
    currentMatch?: Match; // Add current match for comparison
}

export default function TeamMatches({ teamId, teamName, currentMatch }: TeamMatchesProps) {
    const [matches, setMatches] = useState<TeamMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchTeamMatches = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(`/api/teams/${teamId}/matches`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch team matches');
                }
                
                const data = await response.json();
                // Limit to recent 5 matches for display
                setMatches(data.slice(0, 5));
            } catch (err) {
                console.error('Error fetching team matches:', err);
                setError(err instanceof Error ? err.message : 'Failed to load matches');
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTeamMatches();
        }
    }, [teamId]);

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

    const getMatchResult = (match: TeamMatch, currentTeamId: number) => {
        if (match.status !== 'finished' || !match.results || match.results.length === 0) {
            return null;
        }
        
        const teamResult = match.results.find(result => result.team_id === currentTeamId);
        const opponentResult = match.results.find(result => result.team_id !== currentTeamId);
        
        if (!teamResult || !opponentResult) return null;
        
        const isWinner = teamResult.score > opponentResult.score;
        return {
            result: isWinner ? 'W' : 'L',
            teamScore: teamResult.score,
            opponentScore: opponentResult.score,
            isWinner
        };
    };

    // Check if match details are different from current match
    const isDifferentCompetition = (match: TeamMatch) => {
        if (!currentMatch) return true;
        
        return (
            match.league.name !== currentMatch.league?.name ||
            match.serie.full_name !== currentMatch.serie?.full_name ||
            match.tournament.id !== currentMatch.tournament?.id
        );
    };

    // Get competition info to display
    const getCompetitionInfo = (match: TeamMatch) => {
        if (!isDifferentCompetition(match)) {
            return null; // Don't show if same as current match
        }

        const parts = [];
        
        if (match.league.name) {
            parts.push(match.league.name);
        }
        
        if (match.serie.full_name && match.serie.full_name !== match.league.name) {
            parts.push(capitalizeWords(match.serie.full_name));
        }
        
        if (match.tournament.name && match.tournament.name !== match.serie.name) {
            parts.push(match.tournament.name);
        }

        return parts.length > 0 ? parts.join(' • ') : null;
    };

    const handleOpponentClick = (opponentId: number, opponentType?: 'Player' | 'Team') => {
        if (opponentId) {
            const basePath = opponentType === 'Player' ? '/players' : '/teams';
            router.push(`${basePath}/${opponentId}`);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Recent Matches - {teamName}
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
                    Recent Matches - {teamName}
                </h3>
                <div className="text-gray-400 text-sm">
                    No recent matches found
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
                Recent Matches - {teamName}
            </h3>
            <div className="space-y-3">
                {matches.map((match) => {
                    const opponent = match.opponents.find(opp => opp.opponent.id !== teamId)?.opponent;
                    const result = getMatchResult(match, teamId);
                    const competitionInfo = getCompetitionInfo(match);
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
                                            {/* Modern W/L Badge */}
                                            <div className={`relative overflow-hidden rounded-full w-8 h-8 min-w-[2rem] min-h-[2rem] flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                                result.isWinner 
                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
                                                    : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                                            }`} style={{ aspectRatio: '1 / 1' }}>
                                                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full" />
                                                <span className="relative z-10 font-extrabold">{result.result}</span>
                                            </div>
                                            
                                            {/* Score Display */}
                                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                                result.isWinner 
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/20'
                                            }`}>
                                                {result.teamScore} - {result.opponentScore}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 text-white font-medium text-sm">
                                            <span>vs</span>
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
                                                className="cursor-pointer hover:text-cyan-300 transition-colors duration-200"
                                                onClick={() => {
                                                    const opponentType = match.opponents.find(opp => opp.opponent.id === opponent?.id)?.type as 'Player' | 'Team' | undefined;
                                                    handleOpponentClick(opponent?.id || 0, opponentType);
                                                }}
                                            >
                                                {opponent?.acronym || opponent?.name || 'TBD'}
                                            </span>
                                        </div>
                                        {match.name && (
                                            <div className="text-purple-300 text-xs mb-1 font-medium">
                                                {cleanMatchName(match.name)}
                                            </div>
                                        )}
                                        {competitionInfo && (
                                            <div className="text-blue-300 text-xs mb-1">
                                                {competitionInfo}
                                            </div>
                                        )}
                                        <div className="text-gray-300 text-xs">
                                            {!competitionInfo && `${match.league.name} • ${parseLeagueInfo(match.tournament.name)}`}
                                        </div>
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
        </div>
    );
} 
