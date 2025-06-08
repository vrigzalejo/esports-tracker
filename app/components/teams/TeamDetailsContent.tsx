'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, Users, Calendar, MapPin, Trophy, Gamepad2, Award, Globe, Clock, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'

interface Player {
    id: number
    name: string
    first_name: string
    last_name: string
    image_url: string
    nationality: string
    role: string
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
}

interface League {
    id: number
    name: string
    slug: string
    image_url: string | null
    url: string | null
    modified_at: string
    live_supported: boolean
    videogame: {
        id: number
        name: string
        slug: string
    } | null
    series: Array<{
        id: number
        name: string
        full_name: string
        slug: string
        year: number | null
        begin_at: string | null
        end_at: string | null
        modified_at: string
        description: string | null
        tier: string | null
        prizepool: string | null
        winner_id: number | null
        winner_type: string | null
    }>
    tournaments: Array<{
        id: number
        name: string
        slug: string
        tier: string | null
        begin_at: string | null
        end_at: string | null
        prizepool: string | null
        winner_id: number | null
        winner_type: string | null
        modified_at: string
    }>
}

interface Serie {
    id: number
    name: string
    full_name: string
    slug: string
    year: number | null
    begin_at: string | null
    end_at: string | null
    modified_at: string
    description: string | null
    tier: string | null
    prizepool: string | null
    winner_id: number | null
    winner_type: string | null
    league: {
        id: number
        name: string
        image_url: string | null
        slug: string
        url: string | null
    } | null
    videogame: {
        id: number
        name: string
        slug: string
    } | null
    tournaments: Array<{
        id: number
        name: string
        slug: string
        tier: string | null
        begin_at: string | null
        end_at: string | null
        prizepool: string | null
        winner_id: number | null
        winner_type: string | null
        modified_at: string
    }>
    matches: Array<{
        id: number
        name: string
        status: string
        begin_at: string
        end_at: string | null
        winner_id: number | null
        winner_type: string | null
        slug: string
        detailed_stats: boolean
        draw: boolean
        forfeit: boolean
    }>
}

interface TeamDetailsContentProps {
    teamId: string
}

