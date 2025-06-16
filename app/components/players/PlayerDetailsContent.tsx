'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import { User, MapPin, Calendar, Gamepad2, Trophy, Target } from 'lucide-react'
import type { Player } from '@/types/roster'

interface PlayerDetailsContentProps {
    playerId: string
}

interface Match {
    id: number
    name: string
    status: string
    begin_at: string
    // Add other match properties as needed
}

export default function PlayerDetailsContent({ playerId }: PlayerDetailsContentProps) {
    const [player, setPlayer] = useState<Player | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchPlayerData = async () => {
            setLoading(true)
            setError(null)
            
            try {
                // Fetch player details
                const playerResponse = await fetch(`/api/players/${playerId}`)
                if (!playerResponse.ok) {
                    throw new Error('Failed to fetch player details')
                }
                const playerData = await playerResponse.json()
                setPlayer(playerData)

                // Fetch player matches
                const matchesResponse = await fetch(`/api/players/${playerId}/matches`)
                if (matchesResponse.ok) {
                    const matchesData = await matchesResponse.json()
                    setMatches(matchesData || [])
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch player data')
            } finally {
                setLoading(false)
            }
        }

        fetchPlayerData()
    }, [playerId])

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
    }

    // Helper function to get flag component from country code
    const getFlagPath = (countryCode: string): string => {
        return countryCode ? `/flags/3x2/${countryCode}.svg` : '';
    }

    const formatBirthday = (birthday: string) => {
        if (!birthday) return null;
        const date = new Date(birthday);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    const formatMatchDate = (dateString: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                <Navigation />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        {/* Header */}
                        <div className="flex items-center space-x-6 mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full ring-2 ring-gray-600/30" />
                            <div className="flex-1">
                                <div className="h-8 w-64 bg-gray-700 rounded mb-2" />
                                <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
                                <div className="h-4 w-48 bg-gray-700 rounded" />
                            </div>
                        </div>

                        {/* Content sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
                                    <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
                                    <div className="space-y-3">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="h-16 bg-gray-700/50 rounded" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
                                    <div className="h-6 w-24 bg-gray-700 rounded mb-4" />
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-12 bg-gray-700/50 rounded" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (error || !player) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                <Navigation />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="text-red-400 text-lg mb-2">Error loading player</div>
                        <div className="text-gray-400">{error || 'Player not found'}</div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} />
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Player Header */}
                <div className="flex items-center space-x-6 mb-8">
                    <div className="relative w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full ring-4 ring-purple-500/30 overflow-hidden hover:ring-cyan-500/50 transition-all duration-300">
                        <Image 
                            src={player.image_url || '/images/placeholder-player.svg'} 
                            alt={player.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/placeholder-player.svg'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 rounded-full" />
                        
                        {/* Active status indicator */}
                        {player.active !== undefined && (
                            <div className="absolute top-2 right-2">
                                <div 
                                    className={`w-4 h-4 rounded-full ${player.active ? 'bg-green-400' : 'bg-red-400'} ring-2 ring-gray-900`}
                                    title={player.active ? 'Active' : 'Inactive'} 
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">{player.name}</h1>
                        {(player.first_name || player.last_name) && (
                            <p className="text-lg text-gray-300 mb-2">
                                {[player.first_name, player.last_name].filter(Boolean).join(' ')}
                            </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                            {player.nationality && (
                                <div className="flex items-center space-x-2">
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
                                                }}
                                            />
                                        ) : (
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                    <span>{player.nationality}</span>
                                </div>
                            )}
                            {player.age && (
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Age {player.age}</span>
                                </div>
                            )}
                            {player.role && (
                                <div className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span>{player.role}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Matches */}
                        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                            <div className="flex items-center space-x-2 mb-4">
                                <Trophy className="w-5 h-5 text-purple-400" />
                                <h2 className="text-xl font-semibold text-white">Recent Matches</h2>
                            </div>
                            
                            {matches.length > 0 ? (
                                <div className="space-y-3">
                                    {matches.map((match) => (
                                        <div key={match.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors duration-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-white mb-1">{match.name}</h3>
                                                    <div className="text-sm text-gray-400">
                                                        {formatMatchDate(match.begin_at)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        match.status === 'finished' ? 'bg-green-500/20 text-green-400' :
                                                        match.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                        {match.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No recent matches found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Player Info */}
                        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                            <h2 className="text-xl font-semibold text-white mb-4">Player Info</h2>
                            <div className="space-y-4">
                                {player.birthday && (
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-400">Birthday</div>
                                            <div className="text-white">{formatBirthday(player.birthday)}</div>
                                        </div>
                                    </div>
                                )}
                                
                                {player.current_team && (
                                    <div className="flex items-center space-x-3">
                                        <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-400">Current Team</div>
                                            <div className="text-blue-400 font-medium">{player.current_team.name}</div>
                                        </div>
                                    </div>
                                )}
                                
                                {player.current_videogame && (
                                    <div className="flex items-center space-x-3">
                                        <Gamepad2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-400">Current Game</div>
                                            <div className="text-purple-400 font-medium">{player.current_videogame.name}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
} 