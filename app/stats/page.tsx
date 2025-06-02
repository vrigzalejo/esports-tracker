'use client'

import { useState, useMemo } from 'react'
import { Play, Trophy, Users, TrendingUp, Calendar, Award, DollarSign, Globe } from 'lucide-react'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import StatCard from '@/components/ui/StatCard'
import { useMatches, useTournaments, useTeams, useGames } from '@/hooks/useEsportsData'
import type { Match, Tournament, Team } from '@/types/esports'

interface Game {
    id: string | number
    name: string
}

export default function StatsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    // Fetch all necessary data
    const { data: matches, loading: matchesLoading } = useMatches({
        per_page: 100,  // Get enough matches to calculate statistics
        sort: 'begin_at'
    })

    const { data: tournaments, loading: tournamentsLoading } = useTournaments()
    const { data: teams, loading: teamsLoading } = useTeams()
    const { games, loading: gamesLoading } = useGames()

    // Filter data based on search term
    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase().trim()
        if (!term) return { matches, tournaments, teams }

        return {
            matches: matches.filter((match: Match) => 
                match.name.toLowerCase().includes(term) ||
                match.videogame.name.toLowerCase().includes(term) ||
                match.league?.name?.toLowerCase().includes(term) ||
                match.opponents?.some(opp => 
                    opp.opponent?.name?.toLowerCase().includes(term)
                )
            ),
            tournaments: tournaments.filter((tournament: Tournament) =>
                tournament.name.toLowerCase().includes(term) ||
                tournament.league?.name?.toLowerCase().includes(term) ||
                tournament.videogame?.name?.toLowerCase().includes(term)
            ),
            teams: teams.filter((team: Team) =>
                team.name.toLowerCase().includes(term) ||
                team.location?.toLowerCase().includes(term)
            )
        }
    }, [matches, tournaments, teams, searchTerm])

    // Calculate statistics using filtered data
    const stats = useMemo(() => {
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        const startOfYear = new Date(now.getFullYear(), 0, 1)

        return {
            liveMatches: filteredData.matches.filter((match: Match) => match.status === 'running').length,
            matchesToday: filteredData.matches.filter((match: Match) => {
                const matchDate = new Date(match.begin_at)
                return matchDate >= startOfDay && matchDate <= endOfDay
            }).length,
            activeTournaments: filteredData.tournaments.filter((tournament: Tournament) => {
                const startDate = new Date(tournament.begin_at)
                const endDate = new Date(tournament.end_at)
                return now >= startDate && now <= endDate
            }).length,
            completedEvents: filteredData.tournaments.filter((tournament: Tournament) => {
                const endDate = new Date(tournament.end_at)
                return endDate < now && endDate >= startOfYear
            }).length,
            totalTeams: filteredData.teams.length,
            totalPrizePool: filteredData.tournaments.reduce((sum: number, tournament: Tournament) => {
                const prizePool = tournament.prize_pool?.replace(/[^0-9.]/g, '')
                return sum + (parseFloat(prizePool) || 0)
            }, 0),
            avgPrizePool: filteredData.tournaments.length > 0 ? 
                filteredData.tournaments.reduce((sum: number, tournament: Tournament) => {
                    const prizePool = tournament.prize_pool?.replace(/[^0-9.]/g, '')
                    return sum + (parseFloat(prizePool) || 0)
                }, 0) / filteredData.tournaments.length : 0,
            countries: new Set(filteredData.teams.map((team: Team) => team.location)).size,
            gameStats: (games as Game[]).reduce((acc: { [key: string]: number }, game) => {
                acc[game.name] = filteredData.matches.filter((match: Match) => match.videogame.name === game.name).length
                return acc
            }, {})
        }
    }, [filteredData, games])

    // Get top 3 games by active matches
    const topGames = useMemo(() => {
        return Object.entries(stats.gameStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
    }, [stats.gameStats])

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-8">
                    Statistics Overview
                </h1>

                {/* Main Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {matchesLoading ? (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
                            <div className="h-16 bg-gray-700 rounded-lg" />
                        </div>
                    ) : (
                        <StatCard
                            icon={Play}
                            title="Live Matches"
                            value={stats.liveMatches.toString()}
                            subtitle="Across all games"
                            trend={`${stats.liveMatches > 0 ? '+' : ''}${stats.liveMatches}`}
                        />
                    )}

                    {tournamentsLoading ? (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
                            <div className="h-16 bg-gray-700 rounded-lg" />
                        </div>
                    ) : (
                        <StatCard
                            icon={Trophy}
                            title="Active Tournaments"
                            value={stats.activeTournaments.toString()}
                            subtitle="Currently running"
                        />
                    )}

                    {teamsLoading ? (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
                            <div className="h-16 bg-gray-700 rounded-lg" />
                        </div>
                    ) : (
                        <StatCard
                            icon={Users}
                            title="Top Teams"
                            value={stats.totalTeams.toLocaleString()}
                            subtitle="Tracked globally"
                        />
                    )}

                    {tournamentsLoading ? (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
                            <div className="h-16 bg-gray-700 rounded-lg" />
                        </div>
                    ) : (
                        <StatCard
                            icon={TrendingUp}
                            title="Total Prize Pool"
                            value={`$${(stats.totalPrizePool / 1000000).toFixed(1)}M`}
                            subtitle="Active tournaments"
                            trend="+15%"
                        />
                    )}
                </div>

                {/* Additional Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {matchesLoading ? (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
                            <div className="h-16 bg-gray-700 rounded-lg" />
                        </div>
                    ) : (
                        <StatCard
                            icon={Calendar}
                            title="Matches Today"
                            value={stats.matchesToday.toString()}
                            subtitle="Scheduled"
                            trend={`${stats.matchesToday > 0 ? '+' : ''}${stats.matchesToday}`}
                        />
                    )}

                    {tournamentsLoading ? (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
                            <div className="h-16 bg-gray-700 rounded-lg" />
                        </div>
                    ) : (
                        <StatCard
                            icon={Award}
                            title="Completed Events"
                            value={stats.completedEvents.toString()}
                            subtitle="This year"
                        />
                    )}

                    {tournamentsLoading ? (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
                            <div className="h-16 bg-gray-700 rounded-lg" />
                        </div>
                    ) : (
                        <StatCard
                            icon={DollarSign}
                            title="Avg Prize Pool"
                            value={`$${(stats.avgPrizePool / 1000000).toFixed(1)}M`}
                            subtitle="Per tournament"
                            trend="+12%"
                        />
                    )}

                    {teamsLoading ? (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
                            <div className="h-16 bg-gray-700 rounded-lg" />
                        </div>
                    ) : (
                        <StatCard
                            icon={Globe}
                            title="Countries"
                            value={stats.countries.toString()}
                            subtitle="Represented"
                        />
                    )}
                </div>

                {/* Game-specific Statistics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
                    <h2 className="text-xl font-semibold mb-6">Game Statistics</h2>
                    {gamesLoading || matchesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                                    <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-2" />
                                    <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {topGames.map(([game, count], index) => (
                                <div key={game} className="text-center">
                                    <div className={`text-3xl font-bold ${
                                        index === 0 ? 'text-blue-400' :
                                        index === 1 ? 'text-orange-400' :
                                        'text-red-400'
                                    } mb-2`}>
                                        {count}
                                    </div>
                                    <div className="text-gray-300">{game}</div>
                                    <div className="text-sm text-gray-500">Active matches</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
                    {matchesLoading || tournamentsLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-700 animate-pulse">
                                    <div className="h-6 w-48 bg-gray-700 rounded" />
                                    <div className="h-6 w-24 bg-gray-700 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredData.matches.slice(0, 3).map((match: Match) => (
                                <div key={match.id} className="flex items-center justify-between py-3 border-b border-gray-700">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            match.status === 'running' ? 'bg-green-500' :
                                            match.status === 'finished' ? 'bg-blue-500' : 'bg-yellow-500'
                                        }`} />
                                        <span className="text-gray-300">{match.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {match.status === 'running' ? 'Live now' :
                                         match.status === 'finished' ? 'Just ended' : 'Starting soon'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
