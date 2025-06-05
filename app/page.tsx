'use client'

import { useState } from 'react'
import { Play, Trophy, Users, TrendingUp, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import StatCard from '@/components/ui/StatCard'
import { useMatches, useTournaments, useTeams } from '@/hooks/useEsportsData'
import { parseLeagueInfo, formatMatchDateRange } from '@/lib/textUtils'
import type { Match, Tournament } from '@/types/esports'

export default function HomePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  
  // Fetch data with appropriate filters
  const { data: matches, loading: matchesLoading } = useMatches({
    per_page: 50,  // Get enough matches to calculate statistics
    sort: 'begin_at'
  })

  const { data: tournaments, loading: tournamentsLoading } = useTournaments()

  const { data: teams, loading: teamsLoading } = useTeams()

  // Calculate statistics
  const stats = {
    liveMatches: matches.filter((match: Match) => match.status === 'running').length,
    activeTournaments: tournaments.filter((tournament: Tournament) => {
      const now = new Date()
      const startDate = new Date(tournament.begin_at)
      const endDate = new Date(tournament.end_at)
      return now >= startDate && now <= endDate
    }).length,
    totalTeams: teams.length,
    totalPrizePool: tournaments.reduce((sum: number, tournament: Tournament) => {
      const prizePool = tournament.prizepool?.replace(/[^0-9.]/g, '')
      return sum + (parseFloat(prizePool) || 0)
    }, 0)
  }

  // Handle quick action clicks
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'matches':
        router.push('/matches')
        break
      case 'tournaments':
        router.push('/tournaments')
        break
      case 'teams':
        router.push('/teams')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            EsportsTracker
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your ultimate destination for live matches, tournaments, and esports statistics
          </p>
        </div>

        {/* Statistics Overview */}
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
              value={stats.totalTeams.toString()}
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
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => handleQuickAction('matches')}
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <Play className="w-8 h-8 text-white" />
              <ExternalLink className="w-5 h-5 text-white/0 group-hover:text-white/100 transition-all duration-200" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Live Matches</h3>
            <p className="text-blue-100">Watch ongoing matches and get real-time updates</p>
          </button>

          <button
            onClick={() => handleQuickAction('tournaments')}
            className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-white" />
              <ExternalLink className="w-5 h-5 text-white/0 group-hover:text-white/100 transition-all duration-200" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Tournaments</h3>
            <p className="text-purple-100">Explore upcoming and ongoing tournaments</p>
          </button>

          <button
            onClick={() => handleQuickAction('teams')}
            className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg p-6 hover:from-pink-500 hover:to-pink-700 transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-white" />
              <ExternalLink className="w-5 h-5 text-white/0 group-hover:text-white/100 transition-all duration-200" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Teams</h3>
            <p className="text-pink-100">Browse teams and player statistics</p>
          </button>
        </div>

        {/* Latest Activity */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Play className="w-5 h-5 text-blue-400 mr-2" />
            Latest Matches
          </h2>
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <div className="space-y-4 pr-2">
              {matchesLoading ? (
                [...Array(50)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-700/50 animate-pulse">
                                          <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-700 rounded-full" />
                        <div className="flex flex-col space-y-1">
                          <div className="h-4 w-48 bg-gray-700 rounded" />
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-24 bg-gray-700 rounded" />
                            <div className="h-3 w-1 bg-gray-700 rounded" />
                            <div className="h-3 w-20 bg-gray-700 rounded" />
                          </div>
                        </div>
                      </div>
                    <div className="h-4 w-16 bg-gray-700 rounded" />
                  </div>
                ))
              ) : (
                matches.slice(0, 50).map((match: Match) => (
                  <button
                    key={match.id}
                    onClick={() => router.push(`/matches?game=${encodeURIComponent(match.videogame.slug)}`)}
                    className="w-full flex items-center justify-between py-3 border-b border-gray-700/50 hover:bg-gray-700/20 cursor-pointer rounded-lg px-3 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${
                          match.status === 'running' ? 'bg-red-500' :
                          match.status === 'finished' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        {match.status === 'running' && (
                          <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-300">{parseLeagueInfo(match.name)}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{match.videogame.name}</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-500">
                            {formatMatchDateRange(match, { includeYear: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {match.status === 'running' && (
                        <div className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-xs font-medium text-red-400">LIVE</span>
                        </div>
                      )}
                      {match.status === 'finished' && (
                        <div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/30">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <span className="text-xs font-medium text-blue-400">COMPLETED</span>
                        </div>
                      )}
                      {match.status === 'not_started' && (
                        <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" />
                          <span className="text-xs font-medium text-yellow-400">UPCOMING</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
