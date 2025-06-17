'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import { User, MapPin, Calendar, Gamepad2, Trophy, Award, Clock, Star, ArrowLeft } from 'lucide-react'
import type { Player } from '@/types/roster'
import { parseLeagueInfo } from '@/lib/textUtils'

interface PlayerDetailsContentProps {
    playerId: string
}

interface Tournament {
    id: number
    name: string
    type: string
    begin_at: string | null
    end_at: string | null
    tier: string | null
    prizepool: string | null
    winner_id: number | null
    winner_type: string | null
    slug: string
    league: {
        id: number
        name: string
        image_url: string
        slug: string
        url: string
    } | null
    serie: {
        id: number
        name: string
        full_name: string
        slug: string
        year: number
        begin_at: string | null
        end_at: string | null
    } | null
    videogame: {
        id: number
        name: string
        slug: string
    } | null
}

// Prize pool formatting utility
const formatPrizePool = (prizePool: string | undefined | null): string => {
    if (!prizePool || prizePool.trim() === '') return 'TBD';
    
    // Handle common "TBD" or "To be determined" cases
    const lowerPrizePool = prizePool.toLowerCase().trim();
    if (lowerPrizePool === 'tbd' || lowerPrizePool === 'to be determined' || lowerPrizePool === 'n/a') {
        return 'TBD';
    }
    
    // Detect currency from the original string
    let currencySymbol = '$'; // Default to USD
    
    // Check for currency symbols
    if (/€/.test(prizePool)) currencySymbol = '€';
    else if (/£/.test(prizePool)) currencySymbol = '£';
    else if (/¥/.test(prizePool)) currencySymbol = '¥';
    else if (/₹/.test(prizePool)) currencySymbol = '₹';
    else if (/₽/.test(prizePool)) currencySymbol = '₽';
    
    // Check for currency names/codes
    else if (/indonesian rupiah|idr/gi.test(prizePool)) currencySymbol = 'IDR';
    else if (/euro|eur/gi.test(prizePool)) currencySymbol = '€';
    else if (/british pound|gbp/gi.test(prizePool)) currencySymbol = '£';
    else if (/japanese yen|jpy/gi.test(prizePool)) currencySymbol = '¥';
    else if (/indian rupee|inr/gi.test(prizePool)) currencySymbol = '₹';
    else if (/russian ruble|rub/gi.test(prizePool)) currencySymbol = '₽';
    else if (/chinese yuan|cny/gi.test(prizePool)) currencySymbol = '¥';
    else if (/korean won|krw/gi.test(prizePool)) currencySymbol = '₩';
    else if (/thai baht|thb/gi.test(prizePool)) currencySymbol = '฿';
    
    // Extract numeric value
    let numericValue = prizePool;
    
    // Remove all currency-related text but keep K/M suffixes
    numericValue = numericValue.replace(/[$€£¥₹₽₩฿]/g, '');
    numericValue = numericValue.replace(/united states dollar|us dollar|indonesian rupiah|euro|british pound|japanese yen|indian rupee|russian ruble|chinese yuan|korean won|thai baht|singapore dollar|malaysian ringgit|philippine peso|vietnamese dong|brazilian real|mexican peso|canadian dollar|australian dollar|new zealand dollar|south african rand|turkish lira|polish zloty|czech koruna|hungarian forint|norwegian krone|swedish krona|danish krone|swiss franc/gi, '');
    numericValue = numericValue.replace(/\b(usd|eur|gbp|jpy|inr|rub|cny|krw|thb|sgd|myr|php|vnd|brl|mxn|cad|aud|nzd|zar|try|pln|czk|huf|nok|sek|dkk|chf|idr)\b/gi, '');
    numericValue = numericValue.replace(/[,\s]+/g, '');
    
    // Check for K/M suffixes
    const hasK = /k$/i.test(numericValue.trim());
    const hasM = /m$/i.test(numericValue.trim());
    
    // Extract numbers
    const cleanValue = numericValue.replace(/[^0-9.]/g, '');
    let value = parseFloat(cleanValue);
    
    if (isNaN(value) || value <= 0) return 'TBD';
    
    // Apply multipliers
    if (hasK && !hasM) {
        value = value * 1000;
    } else if (hasM) {
        value = value * 1000000;
    }
    
    // Format with original currency
    if (value >= 1000000) {
        return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `${currencySymbol}${(value / 1000).toFixed(1)}K`;
    } else {
        return `${currencySymbol}${value.toLocaleString()}`;
    }
}

