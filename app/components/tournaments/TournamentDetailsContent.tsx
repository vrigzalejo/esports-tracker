'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ArrowLeft, Users, Calendar, Trophy, Gamepad2, Clock, Star, MapPin, Crown, Medal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import { parseLeagueInfo, cleanMatchName } from '@/lib/textUtils'





interface Match {
    id: number
    name: string
    status: 'running' | 'finished' | 'not_started' | 'completed'
    begin_at: string
    scheduled_at: string
    end_at?: string
    number_of_games: number
    winner_id?: number
    results: Array<{
        score: number
        team_id: number
    }>
    opponents: Array<{
        opponent: {
            id: number
            name: string
            image_url: string
        }
    }>
    videogame: {
        name: string
        slug: string
    }
    league: {
        name: string
        image_url: string
        region?: string
        tier?: string
    }
    serie: {
        name: string
        full_name?: string
        region?: string
        tier?: string
    }
    tournament: {
        id: number
        name: string
        region?: string
        tier?: string
    }
}



interface TournamentDetails {
    id: number
    name: string
    begin_at: string
    end_at: string
    prizepool?: string
    tier?: string
    status?: string
    league: {
        id: number
        name: string
        image_url: string
        region?: string
    }
    serie?: {
        id: number
        name: string
        full_name?: string
        slug: string
        year?: number
    }
    videogame: {
        name: string
        slug: string
    }
    region?: string
    country?: string
    teams?: Array<{
        id: number
        name: string
        acronym?: string
        image_url?: string
        location?: string
    }>
    expected_roster?: Array<{
        team: {
            id: number
            name: string
            acronym?: string
            image_url?: string
            location?: string
        }
        players: Array<{
            id: number
            name: string
            first_name?: string
            last_name?: string
            nationality?: string
            image_url?: string
            role?: string
            active?: boolean
            age?: number
            birthday?: string
        }>
    }>
}

