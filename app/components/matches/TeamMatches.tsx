'use client';

import { useState, useEffect } from 'react';
import type { TeamMatch, Match } from '@/types/esports';

interface TeamMatchesProps {
    teamId: number;
    teamName: string;
    currentMatch?: Match; // Add current match for comparison
}

export default function TeamMatches({ teamId, teamName, currentMatch }: TeamMatchesProps) {
    const [matches, setMatches] = useState<TeamMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const getMatchResult = (match: TeamMatch, currentTeamId: number) => {
        if (match.status !== 'finished' || !match.winner_id) {
            return null;
        }
        
        const isWinner = match.winner_id === currentTeamId;
        return isWinner ? 'W' : 'L';
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
            parts.push(match.serie.full_name);
        }
        
        if (match.tournament.name && match.tournament.name !== match.serie.name) {
            parts.push(match.tournament.name);
        }

        return parts.length > 0 ? parts.join(' • ') : null;
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
                    
                    return (
                        <div
                            key={match.id}
                            className="bg-gray-600 rounded-lg p-3 hover:bg-gray-500 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {result && (
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                            {result}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="text-white font-medium text-sm">
                                            vs {opponent?.acronym || opponent?.name || 'TBD'}
                                        </div>
                                        {competitionInfo && (
                                            <div className="text-blue-300 text-xs mb-1">
                                                {competitionInfo}
                                            </div>
                                        )}
                                        <div className="text-gray-300 text-xs">
                                            {!competitionInfo && `${match.league.name} • ${match.tournament.name}`}
                                        </div>
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
                                        {match.results.map((result, index) => {
                                            const team = match.opponents.find(opp => opp.opponent.id === result.team_id);
                                            return (
                                                <span key={index} className="text-gray-300">
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
        </div>
    );
} 