export default function TeamDetailsContent({ teamId }: TeamDetailsContentProps) {
    const [team, setTeam] = useState<Team | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [leagues, setLeagues] = useState<League[]>([])
    const [series, setSeries] = useState<Serie[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true)
                
                // Fetch team details
                const teamResponse = await fetch(`/api/teams/${teamId}`)
                
                if (!teamResponse.ok) {
                    const errorData = await teamResponse.json()
                    throw new Error(errorData.error || 'Failed to fetch team details')
                }
                const teamData = await teamResponse.json()
                setTeam(teamData)

                // Fetch team matches
                const matchesResponse = await fetch(`/api/teams/${teamId}/matches`)
                if (matchesResponse.ok) {
                    const matchesData = await matchesResponse.json()
                    setMatches(matchesData)
                }

                // Fetch team tournaments
                const tournamentsResponse = await fetch(`/api/teams/${teamId}/tournaments`)
                if (tournamentsResponse.ok) {
                    const tournamentsData = await tournamentsResponse.json()
                    setTournaments(tournamentsData)
                }

                // Fetch team leagues
                const leaguesResponse = await fetch(`/api/teams/${teamId}/leagues`)
                if (leaguesResponse.ok) {
                    const leaguesData = await leaguesResponse.json()
                    setLeagues(leaguesData)
                }

                // Fetch team series
                const seriesResponse = await fetch(`/api/teams/${teamId}/series`)
                if (seriesResponse.ok) {
                    const seriesData = await seriesResponse.json()
                    setSeries(seriesData)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchTeamData()
    }, [teamId])

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
                hour12: true
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="flex items-center space-x-6 mb-8">
                            <div className="w-24 h-24 bg-gray-700 rounded-xl" />
                            <div className="flex-1">
                                <div className="h-8 w-64 bg-gray-700 rounded mb-2" />
                                <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
                                <div className="h-4 w-48 bg-gray-700 rounded" />
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
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
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
                            <div className="relative w-28 h-28 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-2xl border-2 border-gray-600/30 shadow-2xl overflow-hidden">
                                <Image
                                    src={getTeamImage(team.image_url)}
                                    alt={team.name}
                                    fill
                                    className="object-cover rounded-2xl"
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
                            {team.location && (
                                <div className="flex items-center space-x-2 text-gray-300">
                                    <div className="p-1.5 bg-gray-700/50 rounded-lg">
                                        <MapPin className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="font-medium">{team.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Matches */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                    Recent Matches
                                </h2>
                            </div>
                            {matches.length > 0 ? (
                                <div className="space-y-4">
                                    {matches.slice(0, 10).map((match) => {
                                        const result = getMatchResult(match, parseInt(teamId))
                                        const opponent = match.opponents.find(opp => opp.opponent.id !== parseInt(teamId))
                                        
                                        return (
                                            <div key={match.id} className="group relative bg-gradient-to-r from-gray-700/30 via-gray-700/40 to-gray-700/30 rounded-xl p-5 hover:from-gray-600/40 hover:via-gray-600/50 hover:to-gray-600/40 transition-all duration-300 border border-gray-600/30 hover:border-blue-500/30 shadow-lg hover:shadow-xl">
                                                {/* Subtle glow effect on hover */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                                                
                                                {/* Match Header with Teams */}
                                                <div className="relative z-10 flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="relative w-8 h-8">
                                                                <Image
                                                                    src={getTeamImage(team.image_url)}
                                                                    alt={team.name}
                                                                    fill
                                                                    className="object-cover rounded"
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium">{team.acronym || team.name}</span>
                                                        </div>
                                                        <span className="text-gray-400">vs</span>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="relative w-8 h-8">
                                                                <Image
                                                                    src={getTeamImage(opponent?.opponent.image_url || '')}
                                                                    alt={opponent?.opponent.name || 'TBD'}
                                                                    fill
                                                                    className="object-cover rounded"
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium">{opponent?.opponent.name || 'TBD'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        {result && (
                                                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                                result.isWin 
                                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                                                    : 'bg-red-500/20 text-red-400 border border-red-500/20'
                                                            }`}>
                                                                {result.teamScore} - {result.opponentScore}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col items-end text-xs">
                                                            <div className="flex items-center space-x-1 text-gray-300">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>{formatDateTime(match.begin_at).date}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1 text-gray-400">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{formatDateTime(match.begin_at).time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Competition Details */}
                                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-gray-800/30 rounded-lg p-4 border border-gray-600/20">
                                                    {/* League Information */}
                                                    <div className="flex items-start space-x-2">
                                                        <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                        <div className="flex flex-col space-y-1">
                                                            <span className="text-white font-medium">{match.league.name}</span>
                                                            <div className="flex items-center flex-wrap gap-2 text-gray-400">
                                                                {match.league.tier && (() => {
                                                                    const tierInfo = getTierDisplay(match.league.tier)
                                                                    return (
                                                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${tierInfo.bgColor} ${tierInfo.borderColor} ${tierInfo.color} border`}>
                                                                            <Star className="w-3 h-3" />
                                                                            <span>{tierInfo.label}</span>
                                                                        </div>
                                                                    )
                                                                })()}
                                                                {match.league.region && (
                                                                    <span className="flex items-center space-x-1 text-xs">
                                                                        <Globe className="w-3 h-3" />
                                                                        <span>{match.league.region}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Videogame Information */}
                                                    {match.videogame && (
                                                        <div className="flex items-center space-x-2">
                                                            <Gamepad2 className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                                            <span className="text-white font-medium">{match.videogame.name}</span>
                                                        </div>
                                                    )}

                                                    {/* Tournament Information */}
                                                    <div className="flex items-start space-x-2">
                                                        <Award className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                                                        <div className="flex flex-col space-y-1">
                                                            <span className="text-white font-medium">{match.tournament.name}</span>
                                                            <div className="flex flex-col space-y-1">
                                                                <div className="flex items-center flex-wrap gap-2">
                                                                    {match.tournament.tier && (() => {
                                                                        const tierInfo = getTierDisplay(match.tournament.tier)
                                                                        return (
                                                                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${tierInfo.bgColor} ${tierInfo.borderColor} ${tierInfo.color} border`}>
                                                                                <Star className="w-3 h-3" />
                                                                                <span>{tierInfo.label}</span>
                                                                            </div>
                                                                        )
                                                                    })()}
                                                                    {match.tournament.prizepool && (
                                                                        <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                                                                            {match.tournament.prizepool}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {(match.tournament.begin_at || match.tournament.end_at) && (
                                                                    <div className="flex flex-col space-y-0.5 text-xs text-gray-400">
                                                                        {match.tournament.begin_at && (
                                                                            <div className="flex items-center space-x-1">
                                                                                <Calendar className="w-3 h-3" />
                                                                                <span>Start: {formatDateTime(match.tournament.begin_at).date}</span>
                                                                            </div>
                                                                        )}
                                                                        {match.tournament.end_at && (
                                                                            <div className="flex items-center space-x-1">
                                                                                <Calendar className="w-3 h-3" />
                                                                                <span>End: {formatDateTime(match.tournament.end_at).date}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Serie Information */}
                                                    {match.serie && (
                                                        <div className="flex items-start space-x-2">
                                                            <Calendar className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                                                            <div className="flex flex-col space-y-1">
                                                                <span className="text-white font-medium">{match.serie.full_name || match.serie.name}</span>
                                                                <div className="flex flex-col space-y-1">
                                                                    <div className="flex items-center flex-wrap gap-2 text-gray-400">
                                                                        {match.serie.year && (
                                                                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30">
                                                                                {match.serie.year}
                                                                            </span>
                                                                        )}
                                                                        {match.serie.region && (
                                                                            <span className="flex items-center space-x-1 text-xs">
                                                                                <Globe className="w-3 h-3" />
                                                                                <span>{match.serie.region}</span>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {(match.serie.begin_at || match.serie.end_at) && (
                                                                        <div className="flex flex-col space-y-0.5 text-xs text-gray-400">
                                                                            {match.serie.begin_at && (
                                                                                <div className="flex items-center space-x-1">
                                                                                    <Calendar className="w-3 h-3" />
                                                                                    <span>Start: {formatDateTime(match.serie.begin_at).date}</span>
                                                                                </div>
                                                                            )}
                                                                            {match.serie.end_at && (
                                                                                <div className="flex items-center space-x-1">
                                                                                    <Calendar className="w-3 h-3" />
                                                                                    <span>End: {formatDateTime(match.serie.end_at).date}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Players */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-purple-500/20 rounded-xl">
                                    <Users className="w-5 h-5 text-purple-400" />
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                    Players
                                </h2>
                            </div>
                            {team.players && team.players.length > 0 ? (
                                <div className="space-y-4">
                                    {team.players.map((player) => (
                                        <div key={player.id} className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-700/30 to-gray-700/50 rounded-xl hover:from-gray-600/40 hover:to-gray-600/60 transition-all duration-300 border border-gray-600/30 hover:border-purple-500/40 shadow-md hover:shadow-lg">
                                            <div className="relative w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full overflow-hidden ring-2 ring-gray-600/50 group-hover:ring-purple-500/60 transition-all duration-300 shadow-lg">
                                                <Image
                                                    src={getPlayerImage(player.image_url)}
                                                    alt={player.name}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        target.src = '/images/placeholder-player.svg'
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-white">{player.name}</p>
                                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                    {player.role && (
                                                        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                                                            {player.role}
                                                        </span>
                                                    )}
                                                    {player.nationality && (
                                                        <span className="flex items-center space-x-1">
                                                            <Globe className="w-3 h-3" />
                                                            <span>{player.nationality}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                {(player.first_name || player.last_name) && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {[player.first_name, player.last_name].filter(Boolean).join(' ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-4">No players information available</p>
                            )}
                        </div>

                        {/* Tournaments */}
                        {tournaments.length > 0 && (
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-orange-500/20 rounded-xl">
                                        <Trophy className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                        Tournaments
                                    </h2>
                                </div>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {tournaments.slice(0, 10).map((tournament) => (
                                        <div key={tournament.id} className="group bg-gradient-to-r from-gray-700/30 via-gray-700/40 to-gray-700/30 rounded-xl p-4 hover:from-gray-600/40 hover:via-gray-600/50 hover:to-gray-600/40 transition-all duration-300 border border-gray-600/30 hover:border-orange-500/30 shadow-lg hover:shadow-xl">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-white font-semibold text-lg mb-1">{tournament.name}</h3>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs font-medium border border-orange-500/30">
                                                            {tournament.type}
                                                        </span>
                                                        {tournament.tier && (() => {
                                                            const tierInfo = getTierDisplay(tournament.tier)
                                                            return (
                                                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${tierInfo.bgColor} ${tierInfo.borderColor} ${tierInfo.color} border`}>
                                                                    <Star className="w-3 h-3" />
                                                                    <span>{tierInfo.label}</span>
                                                                </div>
                                                            )
                                                        })()}
                                                        {tournament.prizepool && (
                                                            <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                                                                {tournament.prizepool}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Tournament Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-gray-800/30 rounded-lg p-3 border border-gray-600/20">
                                                {tournament.league && (
                                                    <div className="flex items-center space-x-2">
                                                        <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                                                        <span className="text-white font-medium">{tournament.league.name}</span>
                                                    </div>
                                                )}
                                                {tournament.videogame && (
                                                    <div className="flex items-center space-x-2">
                                                        <Gamepad2 className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                                        <span className="text-white font-medium">{tournament.videogame.name}</span>
                                                    </div>
                                                )}
                                                {tournament.serie && (
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="w-3 h-3 text-green-400 flex-shrink-0" />
                                                        <span className="text-white font-medium">{tournament.serie.full_name || tournament.serie.name}</span>
                                                    </div>
                                                )}
                                                {tournament.matches && tournament.matches.length > 0 && (
                                                    <div className="flex items-center space-x-2">
                                                        <Award className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                                        <span className="text-white font-medium">{tournament.matches.length} matches</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tournament Dates */}
                                            {(tournament.begin_at || tournament.end_at) && (
                                                <div className="flex flex-col space-y-1 mt-3 text-xs text-gray-400">
                                                    {tournament.begin_at && (
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>Start: {formatDateTime(tournament.begin_at).date} at {formatDateTime(tournament.begin_at).time}</span>
                                                        </div>
                                                    )}
                                                    {tournament.end_at && (
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>End: {formatDateTime(tournament.end_at).date} at {formatDateTime(tournament.end_at).time}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Leagues */}
                        {leagues.length > 0 && (
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-green-500/20 rounded-xl">
                                        <Award className="w-5 h-5 text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                        Leagues
                                    </h2>
                                </div>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {leagues.slice(0, 10).map((league) => (
                                        <div key={league.id} className="group bg-gradient-to-r from-gray-700/30 via-gray-700/40 to-gray-700/30 rounded-xl p-4 hover:from-gray-600/40 hover:via-gray-600/50 hover:to-gray-600/40 transition-all duration-300 border border-gray-600/30 hover:border-green-500/30 shadow-lg hover:shadow-xl">
                                            <div className="flex items-start space-x-4 mb-3">
                                                {league.image_url && (
                                                    <div className="relative w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg overflow-hidden ring-2 ring-gray-600/50 group-hover:ring-green-500/60 transition-all duration-300 shadow-lg flex-shrink-0">
                                                        <Image
                                                            src={league.image_url}
                                                            alt={league.name}
                                                            fill
                                                            className="object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.src = '/images/placeholder-team.svg'
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="text-white font-semibold text-lg mb-1">{league.name}</h3>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        {league.videogame && (
                                                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30">
                                                                {league.videogame.name}
                                                            </span>
                                                        )}
                                                        {league.live_supported && (
                                                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs font-medium border border-red-500/30">
                                                                Live
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* League Statistics */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-gray-800/30 rounded-lg p-3 border border-gray-600/20">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                                    <span className="text-white font-medium">{league.series.length} Series</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                                                    <span className="text-white font-medium">{league.tournaments.length} Tournaments</span>
                                                </div>
                                                {league.url && (
                                                    <div className="flex items-center space-x-2">
                                                        <Globe className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                                        <a 
                                                            href={league.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
                                                        >
                                                            Official Site
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Recent Series */}
                                            {league.series.length > 0 && (
                                                <div className="mt-3">
                                                    <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Series</h4>
                                                    <div className="space-y-1">
                                                        {league.series.slice(0, 3).map((serie) => (
                                                            <div key={serie.id} className="flex items-center justify-between text-xs bg-gray-700/30 rounded p-2">
                                                                <div className="flex flex-col">
                                                                    <span className="text-white font-medium">{serie.full_name || serie.name}</span>
                                                                    <div className="flex items-center space-x-2 text-gray-400">
                                                                        {serie.year && (
                                                                            <span>{serie.year}</span>
                                                                        )}
                                                                        {serie.tier && (() => {
                                                                            const tierInfo = getTierDisplay(serie.tier)
                                                                            return (
                                                                                <span className={`px-1.5 py-0.5 rounded text-xs ${tierInfo.bgColor} ${tierInfo.color}`}>
                                                                                    {tierInfo.label}
                                                                                </span>
                                                                            )
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                                {serie.prizepool && (
                                                                    <span className="text-green-400 text-xs font-medium">
                                                                        {serie.prizepool}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Series */}
                        {series.length > 0 && (
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-blue-500/20 rounded-xl">
                                        <Calendar className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                        Series
                                    </h2>
                                </div>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {series.slice(0, 10).map((serie) => (
                                        <div key={serie.id} className="group bg-gradient-to-r from-gray-700/30 via-gray-700/40 to-gray-700/30 rounded-xl p-4 hover:from-gray-600/40 hover:via-gray-600/50 hover:to-gray-600/40 transition-all duration-300 border border-gray-600/30 hover:border-blue-500/30 shadow-lg hover:shadow-xl">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-white font-semibold text-lg mb-1">{serie.full_name || serie.name}</h3>
                                                    <div className="flex items-center flex-wrap gap-2 mb-2">
                                                        {serie.year && (
                                                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30">
                                                                {serie.year}
                                                            </span>
                                                        )}
                                                        {serie.tier && (() => {
                                                            const tierInfo = getTierDisplay(serie.tier)
                                                            return (
                                                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${tierInfo.bgColor} ${tierInfo.borderColor} ${tierInfo.color} border`}>
                                                                    <Star className="w-3 h-3" />
                                                                    <span>{tierInfo.label}</span>
                                                                </div>
                                                            )
                                                        })()}
                                                        {serie.prizepool && (
                                                            <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                                                                {serie.prizepool}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Serie Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-gray-800/30 rounded-lg p-3 border border-gray-600/20">
                                                {serie.league && (
                                                    <div className="flex items-center space-x-2">
                                                        <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                                                        <span className="text-white font-medium">{serie.league.name}</span>
                                                    </div>
                                                )}
                                                {serie.videogame && (
                                                    <div className="flex items-center space-x-2">
                                                        <Gamepad2 className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                                        <span className="text-white font-medium">{serie.videogame.name}</span>
                                                    </div>
                                                )}
                                                {serie.tournaments.length > 0 && (
                                                    <div className="flex items-center space-x-2">
                                                        <Award className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                                        <span className="text-white font-medium">{serie.tournaments.length} Tournaments</span>
                                                    </div>
                                                )}
                                                {serie.matches.length > 0 && (
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="w-3 h-3 text-green-400 flex-shrink-0" />
                                                        <span className="text-white font-medium">{serie.matches.length} Matches</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Serie Dates */}
                                            {(serie.begin_at || serie.end_at) && (
                                                <div className="flex flex-col space-y-1 mt-3 text-xs text-gray-400">
                                                    {serie.begin_at && (
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>Start: {formatDateTime(serie.begin_at).date} at {formatDateTime(serie.begin_at).time}</span>
                                                        </div>
                                                    )}
                                                    {serie.end_at && (
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>End: {formatDateTime(serie.end_at).date} at {formatDateTime(serie.end_at).time}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Description */}
                                            {serie.description && (
                                                <div className="mt-3 p-3 bg-gray-700/20 rounded-lg border border-gray-600/20">
                                                    <p className="text-xs text-gray-300 leading-relaxed">{serie.description}</p>
                                                </div>
                                            )}

                                            {/* Recent Tournaments */}
                                            {serie.tournaments.length > 0 && (
                                                <div className="mt-3">
                                                    <h4 className="text-sm font-medium text-gray-300 mb-2">Tournaments in this Series</h4>
                                                    <div className="space-y-1">
                                                        {serie.tournaments.slice(0, 3).map((tournament) => (
                                                            <div key={tournament.id} className="flex items-center justify-between text-xs bg-gray-700/30 rounded p-2">
                                                                <div className="flex flex-col">
                                                                    <span className="text-white font-medium">{tournament.name}</span>
                                                                    <div className="flex items-center space-x-2 text-gray-400">
                                                                        {tournament.tier && (() => {
                                                                            const tierInfo = getTierDisplay(tournament.tier)
                                                                            return (
                                                                                <span className={`px-1.5 py-0.5 rounded text-xs ${tierInfo.bgColor} ${tierInfo.color}`}>
                                                                                    {tierInfo.label}
                                                                                </span>
                                                                            )
                                                                        })()}
                                                                        {tournament.begin_at && (
                                                                            <span>{formatDateTime(tournament.begin_at).date}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {tournament.prizepool && (
                                                                    <span className="text-green-400 text-xs font-medium">
                                                                        {tournament.prizepool}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Competition Statistics */}
                        {matches.length > 0 && (
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                                        <Trophy className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                        Competition Overview
                                    </h2>
                                </div>
                                
                                {/* Games Played */}
                                <div className="mb-6 p-4 bg-gray-700/20 rounded-xl border border-gray-600/30">
                                    <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center">
                                        <div className="p-1.5 bg-blue-500/20 rounded-lg mr-3">
                                            <Gamepad2 className="w-4 h-4 text-blue-400" />
                                        </div>
                                        Games Played
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {Array.from(new Set(matches.map(match => match.videogame?.name).filter(Boolean))).map((game) => (
                                            <span key={game} className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/30 shadow-md hover:shadow-lg transition-all duration-200">
                                                {game}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Leagues Participated */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                                        <Award className="w-4 h-4 mr-2 text-purple-400" />
                                        Leagues & Tournaments
                                    </h3>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {Array.from(new Set(matches.map(match => `${match.league.name}|${match.tournament.name}`)))
                                            .slice(0, 10)
                                            .map((combined) => {
                                                const [leagueName, tournamentName] = combined.split('|')
                                                return (
                                                    <div key={combined} className="flex items-center justify-between text-sm bg-gray-700/30 rounded p-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-medium">{leagueName}</span>
                                                            <span className="text-gray-400 text-xs">{tournamentName}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </div>

                                {/* Match Statistics */}
                                <div className="p-4 bg-gray-700/20 rounded-xl border border-gray-600/30">
                                    <h3 className="text-sm font-semibold text-gray-200 mb-4">Recent Performance</h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="bg-gradient-to-br from-gray-600/30 to-gray-700/40 rounded-xl p-4 border border-gray-600/20 shadow-lg hover:shadow-xl transition-all duration-200">
                                            <div className="text-2xl font-bold text-white mb-1">{matches.length}</div>
                                            <div className="text-xs text-gray-300 font-medium">Total Matches</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-xl p-4 border border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-200">
                                            <div className="text-2xl font-bold text-green-400 mb-1">
                                                {matches.filter(match => {
                                                    const result = getMatchResult(match, parseInt(teamId))
                                                    return result?.isWin
                                                }).length}
                                            </div>
                                            <div className="text-xs text-green-200 font-medium">Wins</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-xl p-4 border border-red-500/20 shadow-lg hover:shadow-xl transition-all duration-200">
                                            <div className="text-2xl font-bold text-red-400 mb-1">
                                                {matches.filter(match => {
                                                    const result = getMatchResult(match, parseInt(teamId))
                                                    return result && !result.isWin
                                                }).length}
                                            </div>
                                            <div className="text-xs text-red-200 font-medium">Losses</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
} 