interface TournamentDetailsContentProps {
    tournamentId: string
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

export default function TournamentDetailsContent({ tournamentId }: TournamentDetailsContentProps) {
    const [tournament, setTournament] = useState<TournamentDetails | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()
    const sidebarRef = useRef<HTMLDivElement>(null)
    const matchesRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchTournamentData = async () => {
            try {
                setLoading(true)
                
                // Fetch tournament details and matches in parallel
                const [tournamentResponse, matchesResponse] = await Promise.all([
                    fetch(`/api/tournaments/${tournamentId}`),
                    fetch(`/api/tournaments/${tournamentId}/matches`)
                ])
                
                if (!tournamentResponse.ok) {
                    const errorData = await tournamentResponse.json().catch(() => ({ error: 'Unknown error' }))
                    throw new Error(errorData.error || `Failed to fetch tournament data (${tournamentResponse.status})`)
                }
                
                const tournamentData = await tournamentResponse.json()
                
                // Validate that we have the minimum required data
                if (!tournamentData || !tournamentData.id) {
                    throw new Error('Invalid tournament data received')
                }
                
                setTournament(tournamentData)
                
                // Fetch and set matches data
                if (matchesResponse.ok) {
                    const matchesData = await matchesResponse.json()
                    // Sort matches by date (newest first)
                    matchesData.sort((a: any, b: any) => new Date(b.begin_at).getTime() - new Date(a.begin_at).getTime()) // eslint-disable-line @typescript-eslint/no-explicit-any
                    setMatches(matchesData)
                }

                // Note: Standings are now calculated from match results
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchTournamentData()
    }, [tournamentId])

    // Height matching effect
    useEffect(() => {
        const matchHeights = () => {
            if (sidebarRef.current && matchesRef.current) {
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
                
                // Set matches section to match total sidebar height
                matchesRef.current.style.height = `${totalHeight}px`
                
                // Calculate scrollable content height
                const scrollableContent = matchesRef.current.querySelector('.matches-scroll-content') as HTMLElement
                const header = matchesRef.current.querySelector('.matches-header') as HTMLElement
                
                if (scrollableContent && header) {
                    const headerHeight = header.offsetHeight
                    const padding = 64 // 24px top + 24px bottom padding + 16px extra for last card
                    const availableHeight = totalHeight - headerHeight - padding
                    scrollableContent.style.height = `${availableHeight}px`
                    scrollableContent.style.paddingBottom = '16px' // Ensure last card has space
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
    }, [tournament, matches])

    const getLeagueImage = (imageUrl: string) => {
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-tournament.svg'
    }

    const getTeamImage = (imageUrl: string) => {
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-team.svg'
    }

    const getFlagPath = (countryCode: string): string => {
        return countryCode ? `/flags/3x2/${countryCode}.svg` : ''
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

    const getTournamentStatus = (tournament: TournamentDetails) => {
        const now = new Date();
        const startDate = new Date(tournament.begin_at);
        const endDate = new Date(tournament.end_at);
        
        if (now < startDate) {
            return { status: 'upcoming', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' };
        } else if (now >= startDate && now <= endDate) {
            return { status: 'ongoing', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' };
        } else {
            return { status: 'finished', color: 'text-gray-400', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' };
        }
    }

    const getMatchResult = (match: Match) => {
        if (!match.results || match.results.length === 0) return null
        
        const team1Result = match.results[0]
        const team2Result = match.results[1]
        
        if (!team1Result || !team2Result) return null
        
        return {
            team1Score: team1Result.score,
            team2Score: team2Result.score,
            winnerId: team1Result.score > team2Result.score ? team1Result.team_id : team2Result.team_id
        }
    }

    // Calculate team statistics from matches
    const calculateTeamStats = () => {
        interface TeamStats {
            team: {
                id: number
                name: string
                acronym?: string
                image_url?: string
                location?: string
            }
            wins: number
            losses: number
            matches: number
            winRate: number
        }
        
        const teamStats: { [teamId: number]: TeamStats } = {}

        // Initialize team stats from tournament teams or expected roster
        const allTeams = tournament?.expected_roster?.map(r => r.team) || tournament?.teams || []
        allTeams.forEach(team => {
            teamStats[team.id] = {
                team,
                wins: 0,
                losses: 0,
                matches: 0,
                winRate: 0
            }
        })

        // Calculate stats from finished matches
        matches.forEach(match => {
            if (match.status === 'finished' || match.status === 'completed') {
                const result = getMatchResult(match)
                if (result && match.opponents.length >= 2) {
                    const team1 = match.opponents[0]?.opponent
                    const team2 = match.opponents[1]?.opponent
                    
                    if (team1 && team2 && teamStats[team1.id] && teamStats[team2.id]) {
                        teamStats[team1.id].matches++
                        teamStats[team2.id].matches++
                        
                        if (result.winnerId === team1.id) {
                            teamStats[team1.id].wins++
                            teamStats[team2.id].losses++
                        } else {
                            teamStats[team2.id].wins++
                            teamStats[team1.id].losses++
                        }
                    }
                }
            }
        })

        // Calculate win rates
        Object.values(teamStats).forEach(stats => {
            stats.winRate = stats.matches > 0 ? (stats.wins / stats.matches) * 100 : 0
        })

        // Sort by wins (descending), then by win rate
        return Object.values(teamStats)
            .filter(stats => stats.matches > 0 || allTeams.length <= 8) // Show all teams if 8 or fewer
            .sort((a, b) => {
                if (b.wins !== a.wins) return b.wins - a.wins
                return b.winRate - a.winRate
            })
            .map((stats, index) => ({
                rank: index + 1,
                team: stats.team,
                wins: stats.wins,
                losses: stats.losses,
                draws: 0,
                points: stats.wins, // Use wins as points for compatibility
                matches_played: stats.matches,
                win_rate: stats.winRate
            }))
    }

    const calculatedStandings = calculateTeamStats()

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back button skeleton */}
                    <div className="h-6 w-16 bg-gray-700 rounded mb-6 animate-pulse" />
                    
                    {/* Tournament Header Skeleton */}
                    <div className="relative bg-gradient-to-br from-gray-800/90 via-gray-800 to-gray-900 rounded-2xl p-8 mb-8 border border-gray-700/50 animate-pulse">
                        <div className="flex items-center space-x-8">
                            <div className="w-28 h-28 bg-gray-700 rounded-2xl" />
                            <div className="flex-1">
                                <div className="h-10 w-64 bg-gray-700 rounded mb-3" />
                                <div className="h-8 w-32 bg-gray-700 rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Matches Skeleton */}
                        <div className="lg:col-span-2">
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="h-8 w-32 bg-gray-700 rounded mb-6" />
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 animate-pulse">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-8 h-8 bg-gray-700 rounded" />
                                                    <div className="w-8 h-8 bg-gray-700 rounded" />
                                                </div>
                                                <div className="h-6 w-16 bg-gray-700 rounded" />
                                            </div>
                                            <div className="h-4 w-48 bg-gray-700 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Skeleton */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-700 rounded" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !tournament) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Tournament Not Found</h1>
                        <p className="text-gray-400">The tournament you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.</p>
                    </div>
                </div>
            </div>
        )
    }

    const statusInfo = getTournamentStatus(tournament)

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                {/* Tournament Header */}
                <div className="relative bg-gradient-to-br from-gray-800/90 via-gray-800 to-gray-900 rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50" />
                    
                    <div className="relative z-10 flex items-center space-x-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
                            <div className="relative w-28 h-28 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-600/40 shadow-2xl overflow-hidden backdrop-blur-sm">
                                <Image
                                    src={getLeagueImage(tournament.league.image_url)}
                                    alt={tournament.league.name}
                                    fill
                                    className="object-contain p-2"
                                    priority
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = '/images/placeholder-tournament.svg'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
                                {tournament.name}
                            </h1>
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                                    <span className="text-lg font-semibold text-blue-300">{tournament.league.name}</span>
                                </div>
                                {tournament.serie && (
                                    <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                                        <span className="text-lg font-semibold text-purple-300">{parseLeagueInfo(tournament.serie.full_name || tournament.serie.name)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} flex items-center gap-1`}>
                                    <Clock className="w-4 h-4" />
                                    {statusInfo.status.toUpperCase()}
                                </span>
                                {tournament.tier && (() => {
                                    const tierInfo = getTierDisplay(tournament.tier)
                                    return (
                                        <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${tierInfo.bgColor} ${tierInfo.color} ${tierInfo.borderColor} flex items-center gap-1`}>
                                            <Star className="w-4 h-4" />
                                            {tierInfo.label}
                                        </span>
                                    )
                                })()}
                                {tournament.prizepool && (
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-bold">
                                        {formatPrizePool(tournament.prizepool)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Matches */}
                    <div className="lg:col-span-2 flex">
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl flex flex-col w-full" ref={matchesRef}>
                            <div className="flex items-center justify-between mb-6 matches-header">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-500/20 rounded-xl">
                                        <Gamepad2 className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                        Matches
                                    </h2>
                                </div>
                                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl px-4 py-2 border border-blue-500/20 shadow-lg">
                                    <div className="text-lg font-bold text-blue-400">
                                        {matches.length}
                                    </div>
                                    <div className="text-xs text-blue-200 font-medium text-center">Total</div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="space-y-4 overflow-y-auto pr-2 pb-4 matches-scroll-content">
                                    {matches.length > 0 ? matches
                                        .sort((a, b) => {
                                            const dateA = new Date(a.begin_at || a.scheduled_at).getTime();
                                            const dateB = new Date(b.begin_at || b.scheduled_at).getTime();
                                            return dateA - dateB; // Ascending order (earliest first)
                                        })
                                        .map((match) => {
                                        const result = getMatchResult(match)
                                        const team1 = match.opponents[0]?.opponent
                                        const team2 = match.opponents[1]?.opponent
                                        
                                        return (
                                            <div key={match.id} className="group relative bg-gradient-to-br from-slate-800/40 via-slate-700/30 to-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-600/20 hover:border-blue-400/40 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
                                                {/* Glow effect */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                
                                                <div className="relative z-10">
                                                    {/* Header with Status and Info */}
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center space-x-3">
                                                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-sm border transition-all duration-300 ${
                                                                match.status === 'finished' || match.status === 'completed' 
                                                                    ? 'bg-slate-500/20 text-slate-300 border-slate-500/30 group-hover:bg-slate-400/30'
                                                                    : match.status === 'running'
                                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 group-hover:bg-emerald-400/30 animate-pulse'
                                                                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30 group-hover:bg-blue-400/30'
                                                            }`}>
                                                                {match.status === 'finished' || match.status === 'completed' ? 'FINISHED' :
                                                                 match.status === 'running' ? 'LIVE' : 'UPCOMING'}
                                                            </span>
                                                            {match.number_of_games && (
                                                                <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-xl text-xs font-bold border border-purple-500/30 backdrop-blur-sm group-hover:bg-purple-400/30 transition-all duration-300">
                                                                    BO{match.number_of_games}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-medium bg-slate-700/30 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-slate-600/20">
                                                            <div>{formatDateTime(match.begin_at).date}</div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span>{formatDateTime(match.begin_at).time}</span>
                                                                {match.end_at && (
                                                                    <>
                                                                        <span className="text-slate-500">→</span>
                                                                        <span>{formatDateTime(match.end_at).time}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Teams Section */}
                                                    <div className="flex items-center justify-center mb-6">
                                                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8 w-full max-w-md">
                                                                                                                    {/* Team 1 */}
                                                        <div className="flex flex-col items-center space-y-3">
                                                            <div 
                                                                className="relative w-16 h-16 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl border border-slate-600/30 shadow-xl overflow-hidden backdrop-blur-sm group-hover:scale-105 transition-transform duration-300 cursor-pointer hover:border-blue-400/50"
                                                                onClick={() => team1?.id && router.push(`/teams/${team1.id}`)}
                                                            >
                                                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
                                                                <Image
                                                                    src={getTeamImage(team1?.image_url || '')}
                                                                    alt={team1?.name || 'TBD'}
                                                                    fill
                                                                    className="object-contain p-2"
                                                                />
                                                            </div>
                                                            <div className="text-center">
                                                                <div 
                                                                    className={`text-sm font-bold transition-colors duration-300 cursor-pointer hover:text-blue-300 ${
                                                                        result?.winnerId === team1?.id ? 'text-emerald-400' : 'text-white'
                                                                    }`}
                                                                    onClick={() => team1?.id && router.push(`/teams/${team1.id}`)}
                                                                >
                                                                    {team1?.name || 'TBD'}
                                                                </div>
                                                                {(team1 as any)?.acronym && (
                                                                    <div className="text-xs text-slate-400 mt-1">{(team1 as any).acronym}</div>
                                                                )}
                                                            </div>
                                                            {result && (
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border-2 backdrop-blur-sm transition-all duration-300 ${
                                                                    result.winnerId === team1?.id 
                                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                                                                        : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                                                                }`}>
                                                                    {result.team1Score}
                                                                </div>
                                                            )}
                                                        </div>

                                                            {/* VS Divider */}
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600/30 to-slate-700/30 border border-slate-500/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                                                    <span className="text-slate-300 text-sm font-bold">VS</span>
                                                                </div>
                                                            </div>

                                                                                                                    {/* Team 2 */}
                                                        <div className="flex flex-col items-center space-y-3">
                                                            <div 
                                                                className="relative w-16 h-16 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl border border-slate-600/30 shadow-xl overflow-hidden backdrop-blur-sm group-hover:scale-105 transition-transform duration-300 cursor-pointer hover:border-blue-400/50"
                                                                onClick={() => team2?.id && router.push(`/teams/${team2.id}`)}
                                                            >
                                                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
                                                                <Image
                                                                    src={getTeamImage(team2?.image_url || '')}
                                                                    alt={team2?.name || 'TBD'}
                                                                    fill
                                                                    className="object-contain p-2"
                                                                />
                                                            </div>
                                                            <div className="text-center">
                                                                <div 
                                                                    className={`text-sm font-bold transition-colors duration-300 cursor-pointer hover:text-blue-300 ${
                                                                        result?.winnerId === team2?.id ? 'text-emerald-400' : 'text-white'
                                                                    }`}
                                                                    onClick={() => team2?.id && router.push(`/teams/${team2.id}`)}
                                                                >
                                                                    {team2?.name || 'TBD'}
                                                                </div>
                                                                {(team2 as any)?.acronym && (
                                                                    <div className="text-xs text-slate-400 mt-1">{(team2 as any).acronym}</div>
                                                                )}
                                                            </div>
                                                            {result && (
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border-2 backdrop-blur-sm transition-all duration-300 ${
                                                                    result.winnerId === team2?.id 
                                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                                                                        : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                                                                }`}>
                                                                    {result.team2Score}
                                                                </div>
                                                            )}
                                                        </div>
                                                        </div>
                                                    </div>

                                                    {/* Match Name */}
                                                    {(() => {
                                                        const cleanedName = cleanMatchName(match.name);
                                                        return cleanedName && (
                                                            <div className="text-center">
                                                                <div className="inline-block px-4 py-2 bg-gradient-to-r from-slate-600/20 to-slate-700/20 rounded-xl border border-slate-500/20 backdrop-blur-sm group-hover:bg-gradient-to-r group-hover:from-slate-500/30 group-hover:to-slate-600/30 transition-all duration-300">
                                                                    <span className="text-sm text-slate-200 font-medium">
                                                                        {cleanedName}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )
                                    }) : (
                                        <div className="text-center py-12">
                                            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                            <p className="text-gray-400">No matches found for this tournament</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6" ref={sidebarRef}>
                        {/* Tournament Info */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-orange-500/20 rounded-xl">
                                    <Trophy className="w-5 h-5 text-orange-400" />
                                </div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                    Tournament Info
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Dates and Times */}
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Calendar className="w-4 h-4 text-blue-400" />
                                            <span className="text-gray-300">Start Date:</span>
                                            <span className="text-white font-medium">{formatDateTime(tournament.begin_at).date}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm ml-6">
                                            <Clock className="w-4 h-4 text-blue-300" />
                                            <span className="text-gray-400">Time:</span>
                                            <span className="text-gray-200">{formatDateTime(tournament.begin_at).time}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Calendar className="w-4 h-4 text-red-400" />
                                            <span className="text-gray-300">End Date:</span>
                                            <span className="text-white font-medium">{formatDateTime(tournament.end_at).date}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm ml-6">
                                            <Clock className="w-4 h-4 text-red-300" />
                                            <span className="text-gray-400">Time:</span>
                                            <span className="text-gray-200">{formatDateTime(tournament.end_at).time}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Game */}
                                <div className="flex items-center space-x-2 text-sm">
                                    <Gamepad2 className="w-4 h-4 text-green-400" />
                                    <span className="text-gray-300">Game:</span>
                                    <span className="text-white">{tournament.videogame.name}</span>
                                </div>

                                {/* Region/Country */}
                                {(tournament.region || tournament.country) && (
                                    <div className="flex items-center space-x-2 text-sm">
                                        <MapPin className="w-4 h-4 text-purple-400" />
                                        <span className="text-gray-300">Location:</span>
                                        <span className="text-white">{tournament.country || tournament.region}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tournament Winner */}
                        {(() => {
                            const statusInfo = getTournamentStatus(tournament);
                            const winner = calculatedStandings.length > 0 ? calculatedStandings[0] : null;
                            
                            return (statusInfo.status === 'finished' && winner) && (
                                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 shadow-xl">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="p-2 bg-yellow-500/20 rounded-xl">
                                            <Crown className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                            Tournament Winner
                                        </h2>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 cursor-pointer hover:bg-yellow-500/15 transition-colors duration-300" onClick={() => router.push(`/teams/${winner.team.id}`)}>
                                            <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl border border-yellow-500/30 shadow-lg overflow-hidden backdrop-blur-sm">
                                                <Image
                                                    src={getTeamImage(winner.team.image_url || '')}
                                                    alt={winner.team.name}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-yellow-300 font-bold text-lg hover:text-yellow-200 transition-colors">{winner.team.name}</div>
                                                {winner.team.acronym && (
                                                    <div className="text-sm text-yellow-400/80">{winner.team.acronym}</div>
                                                )}
                                                <div className="text-xs text-gray-300 mt-1">
                                                    {winner.wins || 0}W - {winner.losses || 0}L {winner.win_rate ? `(${winner.win_rate.toFixed(1)}% WR)` : ''}
                                                </div>
                                            </div>
                                            <div className="text-yellow-400">
                                                <Crown className="w-8 h-8" />
                                            </div>
                                        </div>
                                        
                                        {/* Winning Team Roster */}
                                        {(() => {
                                            const winnerRoster = tournament?.expected_roster?.find(roster => roster.team.id === winner.team.id);
                                            return winnerRoster && winnerRoster.players && winnerRoster.players.length > 0 && (
                                                <div className="bg-yellow-500/5 rounded-xl p-4 border border-yellow-500/20">
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <Users className="w-4 h-4 text-yellow-400" />
                                                        <span className="text-sm font-bold text-yellow-300">Championship Roster</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {winnerRoster.players.map((player) => (
                                                            <div key={player.id} className="flex items-center space-x-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                                                <div className="relative w-6 h-6 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-full border border-yellow-500/30 overflow-hidden">
                                                                    {player.image_url ? (
                                                                        <Image
                                                                            src={player.image_url}
                                                                            alt={player.name}
                                                                            fill
                                                                            className="object-cover"
                                                                            onError={(e) => {
                                                                                const target = e.target as HTMLImageElement
                                                                                target.src = '/images/placeholder-player.svg'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-xs text-yellow-400 font-medium">
                                                                            {player.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm text-yellow-200 font-medium truncate">{player.name}</div>
                                                                    <div className="flex items-center space-x-2 text-xs">
                                                                        {player.role && (
                                                                            <span className="bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-500/30">
                                                                                {player.role}
                                                                            </span>
                                                                        )}
                                                                        {player.nationality && (
                                                                            <div className="flex items-center space-x-1">
                                                                                <div className="relative w-3 h-2">
                                                                                    {getFlagPath(player.nationality) ? (
                                                                                        <Image
                                                                                            src={getFlagPath(player.nationality)}
                                                                                            alt={`${player.nationality} flag`}
                                                                                            width={12}
                                                                                            height={8}
                                                                                            className="object-cover rounded-sm"
                                                                                            onError={(e) => {
                                                                                                const target = e.target as HTMLImageElement
                                                                                                target.style.display = 'none'
                                                                                                const parent = target.parentElement?.parentElement
                                                                                                if (parent) {
                                                                                                    parent.innerHTML = `<span class="text-xs text-yellow-400/70">${player.nationality}</span>`
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    ) : (
                                                                                        <span className="text-yellow-400/70">{player.nationality}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {player.age && (
                                                                            <span className="text-yellow-400/70">{player.age}y</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            );
                        })()}



                        {/* Tournament Standings */}
                        {calculatedStandings.length > 0 && (
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-green-500/20 rounded-xl">
                                        <Medal className="w-5 h-5 text-green-400" />
                                    </div>
                                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                        Standings
                                    </h2>
                                </div>
                                
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                    {calculatedStandings.slice(0, 8).map((standing) => (
                                        <div key={standing.team.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => router.push(`/teams/${standing.team.id}`)}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                standing.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                standing.rank === 2 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                                                standing.rank === 3 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                                            }`}>
                                                {standing.rank}
                                            </div>
                                            <div className="relative w-8 h-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-gray-600/40 shadow-lg overflow-hidden backdrop-blur-sm">
                                                <Image
                                                    src={getTeamImage(standing.team.image_url || '')}
                                                    alt={standing.team.name}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white font-medium truncate hover:text-blue-300 transition-colors">{standing.team.name}</div>
                                                <div className="text-xs text-gray-400">
                                                    {standing.wins || 0}W - {standing.losses || 0}L
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-green-400">{standing.wins || 0}</div>
                                                <div className="text-xs text-gray-400">wins</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Participating Teams */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-purple-500/20 rounded-xl">
                                    <Users className="w-5 h-5 text-purple-400" />
                                </div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                    Teams & Rosters
                                </h2>
                            </div>
                            
                            {tournament.expected_roster && tournament.expected_roster.length > 0 ? (
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {tournament.expected_roster.map((roster) => (
                                        <div key={roster.team.id} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                                            {/* Team Header */}
                                            <div className="flex items-center space-x-3 mb-3 cursor-pointer hover:bg-gray-600/20 rounded-lg p-2 -m-2 transition-colors" onClick={() => router.push(`/teams/${roster.team.id}`)}>
                                                <div className="relative w-10 h-10 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-gray-600/40 shadow-lg overflow-hidden backdrop-blur-sm">
                                                    <Image
                                                        src={getTeamImage(roster.team.image_url || '')}
                                                        alt={roster.team.name}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-white font-bold text-lg hover:text-blue-300 transition-colors">{roster.team.name}</div>
                                                    {roster.team.acronym && (
                                                        <div className="text-sm text-gray-400">{roster.team.acronym}</div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full border border-purple-500/30">
                                                    {roster.players.length} players
                                                </div>
                                            </div>
                                            
                                            {/* Players */}
                                            {roster.players && roster.players.length > 0 && (
                                                <div className="space-y-2">
                                                    {roster.players.map((player) => (
                                                        <div key={player.id} className="flex items-center space-x-3 p-2 bg-gray-600/20 rounded-lg hover:bg-gray-600/30 transition-colors">
                                                            <div className="relative w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border border-gray-600/40 overflow-hidden">
                                                                {player.image_url ? (
                                                                    <Image
                                                                        src={player.image_url}
                                                                        alt={player.name}
                                                                        fill
                                                                        className="object-cover"
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement
                                                                            target.src = '/images/placeholder-player.svg'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-medium">
                                                                        {player.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm text-white font-medium truncate">{player.name}</div>
                                                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                                    {player.role && (
                                                                        <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                                                                            {player.role}
                                                                        </span>
                                                                    )}
                                                                    {player.nationality && (
                                                                        <div className="flex items-center space-x-1">
                                                                            <div className="relative w-4 h-3">
                                                                                {getFlagPath(player.nationality) ? (
                                                                                    <Image
                                                                                        src={getFlagPath(player.nationality)}
                                                                                        alt={`${player.nationality} flag`}
                                                                                        width={16}
                                                                                        height={12}
                                                                                        className="object-cover rounded-sm"
                                                                                        onError={(e) => {
                                                                                            const target = e.target as HTMLImageElement
                                                                                            target.style.display = 'none'
                                                                                            const parent = target.parentElement?.parentElement
                                                                                            if (parent) {
                                                                                                parent.innerHTML = `<span class="text-xs text-gray-500">${player.nationality}</span>`
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <span className="text-gray-500">{player.nationality}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {player.age && (
                                                                        <span className="text-gray-500">{player.age}y</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : tournament.teams && tournament.teams.length > 0 ? (
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {tournament.teams.map((team) => (
                                        <div key={team.id} className="flex items-center space-x-3 p-3 bg-gray-700/40 rounded-lg hover:bg-gray-700/60 transition-colors cursor-pointer" onClick={() => router.push(`/teams/${team.id}`)}>
                                            <div className="relative w-8 h-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-gray-600/40 shadow-lg overflow-hidden backdrop-blur-sm">
                                                <Image
                                                    src={getTeamImage(team.image_url || '')}
                                                    alt={team.name}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white font-medium hover:text-blue-300 transition-colors">{team.name}</div>
                                                {team.acronym && (
                                                    <div className="text-xs text-gray-400">{team.acronym}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">No teams announced yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 