export default function PlayerDetailsContent({ playerId }: PlayerDetailsContentProps) {
    const [player, setPlayer] = useState<Player | null>(null)
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()
    const sidebarRef = useRef<HTMLDivElement>(null)
    const tournamentRef = useRef<HTMLDivElement>(null)

    // Memoize the fetch function to prevent unnecessary re-renders
    const fetchPlayerData = useCallback(async () => {
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

            // Fetch player tournaments
            const tournamentsResponse = await fetch(`/api/players/${playerId}/tournaments`)
            if (tournamentsResponse.ok) {
                const tournamentsData = await tournamentsResponse.json()
                setTournaments(tournamentsData || [])
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch player data')
        } finally {
            setLoading(false)
        }
    }, [playerId]) // Only depend on playerId

    useEffect(() => {
        fetchPlayerData()
    }, [fetchPlayerData]) // Use the memoized function

    // Height matching effect
    useEffect(() => {
        const matchHeights = () => {
            if (sidebarRef.current && tournamentRef.current) {
                // Calculate total height of all sidebar sections including gaps
                const sidebarSections = sidebarRef.current.children
                let totalHeight = 0
                
                for (let i = 0; i < sidebarSections.length; i++) {
                    const section = sidebarSections[i] as HTMLElement
                    totalHeight += section.offsetHeight
                    
                    // Add gap between sections (24px gap from space-y-6)
                    if (i < sidebarSections.length - 1) {
                        totalHeight += 24
                    }
                }
                
                // Set tournament section to match total sidebar height
                tournamentRef.current.style.height = `${totalHeight}px`
                
                // Calculate scrollable content height for tournaments
                const scrollableContent = tournamentRef.current.querySelector('.tournament-scroll-content') as HTMLElement
                const header = tournamentRef.current.querySelector('.tournament-header') as HTMLElement
                
                if (scrollableContent && header) {
                    const headerHeight = header.offsetHeight
                    const padding = 48 // 24px top + 24px bottom padding
                    const availableHeight = totalHeight - headerHeight - padding
                    scrollableContent.style.height = `${availableHeight}px`
                }
            }
        }

        // Match heights after content loads
        const timer = setTimeout(matchHeights, 200)
        
        // Add resize listener
        window.addEventListener('resize', matchHeights)
        
        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', matchHeights)
        }
    }, [tournaments, player])

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

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short'
            }),
            full: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) + ' ' + date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short'
            })
        }
    }

    const getTierDisplay = (tier: string) => {
        const tierMap: { [key: string]: { label: string; color: string; bgColor: string; borderColor: string } } = {
            'S': { label: 'S-Tier', color: 'text-yellow-300', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/40' },
            'A': { label: 'A-Tier', color: 'text-orange-300', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/40' },
            'B': { label: 'B-Tier', color: 'text-blue-300', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/40' },
            'C': { label: 'C-Tier', color: 'text-green-300', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/40' },
            'D': { label: 'D-Tier', color: 'text-gray-300', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/40' },
        }
        
        const tierKey = tier?.toUpperCase()
        const tierInfo = tierMap[tierKey] || { label: tier, color: 'text-purple-300', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/40' }
        
        return tierInfo
    }

    const getPlayerImage = (imageUrl: string) => {
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-player.svg'
    }

    const getTournamentImage = (imageUrl: string) => {
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-tournament.svg'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header searchTerm={searchTerm} onSearch={handleSearchChange} />
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
                <Header searchTerm={searchTerm} onSearch={handleSearchChange} />
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
            <Header searchTerm={searchTerm} onSearch={handleSearchChange} />
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                {/* Player Header */}
                <div className="mb-8">
                    {player.role && (
                        <div className="flex items-center space-x-2 text-gray-400 mb-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm">{player.role}</span>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 flex">
                        {/* Tournaments */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl flex flex-col w-full" ref={tournamentRef}>
                            <div className="flex items-center justify-between mb-6 tournament-header">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-orange-500/20 rounded-xl">
                                        <Trophy className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                        Tournaments
                                    </h2>
                                </div>
                                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-xl px-4 py-2 border border-orange-500/20 shadow-lg">
                                    <div className="text-lg font-bold text-orange-400">
                                        {tournaments.length}
                                    </div>
                                    <div className="text-xs text-orange-200 font-medium text-center">Total</div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="space-y-6 overflow-y-auto pr-2 tournament-scroll-content">
                                    {tournaments.length > 0 ? (
                                        tournaments.map((tournament) => {
                                            const isChampion = tournament.winner_id === parseInt(playerId)
                                            
                                            return (
                                                <div key={tournament.id} className={`group relative ${isChampion ? 'bg-gradient-to-r from-yellow-500/20 via-yellow-400/30 to-yellow-500/20 border-yellow-500/50' : 'bg-gradient-to-r from-gray-700/30 via-gray-700/40 to-gray-700/30 border-gray-600/30'} rounded-xl p-6 hover:from-gray-600/40 hover:via-gray-600/50 hover:to-gray-600/40 transition-all duration-300 hover:border-orange-500/30 shadow-lg hover:shadow-xl border`}>
                                                    {/* Champion Badge */}
                                                    {isChampion && (
                                                        <div className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 bg-yellow-500/30 border border-yellow-500/50 rounded-full">
                                                            <Trophy className="w-4 h-4 text-yellow-300" />
                                                            <span className="text-sm font-bold text-yellow-300">Champion</span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Tournament Header */}
                                                    <div className="flex items-start space-x-4 mb-6">
                                                        {/* League Image */}
                                                        <div 
                                                            className="relative w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl overflow-hidden ring-2 ring-gray-600/50 group-hover:ring-orange-500/60 transition-all duration-300 shadow-lg flex-shrink-0 p-2 cursor-pointer hover:scale-105"
                                                            onClick={() => router.push(`/tournaments/${tournament.id}`)}
                                                        >
                                                            <div className="relative w-full h-full">
                                                                <Image
                                                                    src={getTournamentImage(tournament.league?.image_url || '')}
                                                                    alt={tournament.league?.name || 'Tournament'}
                                                                    fill
                                                                    className="object-contain"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement
                                                                        target.src = '/images/placeholder-tournament.svg'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Tournament Info */}
                                                        <div className="flex-1">
                                                            <div className="flex flex-col space-y-2">
                                                                {/* League Name */}
                                                                {tournament.league && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <Trophy className="w-4 h-4 text-yellow-400" />
                                                                        <span 
                                                                            className="text-lg font-bold text-yellow-300 cursor-pointer hover:text-yellow-200 transition-colors"
                                                                            onClick={() => router.push(`/tournaments/${tournament.id}`)}
                                                                        >
                                                                            {tournament.league.name}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Serie Name and Year */}
                                                                {tournament.serie && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <Calendar className="w-4 h-4 text-blue-400" />
                                                                        <span 
                                                                            className="text-md font-semibold text-blue-300 cursor-pointer hover:text-blue-200 transition-colors"
                                                                            onClick={() => router.push(`/tournaments/${tournament.id}`)}
                                                                        >
                                                                            {parseLeagueInfo(tournament.serie.full_name || tournament.serie.name)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Tournament Name and Tier */}
                                                                <div className="flex items-center space-x-2 flex-wrap">
                                                                    <Award className="w-4 h-4 text-orange-400" />
                                                                    <span 
                                                                        className="text-xl font-bold text-white cursor-pointer hover:text-gray-200 transition-colors"
                                                                        onClick={() => router.push(`/tournaments/${tournament.id}`)}
                                                                    >
                                                                        {parseLeagueInfo(tournament.name)}
                                                                    </span>
                                                                    {tournament.tier && (() => {
                                                                        const tierInfo = getTierDisplay(tournament.tier)
                                                                        return (
                                                                            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${tierInfo.bgColor} ${tierInfo.borderColor} ${tierInfo.color} border`}>
                                                                                <Star className="w-4 h-4" />
                                                                                <span>{tierInfo.label}</span>
                                                                            </div>
                                                                        )
                                                                    })()}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Tournament Details */}
                                                            <div className="flex items-center space-x-4 mt-3">
                                                                {tournament.videogame && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <Gamepad2 className="w-4 h-4 text-green-400" />
                                                                        <span className="text-sm text-green-300 font-medium">{tournament.videogame.name}</span>
                                                                    </div>
                                                                )}
                                                                {tournament.prizepool && (
                                                                    <span className="text-green-400 text-sm font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                                                        {formatPrizePool(tournament.prizepool)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Tournament Dates */}
                                                            {(tournament.begin_at || tournament.end_at) && (
                                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                                                    {tournament.begin_at && (
                                                                        <div 
                                                                            className="flex items-center space-x-1 cursor-default"
                                                                            title={formatDateTime(tournament.begin_at).full}
                                                                        >
                                                                            <Calendar className="w-3 h-3" />
                                                                            <span>Start: {formatDateTime(tournament.begin_at).date} {formatDateTime(tournament.begin_at).time}</span>
                                                                        </div>
                                                                    )}
                                                                    {tournament.end_at && (
                                                                        <div 
                                                                            className="flex items-center space-x-1 cursor-default"
                                                                            title={formatDateTime(tournament.end_at).full}
                                                                        >
                                                                            <Clock className="w-3 h-3" />
                                                                            <span>End: {formatDateTime(tournament.end_at).date} {formatDateTime(tournament.end_at).time}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <h3 className="text-lg font-semibold mb-2">No Tournaments Found</h3>
                                            <p>This player hasn&apos;t participated in any tournaments yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6" ref={sidebarRef}>
                        {/* Player Info */}
                        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                <User className="w-5 h-5 mr-2 text-purple-400" />
                                Player Info
                            </h2>
                            <div className="space-y-6">
                                {/* Player Image */}
                                <div className="relative w-full h-64 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl overflow-hidden ring-4 ring-purple-500/30 hover:ring-cyan-500/50 transition-all duration-300 shadow-xl">
                                    <Image 
                                        src={getPlayerImage(player.image_url || '')} 
                                        alt={player.name}
                                        fill
                                        className="object-cover object-top"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.src = '/images/placeholder-player.svg'
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
                                    
                                    {/* Active status indicator */}
                                    {player.active !== undefined && (
                                        <div className="absolute top-4 right-4">
                                            <div 
                                                className={`w-6 h-6 rounded-full ${player.active ? 'bg-green-400' : 'bg-red-400'} ring-2 ring-gray-900 shadow-lg`}
                                                title={player.active ? 'Active' : 'Inactive'} 
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Player Name Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">{player.name}</h1>
                                        {(player.first_name || player.last_name) && (
                                            <div className="text-sm text-gray-300">
                                                {[player.first_name, player.last_name].filter(Boolean).join(' ')}
                                            </div>
                                        )}
                                    </div>
                                </div>


                                {/* Current Team */}
                                {player.current_team && (
                                    <div 
                                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer group"
                                        onClick={() => router.push(`/teams/${player.current_team!.id}`)}
                                    >
                                        {/* Team Logo */}
                                        <div className="relative w-16 h-16 bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-xl border border-gray-600/50 overflow-hidden shadow-lg group-hover:border-blue-500/50 transition-all duration-300">
                                            <Image
                                                src={('image_url' in player.current_team && player.current_team.image_url) || '/images/placeholder-team.svg'}
                                                alt={player.current_team.name}
                                                fill
                                                className="object-contain p-2"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.src = '/images/placeholder-team.svg'
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-400 font-medium mb-1">Current Team</div>
                                            <div className="text-blue-400 font-bold text-lg group-hover:text-blue-300 transition-colors">
                                                {player.current_team.name}
                                            </div>
                                        </div>
                                        <div className="text-blue-400/60 group-hover:text-blue-400 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}

                                {/* Nationality */}
                                {player.nationality && (
                                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-700/30 to-gray-700/20 rounded-xl border border-gray-600/30">
                                        <div className="p-3 bg-green-500/20 rounded-xl">
                                            <MapPin className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-400 font-medium mb-1">Nationality</div>
                                            <div className="flex items-center space-x-3">
                                                <div className="relative w-6 h-4 rounded-sm overflow-hidden border border-gray-500/30">
                                                    {getFlagPath(player.nationality) ? (
                                                        <Image
                                                            src={getFlagPath(player.nationality)}
                                                            alt={`${player.nationality} flag`}
                                                            fill
                                                            className="object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                                                            <MapPin className="w-3 h-3 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-white font-bold text-lg">{player.nationality}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Age & Birthday */}
                                {(player.age || player.birthday) && (
                                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-700/30 to-gray-700/20 rounded-xl border border-gray-600/30">
                                        <div className="p-3 bg-purple-500/20 rounded-xl">
                                            <Calendar className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-400 font-medium mb-1">
                                                {player.age && player.birthday ? 'Age & Birthday' : player.age ? 'Age' : 'Birthday'}
                                            </div>
                                            {player.age && (
                                                <div className="text-white font-bold text-lg">{player.age} years old</div>
                                            )}
                                            {player.birthday && (
                                                <div className="text-gray-300 text-sm mt-1">{formatBirthday(player.birthday)}</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Current Game */}
                                {player.current_videogame && (
                                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-700/30 to-gray-700/20 rounded-xl border border-gray-600/30">
                                        <div className="p-3 bg-orange-500/20 rounded-xl">
                                            <Gamepad2 className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-400 font-medium mb-1">Current Game</div>
                                            <div className="text-orange-400 font-bold text-lg">{player.current_videogame.name}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Player Role */}
                                {player.role && (
                                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-700/30 to-gray-700/20 rounded-xl border border-gray-600/30">
                                        <div className="p-3 bg-cyan-500/20 rounded-xl">
                                            <Award className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-400 font-medium mb-1">Role</div>
                                            <div className="text-cyan-400 font-bold text-lg">{player.role}</div>
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
