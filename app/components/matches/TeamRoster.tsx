import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Roster, Player } from '@/types/roster';
import { Users } from 'lucide-react';

interface TeamRosterProps {
    teamId?: number;
    teamName: string;
    tournamentId?: number;
}

export default function TeamRoster({ teamId, teamName, tournamentId }: TeamRosterProps) {
    const [roster, setRoster] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoster = async () => {
            if (!tournamentId || !teamId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/tournaments/${tournamentId}/rosters`);
                if (!response.ok) {
                    throw new Error('Failed to fetch roster');
                }

                const data = await response.json();
                const teamRoster = data.rosters.find((r: Roster) => r.id === teamId);
                setRoster(teamRoster?.players || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch roster');
            } finally {
                setLoading(false);
            }
        };

        fetchRoster();
    }, [teamId, tournamentId]);

    if (!teamId || !tournamentId) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-2">{teamName}</h3>
                <p className="text-gray-400 text-sm">Roster information not available</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">{teamName}</h3>
                <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-1/4" />
                                <div className="h-3 bg-gray-700 rounded w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-2">{teamName}</h3>
                <p className="text-red-400 text-sm">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">{teamName} Roster</h3>
            </div>
            
            {roster.length === 0 ? (
                <p className="text-gray-400 text-sm">No roster information available</p>
            ) : (
                <div className="space-y-4">
                    {roster.map((player) => (
                        <div key={player.id} className="flex items-center space-x-4 bg-gray-700/30 rounded-lg p-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                                <Image
                                    src={player.image_url || '/images/placeholder-player.svg'}
                                    alt={player.name}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/placeholder-player.svg';
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-medium">{player.name}</h4>
                                <div className="flex items-center space-x-2 text-sm">
                                    {player.role && (
                                        <span className="text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
                                            {player.role.toUpperCase()}
                                        </span>
                                    )}
                                    {player.nationality && (
                                        <span className="text-gray-400">
                                            {player.nationality}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 