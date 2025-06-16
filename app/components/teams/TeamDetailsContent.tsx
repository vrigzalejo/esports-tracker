'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ArrowLeft, Users, Calendar, Trophy, Gamepad2, Award, Clock, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import { parseLeagueInfo } from '@/lib/textUtils'

interface Player {
    id: number
    name: string
    first_name: string
    last_name: string
    image_url: string
    nationality: string
    role: string
    age: number
    birthday: string | null
    active: boolean
    modified_at: string
}

interface Team {
    id: number
    name: string
    acronym: string
    image_url: string
    location: string
    players: Player[]
}

interface Match {
    id: number
    name: string
    status: string
    begin_at: string
    end_at?: string
    league: {
        name: string
        image_url: string
        region?: string
        tier?: string
    }
    serie: {
        name: string
        full_name: string
        year?: number
        region?: string
        begin_at?: string
        end_at?: string
    }
    tournament: {
        id: number
        name: string
        tier?: string
        region?: string
        prizepool?: string
        begin_at?: string
        end_at?: string
    }
    videogame: {
        name: string
        slug: string
    }
    videogame_version?: {
        name: string
        current?: boolean
    }
    opponents: Array<{
        opponent: {
            id: number
            name: string
            image_url: string
        }
    }>
    results: Array<{
        score: number
        team_id: number
    }>
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
    matches: Match[]
    teams?: Array<{
        team: Team
        players: Array<{
            id: number
            name: string
            first_name: string
            last_name: string
            image_url: string
            nationality: string
            age: number
            birthday: string | null
            active: boolean
            modified_at: string
        }>
    }>
    expected_roster?: Array<{
        team: {
            id: number
            name: string
            location: string
            slug: string
            modified_at: string
            acronym: string
            image_url: string
        }
        players: Array<{
            active: boolean
            id: number
            name: string
            role: string | null
            slug: string
            modified_at: string
            age: number
            birthday: string | null
            first_name: string
            last_name: string
            nationality: string
            image_url: string | null
        }>
    }>
}

interface TeamDetailsContentProps {
    teamId: string
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

// Match name formatting utility
const formatMatchName = (matchName: string | undefined | null): string => {
    if (!matchName || matchName.trim() === '') return '';
    
    // Split by colon to separate match type from teams
    const parts = matchName.split(':');
    if (parts.length < 2) return matchName;
    
    const matchType = parts[0].trim();
    const teamsInfo = parts.slice(1).join(':').trim();
    
    // Capitalize each word in the match type
    const capitalizedMatchType = matchType
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    return `${capitalizedMatchType}: ${teamsInfo}`;
}

export default function TeamDetailsContent({ teamId }: TeamDetailsContentProps) {
    const [team, setTeam] = useState<Team | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [matchFilter, setMatchFilter] = useState<'all' | 'wins' | 'losses'>('all')
    const router = useRouter()
    const sidebarRef = useRef<HTMLDivElement>(null)
    const tournamentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true)
                
                // Fetch tournaments and matches data in parallel
                const [tournamentsResponse, matchesResponse] = await Promise.all([
                    fetch(`/api/teams/${teamId}/tournaments`),
                    fetch(`/api/teams/${teamId}/matches`)
                ])
                
                if (!tournamentsResponse.ok) {
                    const errorData = await tournamentsResponse.json()
                    throw new Error(errorData.error || 'Failed to fetch tournaments data')
                }
                
                const tournamentsData = await tournamentsResponse.json()
                setTournaments(tournamentsData)
                
                // Extract team data from tournaments
                let extractedTeam = null
                
                for (const tournament of tournamentsData) {
                    // Extract team data from the first tournament that has this team
                    if (!extractedTeam && tournament.expected_roster) {
                        const rosterEntry = tournament.expected_roster.find((roster: any) => roster.team.id === parseInt(teamId)) // eslint-disable-line @typescript-eslint/no-explicit-any
                        if (rosterEntry) {
                            extractedTeam = {
                                id: rosterEntry.team.id,
                                name: rosterEntry.team.name,
                                acronym: rosterEntry.team.acronym || '',
                                image_url: rosterEntry.team.image_url || '',
                                location: rosterEntry.team.location || '',
                                players: rosterEntry.players || []
                            }
                        }
                    }
                }
                
