import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Roster, Player } from '@/types/roster';
import { Users } from 'lucide-react';
// Import country flags - you'll need to install: npm install country-flag-icons
// import '/node_modules/country-flag-icons/3x2/US.svg' - this is how you'd import specific flags

interface TeamRosterProps {
    teamId?: number;
    teamName: string;
    tournamentId?: number;
}

// Helper function to get flag component from country name
const getFlagPath = (countryCode: string): string => {
    return countryCode ? `/flags/3x2/${countryCode}.svg` : '';
};

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
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">{teamName}</h3>
                </div>
                <p className="text-gray-400 text-sm text-center py-8">Roster information not available</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">{teamName} Roster</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-800/60 rounded-xl overflow-hidden">
                                <div className="w-full h-64 bg-gray-700" />
                                <div className="p-3 text-center space-y-2">
                                    <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto" />
                                    <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto" />
                                    <div className="h-3 bg-gray-700 rounded w-3/4 mx-auto" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">{teamName}</h3>
                </div>
                <p className="text-red-400 text-sm text-center py-8">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-6">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">{teamName} Roster</h3>
            </div>

            {roster.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No roster information available</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roster.map((player) => (
                        <div key={player.id} className="group">
                            <div className="bg-gray-800/60 rounded-xl hover:bg-gray-800/80 transition-all duration-200 border border-gray-700/30 hover:border-gray-600/50 overflow-hidden">
                                {/* Player Image - Full Size */}
                                <div className="relative w-full h-64 bg-gray-700 overflow-hidden">
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
                                    
                                    {/* Active status indicator */}
                                    {player.active !== undefined && (
                                        <div className="absolute top-3 right-3">
                                            <div 
                                                className={`w-2.5 h-2.5 rounded-full ${player.active ? 'bg-green-400' : 'bg-red-400'}`}
                                                title={player.active ? 'Active' : 'Inactive'} 
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Player Info - Compact */}
                                <div className="p-3 text-center">
                                    <h4 className="text-white font-medium text-base mb-2 truncate">
                                        {player.name}
                                    </h4>

                                    <div className="space-y-2">
                                        {player.nationality && (
                                            <div className="flex items-center justify-center space-x-2 text-gray-300 text-sm">
                                                <div className="relative w-4 h-3">
                                                    {getFlagPath(player.nationality) ? (
                                                        <Image
                                                            src={getFlagPath(player.nationality)}
                                                            alt={`${player.nationality} flag`}
                                                            width={16}
                                                            height={12}
                                                            className="object-cover rounded-sm"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                const parent = target.parentElement?.parentElement;
                                                                if (parent) {
                                                                    parent.innerHTML = `<span class="text-sm text-gray-300">${player.nationality}</span>`;
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-gray-300">{player.nationality}</span>
                                                    )}
                                                </div>
                                                <span>{player.nationality}</span>
                                            </div>
                                        )}

                                        {player.age && (
                                            <div className="text-center text-sm text-gray-300">
                                                Age {player.age}
                                            </div>
                                        )}
                                        
                                        {player.birthday && (
                                            <div className="text-center text-xs text-gray-400">
                                                {new Date(player.birthday).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