                // Set the extracted team data
                if (extractedTeam) {
                    setTeam(extractedTeam)
                } else {
                    // Create a basic team object if not found in tournaments
                    setTeam({
                        id: parseInt(teamId),
                        name: 'Unknown Team',
                        acronym: '',
                        image_url: '',
                        location: '',
                        players: []
                    })
                }
                
                // Fetch and set matches data
                if (matchesResponse.ok) {
                    const matchesData = await matchesResponse.json()
                    // Sort matches by date (newest first)
                    matchesData.sort((a: any, b: any) => new Date(b.begin_at).getTime() - new Date(a.begin_at).getTime()) // eslint-disable-line @typescript-eslint/no-explicit-any
                    setMatches(matchesData)
                }
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchTeamData()
    }, [teamId])

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
    }, [tournaments, matches, team])

    const getTeamImage = (imageUrl: string) => {
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-team.svg'
    }

    const getPlayerImage = (imageUrl: string) => {
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-player.svg'
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

    const getMatchResult = (match: Match, teamId: number) => {
        if (!match.results || match.results.length === 0) return null
        
        const teamResult = match.results.find(r => r.team_id === teamId)
        const opponentResult = match.results.find(r => r.team_id !== teamId)
        
        if (!teamResult || !opponentResult) return null
        
        return {
            teamScore: teamResult.score,
            opponentScore: opponentResult.score,
            isWin: teamResult.score > opponentResult.score
        }
    }

    // Filter matches based on selected filter
    const getFilteredMatches = () => {
        if (matchFilter === 'all') return matches
        
        return matches.filter(match => {
            const result = getMatchResult(match, parseInt(teamId))
            if (!result) return false
            
            // Only include matches that have already happened (not upcoming)
            const isUpcoming = new Date(match.begin_at) > new Date()
            if (isUpcoming) return false
            
            if (matchFilter === 'wins') return result.isWin
            if (matchFilter === 'losses') return !result.isWin
            
            return false
        })
    }

    const filteredMatches = getFilteredMatches()

    const getFlagPath = (countryCode: string): string => {
        return countryCode ? `/flags/3x2/${countryCode}.svg` : ''
    }

    const formatBirthday = (birthday: string | null) => {
        if (!birthday) return null
        
        const date = new Date(birthday)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back button skeleton */}
                    <div className="h-6 w-16 bg-gray-700 rounded mb-6 animate-pulse" />
                    
                    {/* Team Header Skeleton */}
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
                        {/* Main Content - Tournaments Skeleton */}
                        <div className="lg:col-span-2">
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-orange-500/20 rounded-xl">
                                            <Trophy className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div className="h-8 w-32 bg-gray-700 rounded" />
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-xl px-4 py-2 border border-orange-500/20">
                                        <div className="h-6 w-8 bg-gray-700 rounded mb-1" />
                                        <div className="h-3 w-12 bg-gray-700 rounded" />
                                    </div>
                                </div>
                                
                                {/* Tournament Cards */}
                                <div className="space-y-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-gradient-to-r from-gray-700/30 via-gray-700/40 to-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                                            <div className="flex items-start space-x-4 mb-6">
                                                <div className="w-20 h-20 bg-gray-700 rounded-xl" />
                                                <div className="flex-1 space-y-3">
                                                    <div className="h-6 w-48 bg-gray-700 rounded" />
                                                    <div className="h-5 w-64 bg-gray-700 rounded" />
                                                    <div className="h-8 w-56 bg-gray-700 rounded" />
                                                    <div className="flex space-x-4">
                                                        <div className="h-4 w-24 bg-gray-700 rounded" />
                                                        <div className="h-4 w-20 bg-gray-700 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Roster skeleton */}
                                            <div className="mt-6 p-4 bg-gray-800/40 rounded-xl border border-gray-600/30">
                                                <div className="h-6 w-20 bg-gray-700 rounded mb-4" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {[...Array(5)].map((_, j) => (
                                                        <div key={j} className="flex items-center space-x-3 p-3 bg-gray-700/40 rounded-lg">
                                                            <div className="w-12 h-12 bg-gray-700 rounded-full" />
                                                            <div className="flex-1">
                                                                <div className="h-4 w-20 bg-gray-700 rounded mb-1" />
                                                                <div className="h-3 w-16 bg-gray-700 rounded" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Skeleton */}
                        <div className="space-y-6">
                            {/* Championships Skeleton */}
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                                        <Trophy className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <div className="h-6 w-40 bg-gray-700 rounded" />
                                </div>
                                <div className="h-12 w-full bg-gray-700 rounded mb-4" />
                                <div className="space-y-3">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="flex items-start space-x-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                                            <div className="w-8 h-8 bg-gray-700 rounded-lg" />
                                            <div className="flex-1">
                                                <div className="h-4 w-32 bg-gray-700 rounded mb-1" />
                                                <div className="h-3 w-24 bg-gray-700 rounded mb-1" />
                                                <div className="h-3 w-20 bg-gray-700 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Roster Skeleton */}
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-purple-500/20 rounded-xl">
                                        <Users className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div className="h-6 w-32 bg-gray-700 rounded" />
                                </div>
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-3 p-3 bg-gray-700/40 rounded-lg">
                                            <div className="w-10 h-10 bg-gray-700 rounded-full" />
                                            <div className="flex-1">
                                                <div className="h-4 w-24 bg-gray-700 rounded mb-1" />
                                                <div className="h-3 w-20 bg-gray-700 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Matches Skeleton */}
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-blue-500/20 rounded-xl">
                                        <Calendar className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="h-6 w-32 bg-gray-700 rounded" />
                                </div>
                                {/* Match Statistics */}
                                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-gray-600/30 rounded-lg p-2">
                                            <div className="h-4 w-8 bg-gray-700 rounded mb-1 mx-auto" />
                                            <div className="h-3 w-12 bg-gray-700 rounded mx-auto" />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                                            <div className="flex items-start space-x-4 mb-4">
                                                <div className="w-12 h-12 bg-gray-700 rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-40 bg-gray-700 rounded" />
                                                    <div className="h-3 w-32 bg-gray-700 rounded" />
                                                    <div className="h-3 w-28 bg-gray-700 rounded" />
                                                </div>
                                                <div className="h-6 w-16 bg-gray-700 rounded" />
                                            </div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-6">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-gray-700 rounded" />
                                                        <div className="h-3 w-12 bg-gray-700 rounded" />
                                                    </div>
                                                    <div className="h-3 w-6 bg-gray-700 rounded" />
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-gray-700 rounded" />
                                                        <div className="h-3 w-12 bg-gray-700 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="h-3 w-20 bg-gray-700 rounded" />
                                                <div className="h-3 w-24 bg-gray-700 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !team) {
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
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Team Not Found</h1>
                        <p className="text-gray-400">The team you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.</p>
                    </div>
                </div>
            </div>
        )
    }

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

                {/* Team Header */}
                <div className="relative bg-gradient-to-br from-gray-800/90 via-gray-800 to-gray-900 rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50" />
                    
                    <div className="relative z-10 flex items-center space-x-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
                            <div className="relative w-28 h-28 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-600/40 shadow-2xl overflow-hidden backdrop-blur-sm">
                                <Image
                                    src={getTeamImage(team.image_url)}
                                    alt={team.name}
                                    fill
                                    className="object-contain p-2"
                                    priority
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = '/images/placeholder-team.svg'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
                                {team.name}
                            </h1>
                            {team.acronym && (
                                <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-3">
                                    <span className="text-lg font-semibold text-blue-300">{team.acronym}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Tournaments */}
                    <div className="lg:col-span-2 flex">
                        {/* Tournaments */}
                        {tournaments.length > 0 && (
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
                                        {tournaments.map((tournament) => {
                                            // Find the expected roster for this team from expected_roster array
                                            const teamRoster = tournament.expected_roster?.find((roster: any) => roster.team.id === parseInt(teamId)) // eslint-disable-line @typescript-eslint/no-explicit-any
                                            const isChampion = tournament.winner_id === parseInt(teamId)
                                            
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
                                                        {tournament.league?.image_url && (
                                                            <div 
                                                                className="relative w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl overflow-hidden ring-2 ring-gray-600/50 group-hover:ring-orange-500/60 transition-all duration-300 shadow-lg flex-shrink-0 p-2 cursor-pointer hover:scale-105"
                                                                onClick={() => router.push(`/tournaments/${tournament.id}`)}
                                                            >
                                                                <div className="relative w-full h-full">
                                                                    <Image
                                                                        src={tournament.league.image_url}
                                                                        alt={tournament.league.name}
                                                                        fill
                                                                        className="object-contain"
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement
                                                                            target.src = '/images/placeholder-team.svg'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        
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

                                                    {/* Expected Roster for this Team */}
                                                    <div className="mt-6 p-4 bg-gray-800/40 rounded-xl border border-gray-600/30">
                                                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                                                            <Users className="w-5 h-5 mr-2 text-purple-400" />
                                                            Roster
                                                        </h4>

                                                        {teamRoster && teamRoster.players && teamRoster.players.length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {teamRoster.players.map((player: any) => ( /* eslint-disable-line @typescript-eslint/no-explicit-any */
                                                                    <div key={player.id} className="group">
                                                                        <div 
                                                                            className="bg-gray-800/60 rounded-xl hover:bg-gray-800/80 transition-all duration-200 border border-gray-700/30 hover:border-purple-500/50 overflow-hidden cursor-pointer"
                                                                            onClick={() => router.push(`/players/${player.id}`)}
                                                                        >
                                                                            {/* Player Image - Full Size */}
                                                                            <div className="relative w-full h-64 bg-gray-700 overflow-hidden">
                                                                                <Image
                                                                                    src={getPlayerImage(player.image_url)}
                                                                                    alt={player.name}
                                                                                    fill
                                                                                    className="object-cover object-top"
                                                                                    onError={(e) => {
                                                                                        const target = e.target as HTMLImageElement
                                                                                        target.src = '/images/placeholder-player.svg'
                                                                                    }}
                                                                                />
                                                                                
                                                                                {/* Active status indicator */}
                                                                                {!player.active && (
                                                                                    <div className="absolute top-3 right-3">
                                                                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" title="Inactive" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {/* Player Info */}
                                                                            <div className="p-3">
                                                                                <div className="text-center mb-3">
                                                                                    <h5 className="text-white font-semibold text-base mb-1">
                                                                                        {player.name}
                                                                                    </h5>
                                                                                    {(player.first_name || player.last_name) && (
                                                                                        <p className="text-xs text-gray-400 font-medium">
                                                                                            {[player.first_name, player.last_name].filter(Boolean).join(' ')}
                                                                                        </p>
                                                                                    )}
                                                                                </div>

                                                                                <div className="space-y-2">
                                                                                    {/* Nationality */}
                                                                                    {player.nationality && (
                                                                                        <div className="flex items-center justify-center space-x-2 text-gray-300 text-xs">
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
                                                                                                                parent.innerHTML = `<span class="text-xs text-gray-300">${player.nationality}</span>`
                                                                                                            }
                                                                                                        }}
                                                                                                    />
                                                                                                ) : (
                                                                                                    <span className="text-xs text-gray-300">{player.nationality}</span>
                                                                                                )}
                                                                                            </div>
                                                                                            <span>{player.nationality}</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Player Details */}
                                                                                    <div className="space-y-2">
                                                                                        {player.age > 0 && (
                                                                                            <div className="text-center text-sm text-gray-300">
                                                                                                Age {player.age}
                                                                                            </div>
                                                                                        )}
                                                                                        
                                                                                        {player.role && (
                                                                                            <div className="flex justify-center">
                                                                                                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                                                                                                    {player.role}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                        
                                                                                        {player.birthday && (
                                                                                            <div className="text-center text-xs text-gray-400">
                                                                                                {formatBirthday(player.birthday)}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6 text-gray-400">
                                                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                                <p className="text-sm">No roster information available</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6" ref={sidebarRef}>
                        {/* Recent Championships */}
                        {tournaments.filter(tournament => tournament.winner_id === parseInt(teamId)).length > 0 && (
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                                        <Trophy className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                        Recent Championships
                                    </h2>
                                </div>
                                
                                {/* Championships Count */}
                                <div className="mb-4">
                                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 rounded-lg p-2 border border-yellow-500/20 shadow-lg text-center">
                                        <div className="text-sm font-bold text-yellow-400 mb-0.5">
                                            {tournaments.filter(tournament => tournament.winner_id === parseInt(teamId)).length}
                                        </div>
                                        <div className="text-xs text-yellow-200 font-medium">Championships</div>
                                    </div>
                                </div>
                                
                                {/* Championship List */}
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {tournaments
                                        .filter(tournament => tournament.winner_id === parseInt(teamId))
                                        .map((tournament) => (
                                            <div key={tournament.id} className="flex items-start space-x-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10 hover:bg-yellow-500/10 transition-all duration-200 cursor-pointer" onClick={() => router.push(`/tournaments/${tournament.id}`)}>
                                                {/* League Image */}
                                                {tournament.league?.image_url && (
                                                    <div className="relative w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg overflow-hidden ring-1 ring-yellow-500/30 flex-shrink-0 p-1">
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                src={tournament.league.image_url}
                                                                alt={tournament.league.name}
                                                                fill
                                                                className="object-contain"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement
                                                                    target.src = '/images/placeholder-team.svg'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Tournament Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="text-sm font-bold text-yellow-200 hover:text-yellow-100 transition-colors">{parseLeagueInfo(tournament.name)}</span>
                                                        {tournament.tier && (() => {
                                                            const tierInfo = getTierDisplay(tournament.tier)
                                                            return (
                                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierInfo.color}`}>
                                                                    {tierInfo.label}
                                                                </span>
                                                            )
                                                        })()}
                                                    </div>
                                                    
                                                    {/* League and Serie */}
                                                    <div className="space-y-0.5">
                                                        {tournament.league && (
                                                            <div className="text-xs text-yellow-300/80 hover:text-yellow-300 transition-colors">
                                                                {tournament.league.name}
                                                            </div>
                                                        )}
                                                        {tournament.serie && (
                                                            <div className="text-xs text-yellow-300/60 hover:text-yellow-300/80 transition-colors">
                                                                {parseLeagueInfo(tournament.serie.full_name || tournament.serie.name)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Tournament Info */}
                                                    <div className="flex items-center justify-between mt-2">
                                                        <div className="text-xs space-y-0.5">
                                                            {tournament.begin_at && (
                                                                <div className="text-yellow-300/80 font-medium">
                                                                    {formatDateTime(tournament.begin_at).date} • {formatDateTime(tournament.begin_at).time}
                                                                </div>
                                                            )}
                                                            {tournament.end_at && (
                                                                <div className="text-yellow-300/60">
                                                                    {formatDateTime(tournament.end_at).date} • {formatDateTime(tournament.end_at).time}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {tournament.prizepool && (
                                                            <div className="text-xs text-green-400 font-bold">
                                                                {formatPrizePool(tournament.prizepool)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}



                                                {/* Recent Matches */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl h-[800px]">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                </div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                    Recent Matches
                                </h2>
                            </div>
                            
                            {/* Match Statistics */}
                            {matches.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                    <div 
                                        className={`rounded-lg p-2 border shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${
                                            matchFilter === 'all' 
                                                ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/40 border-blue-500/40' 
                                                : 'bg-gradient-to-br from-gray-600/30 to-gray-700/40 border-gray-600/20 hover:border-blue-500/30'
                                        }`}
                                        onClick={() => setMatchFilter('all')}
                                    >
                                        <div className={`text-sm font-bold mb-0.5 ${matchFilter === 'all' ? 'text-blue-300' : 'text-white'}`}>
                                            {matches.length}
                                        </div>
                                        <div className={`text-xs font-medium ${matchFilter === 'all' ? 'text-blue-200' : 'text-gray-300'}`}>
                                            Matches
                                        </div>
                                    </div>
                                    <div 
                                        className={`rounded-lg p-2 border shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${
                                            matchFilter === 'wins' 
                                                ? 'bg-gradient-to-br from-green-500/30 to-green-600/40 border-green-500/40' 
                                                : 'bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-500/20 hover:border-green-500/40'
                                        }`}
                                        onClick={() => setMatchFilter('wins')}
                                    >
                                        <div className={`text-sm font-bold mb-0.5 ${matchFilter === 'wins' ? 'text-green-300' : 'text-green-400'}`}>
                                            {matches.filter(match => {
                                                const result = getMatchResult(match, parseInt(teamId))
                                                return result?.isWin
                                            }).length}
                                        </div>
                                        <div className={`text-xs font-medium ${matchFilter === 'wins' ? 'text-green-200' : 'text-green-200'}`}>
                                            Wins
                                        </div>
                                    </div>
                                    <div 
                                        className={`rounded-lg p-2 border shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${
                                            matchFilter === 'losses' 
                                                ? 'bg-gradient-to-br from-red-500/30 to-red-600/40 border-red-500/40' 
                                                : 'bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/20 hover:border-red-500/40'
                                        }`}
                                        onClick={() => setMatchFilter('losses')}
                                    >
                                        <div className={`text-sm font-bold mb-0.5 ${matchFilter === 'losses' ? 'text-red-300' : 'text-red-400'}`}>
                                            {matches.filter(match => {
                                                const result = getMatchResult(match, parseInt(teamId))
                                                if (!result) return false
                                                
                                                // Only count matches that have already happened (not upcoming)
                                                const isUpcoming = new Date(match.begin_at) > new Date()
                                                if (isUpcoming) return false
                                                
                                                return !result.isWin
                                            }).length}
                                        </div>
                                        <div className={`text-xs font-medium ${matchFilter === 'losses' ? 'text-red-200' : 'text-red-200'}`}>
                                            Losses
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {matches.length > 0 ? (
                                <div className="space-y-4 overflow-y-auto pr-2 h-[600px]">
                                    {filteredMatches.map((match) => {
                                        const result = getMatchResult(match, parseInt(teamId))
                                        const opponent = match.opponents.find(opp => opp.opponent.id !== parseInt(teamId))
                                        
                                        return (
                                            <div key={match.id} className="group relative bg-gradient-to-r from-gray-700/30 via-gray-700/40 to-gray-700/30 rounded-xl p-4 hover:from-gray-600/40 hover:via-gray-600/50 hover:to-gray-600/40 transition-all duration-300 border border-gray-600/30 hover:border-blue-500/30 shadow-lg hover:shadow-xl">
                                                {/* Match Header */}
                                                <div className="flex items-start space-x-4 mb-4">
                                                    {/* League Image */}
                                                    {match.league?.image_url && (
                                                        <div className="relative w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg overflow-hidden ring-2 ring-gray-600/50 group-hover:ring-blue-500/60 transition-all duration-300 shadow-lg flex-shrink-0 p-1">
                                                            <div className="relative w-full h-full">
                                                                <Image
                                                                    src={match.league.image_url}
                                                                    alt={match.league.name}
                                                                    fill
                                                                    className="object-contain"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement
                                                                        target.src = '/images/placeholder-team.svg'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Match Info */}
                                                    <div className="flex-1">
                                                        <div className="flex flex-col space-y-1">
                                                            {/* Match Name */}
                                                            {match.name && (
                                                                <div className="flex items-center space-x-2">
                                                                    <Gamepad2 className="w-3 h-3 text-purple-400" />
                                                                    <span className="text-sm font-bold text-purple-300">{formatMatchName(match.name)}</span>
                                                                </div>
                                                            )}
                                                            
                                                            {/* League Name and Tier */}
                                                            {match.league && (
                                                                <div className="flex items-center space-x-2">
                                                                    <Trophy className="w-3 h-3 text-yellow-400" />
                                                                    <span 
                                                                        className="text-sm font-bold text-yellow-300 cursor-pointer hover:text-yellow-200 transition-colors"
                                                                        onClick={() => router.push(`/tournaments/${match.tournament.id}`)}
                                                                    >
                                                                        {match.league.name}
                                                                    </span>
                                                                    {match.tournament?.tier && (() => {
                                                                        const tierInfo = getTierDisplay(match.tournament.tier)
                                                                        return (
                                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierInfo.color}`}>
                                                                                {tierInfo.label}
                                                                            </span>
                                                                        )
                                                                    })()}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Serie Name */}
                                                            {match.serie && (
                                                                <div className="flex items-center space-x-2">
                                                                    <Calendar className="w-3 h-3 text-blue-400" />
                                                                    <span 
                                                                        className="text-xs font-semibold text-blue-300 cursor-pointer hover:text-blue-200 transition-colors"
                                                                        onClick={() => router.push(`/tournaments/${match.tournament.id}`)}
                                                                    >
                                                                        {parseLeagueInfo(match.serie.full_name || match.serie.name)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Tournament Name */}
                                                            {match.tournament && (
                                                                <div className="flex items-center space-x-2">
                                                                    <Award className="w-3 h-3 text-orange-400" />
                                                                    <span 
                                                                        className="text-xs font-bold text-white cursor-pointer hover:text-gray-200 transition-colors"
                                                                        onClick={() => router.push(`/tournaments/${match.tournament.id}`)}
                                                                    >
                                                                        {parseLeagueInfo(match.tournament.name)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Videogame and Version */}
                                                            <div className="flex items-center space-x-2">
                                                                <Gamepad2 className="w-3 h-3 text-green-400" />
                                                                <span className="text-xs text-green-300">
                                                                    {match.videogame.name}
                                                                    {match.videogame_version?.name && (
                                                                        <span className="text-green-400 ml-1">• {match.videogame_version.name}</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Match Result */}
                                                    {result && new Date(match.begin_at) <= new Date() && (
                                                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                            result.isWin 
                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                                                : 'bg-red-500/20 text-red-400 border border-red-500/20'
                                                        }`}>
                                                            {result.teamScore} - {result.opponentScore}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Upcoming Match Indicator */}
                                                    {new Date(match.begin_at) > new Date() && (
                                                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/20">
                                                            Upcoming
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Teams */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="relative w-6 h-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-gray-600/40 shadow-lg overflow-hidden backdrop-blur-sm">
                                                                <Image
                                                                    src={getTeamImage(team.image_url)}
                                                                    alt={team.name}
                                                                    fill
                                                                    className="object-contain p-0.5"
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium">{team.acronym || team.name}</span>
                                                        </div>
                                                        <span className="text-gray-400 text-xs">vs</span>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="relative w-6 h-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-gray-600/40 shadow-lg overflow-hidden backdrop-blur-sm">
                                                                <Image
                                                                    src={getTeamImage(opponent?.opponent.image_url || '')}
                                                                    alt={opponent?.opponent.name || 'TBD'}
                                                                    fill
                                                                    className="object-contain p-0.5"
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium">{opponent?.opponent.name || 'TBD'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Match Date/Time Information */}
                                                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                                                    {/* Date */}
                                                    <span className="text-gray-300">{formatDateTime(match.begin_at).date}</span>
                                                    
                                                    {/* Time Range */}
                                                    <div className="flex items-center space-x-1">
                                                        <span>{formatDateTime(match.begin_at).time}</span>
                                                        {match.end_at && (
                                                            <>
                                                                <span className="text-gray-500">-</span>
                                                                <span>{formatDateTime(match.end_at).time}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-8">No recent matches found</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
