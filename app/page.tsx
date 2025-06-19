'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Play, Trophy, Users, TrendingUp, ExternalLink, Clock, User } from 'lucide-react'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'

import { useMatches, useTournaments, useTeams } from '@/hooks/useEsportsData'
import { cleanMatchName, capitalizeWords } from '@/lib/textUtils'
import { getStatusColor, getStatusText, formatMatchDateSmart } from '@/lib/utils'
import { useCurrentTimezone } from '@/contexts/TimezoneContext'
import type { Match } from '@/types/esports'

// Note: Since this is a client component, metadata is handled in layout.tsx
// The root layout already has comprehensive metadata for the home page



// Custom hook for countdown functionality
function useCountdown(match: Match) {
  const [countdown, setCountdown] = useState('')
  const [isLive, setIsLive] = useState(false)
  const [isPast, setIsPast] = useState(false)
  const countdownInterval = useRef<NodeJS.Timeout | undefined>(undefined)

  const calculateCountdown = (matchData: Match) => {
    const now = new Date()
    const matchDate = new Date(matchData.scheduled_at || matchData.begin_at)
    const diff = matchDate.getTime() - now.getTime()

    // Check if match is in the past
    if (diff < 0) {
      if (matchData.status === 'running') {
        setIsLive(true)
        setIsPast(false)
        setCountdown('LIVE')
      } else {
        setIsLive(false)
        setIsPast(true)
        setCountdown('Completed')
      }
      return
    }

    setIsLive(false)
    setIsPast(false)

    // Calculate time units
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    // Format countdown string
    if (days > 0) {
      setCountdown(`${days}d ${hours}h ${minutes}m`)
    } else if (hours > 0) {
      setCountdown(`${hours}h ${minutes}m ${seconds}s`)
    } else {
      setCountdown(`${minutes}m ${seconds}s`)
    }
  }

  useEffect(() => {
    calculateCountdown(match)
    countdownInterval.current = setInterval(() => calculateCountdown(match), 1000)

    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current)
      }
    }
  }, [match])

  return { countdown, isLive, isPast }
}

// Component for individual match row with countdown - Mobile Responsive
function MatchRow({ match, router }: { match: Match; router: ReturnType<typeof useRouter> }) {
  const { countdown, isLive, isPast } = useCountdown(match)
  const currentTimezone = useCurrentTimezone()

  return (
    <button
      key={match.id}
      onClick={() => router.push(`/matches?game=${encodeURIComponent(match.videogame.slug)}`)}
      className="w-full flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 border-b border-gray-700/50 hover:bg-gray-700/20 cursor-pointer rounded-lg px-3 sm:px-4 transition-all duration-200 text-left group min-h-[44px]"
    >
      {/* Mobile Layout */}
      <div className="flex items-start space-x-3 sm:space-x-4 w-full">
        <div className="relative flex-shrink-0 mt-1">
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
            match.status === 'running' ? 'bg-red-500' :
            match.status === 'finished' ? 'bg-blue-500' : 'bg-yellow-500'
          }`} />
          {match.status === 'running' && (
            <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-ping opacity-75" />
          )}
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          {cleanMatchName(match.name) && (
            <div className="mb-1 sm:mb-2">
              <span className="text-sm sm:text-base font-bold text-purple-300 group-hover:text-purple-200 transition-colors duration-200 line-clamp-1">
                {cleanMatchName(match.name)}
              </span>
            </div>
          )}
          
          {/* Team Images and Names - Responsive */}
          <div className="flex items-center space-x-2 mb-2 flex-wrap">
            {match.opponents?.slice(0, 2).map((opponent, index) => (
              <div key={opponent.opponent.id || index} className="flex items-center space-x-2 min-w-0">
                <div className={`relative w-6 h-6 sm:w-8 sm:h-8 ${
                  opponent.type === 'Player' 
                    ? 'bg-gradient-to-br from-gray-600/80 to-gray-700/80 rounded-lg' 
                    : 'bg-gray-600/60 rounded-xl'
                } border border-gray-700/40 hover:border-gray-600/60 transition-colors duration-200 overflow-hidden flex-shrink-0`}>
                  <Image
                    src={opponent.opponent.image_url || (opponent.type === 'Player' ? '/images/placeholder-player.svg' : '/images/placeholder-team.svg')}
                    alt={opponent.opponent.name}
                    fill
                    className={opponent.type === 'Player' ? 'object-cover' : 'object-contain rounded-xl p-0.5'}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = opponent.type === 'Player' ? '/images/placeholder-player.svg' : '/images/placeholder-team.svg'
                    }}
                  />
                </div>
                <span className="text-sm sm:text-base text-gray-300 font-medium truncate max-w-[120px] sm:max-w-none group-hover:text-white transition-colors duration-200">
                  {opponent.opponent.name}
                </span>
                {index === 0 && match.opponents.length > 1 && (
                  <span className="text-xs sm:text-sm text-gray-500 mx-1 flex-shrink-0">vs</span>
                )}
              </div>
            ))}
          </div>
          
                     {/* League, Serie, Tournament Info - Mobile Responsive */}
           <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
             {match.league?.name && (
               <span className="text-xs sm:text-sm text-blue-400 font-medium bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-500/20 truncate max-w-[100px] sm:max-w-none">
                 {match.league.name}
               </span>
             )}
             {match.serie?.full_name && (
               <span className="text-xs sm:text-sm text-green-400 font-medium bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-500/20 truncate max-w-[120px] sm:max-w-none">
                 {capitalizeWords(match.serie.full_name)}
               </span>
             )}
             {match.tournament?.name && (
               <span className="text-xs sm:text-sm text-yellow-400 font-medium bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 truncate max-w-[100px] sm:max-w-none">
                 {match.tournament.name}
               </span>
             )}
           </div>
          
          {/* Game and Date Info - Mobile Layout */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">{match.videogame.name}</span>
            <span className="text-xs sm:text-sm text-gray-500 hidden sm:block">•</span>
            <span className="text-xs sm:text-sm text-gray-500">
              {formatMatchDateSmart(match.scheduled_at || match.begin_at, currentTimezone, { includeYear: true })}
            </span>
          </div>
        </div>
      </div>
      
      {/* Status and Countdown - Mobile Responsive */}
      <div className="flex items-center justify-between sm:justify-end space-x-2 mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                 {/* Countdown Timer - MatchCard Style */}
         {!isPast && countdown && !isLive && match.status === 'not_started' && (
           <div className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
             <Clock className="w-3 h-3 mr-2" />
             <span>{countdown}</span>
           </div>
         )}
         
                   {/* Status Badge - MatchCard Style */}
          <div className="flex items-center space-x-2 bg-gray-800/60 rounded-lg px-3 py-1.5 border border-gray-700/40">
            {match.status === 'running' ? (
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            ) : (
              <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(match.status)}`} />
            )}
            <span className="text-xs font-medium text-gray-200">{getStatusText(match.status)}</span>
          </div>
      </div>
    </button>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch data for statistics
  const { data: matches, loading: matchesLoading } = useMatches({ per_page: 100 })
  const { data: tournaments, loading: tournamentsLoading } = useTournaments({ per_page: 50 })
  const { data: teams, loading: teamsLoading } = useTeams({ per_page: 50 })

  // Calculate realistic statistics based on limited sample data
  const stats = {
    liveMatches: matches?.filter(match => match.status === 'running').length || 0,
    upcomingMatches: matches?.filter(match => match.status === 'not_started').length || 0,
    totalActiveMatches: (matches?.filter(match => match.status === 'running' || match.status === 'not_started').length || 0),
    activeTournaments: tournaments?.filter(tournament => tournament.status !== 'finished').length || 0,
    featuredTeams: teams?.length || 0,
    samplePrizePool: tournaments?.reduce((total, tournament) => {
      if (!tournament.prizepool) return total
      
      // Handle different currency formats and extract numeric value
      let prizepool = tournament.prizepool.toLowerCase()
      let multiplier = 1
      
      // Check for K/M suffixes
      if (prizepool.includes('k') && !prizepool.includes('m')) {
        multiplier = 1000
        prizepool = prizepool.replace(/k/g, '')
      } else if (prizepool.includes('m')) {
        multiplier = 1000000
        prizepool = prizepool.replace(/m/g, '')
      }
      
      // Extract numeric value (remove currency symbols and text)
      const numericValue = parseFloat(prizepool.replace(/[^0-9.]/g, ''))
      
      if (isNaN(numericValue)) return total
      
      return total + (numericValue * multiplier)
    }, 0) || 0
  }

  // Format prize pool display
  const formatPrizePool = (amount: number): string => {
    if (amount === 0) return 'TBD'
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    } else {
      return `$${amount.toLocaleString()}`
    }
  }

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
      case 'players':
        router.push('/players')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header searchTerm={searchTerm} onSearch={setSearchTerm} />
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 main-content">
        {/* Hero Section - Mobile Responsive */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3 sm:mb-4 px-2 animate-gradient-x bg-300% hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 transition-all duration-500 hover:animate-neon-glow animate-glitch cursor-default">
            EsportsTracker
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-2xl mx-auto px-3 sm:px-4 leading-relaxed">
            Your ultimate destination for live matches, tournaments, and esports statistics
          </p>
        </div>

        {/* Statistics Overview - Fully Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-blue-500/20 min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-blue-300 font-medium">Live & Upcoming</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.totalActiveMatches}</p>
              </div>
              <div className="bg-blue-500/20 p-1.5 sm:p-2 rounded-lg">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-blue-300/70 mt-1">
              {stats.liveMatches > 0 ? `${stats.liveMatches} live now` : 'Ready to start'}
            </p>
          </div>

          {tournamentsLoading ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-700/50 animate-pulse">
              <div className="h-12 sm:h-16 lg:h-20 bg-gray-700/50 rounded-lg" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-purple-500/20 min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-300 font-medium">Active Events</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.activeTournaments}</p>
                </div>
                <div className="bg-purple-500/20 p-1.5 sm:p-2 rounded-lg">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-purple-300/70 mt-1">
                {stats.activeTournaments > 5 ? `${stats.activeTournaments} active` : 'Running tournaments'}
              </p>
            </div>
          )}

          {teamsLoading ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-700/50 animate-pulse">
              <div className="h-12 sm:h-16 lg:h-20 bg-gray-700/50 rounded-lg" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-green-500/20 min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-300 font-medium">Featured Teams</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.featuredTeams}</p>
                </div>
                <div className="bg-green-500/20 p-1.5 sm:p-2 rounded-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </div>
              </div>
              <p className="text-xs text-green-300/70 mt-1">
                {stats.featuredTeams >= 50 ? '50+ teams' : 'Top performers'}
              </p>
            </div>
          )}

          {tournamentsLoading ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-700/50 animate-pulse">
              <div className="h-12 sm:h-16 lg:h-20 bg-gray-700/50 rounded-lg" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-orange-500/20 min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-orange-300 font-medium">Prize Pool</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{formatPrizePool(stats.samplePrizePool)}</p>
                </div>
                <div className="bg-orange-500/20 p-1.5 sm:p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                </div>
              </div>
              <p className="text-xs text-orange-300/70 mt-1">
                {stats.samplePrizePool > 1000000 ? "Multi-million" : stats.samplePrizePool > 0 ? "Active" : "Current events"}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions - Mobile Responsive - Made Smaller */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
          <button
            onClick={() => handleQuickAction('matches')}
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 text-left group cursor-pointer min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white/0 group-hover:text-white/100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-blue-100 transition-colors duration-200">Live Matches</h3>
            <p className="text-blue-100 text-xs sm:text-sm leading-tight opacity-90 group-hover:opacity-100 transition-opacity duration-200">Watch live matches</p>
          </button>

          <button
            onClick={() => handleQuickAction('tournaments')}
            className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 text-left group cursor-pointer min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white/0 group-hover:text-white/100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-purple-100 transition-colors duration-200">Tournaments</h3>
            <p className="text-purple-100 text-xs sm:text-sm leading-tight opacity-90 group-hover:opacity-100 transition-opacity duration-200">Explore tournaments</p>
          </button>

          <button
            onClick={() => handleQuickAction('teams')}
            className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:from-pink-500 hover:to-pink-700 transition-all duration-200 text-left group cursor-pointer min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white/0 group-hover:text-white/100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-pink-100 transition-colors duration-200">Teams</h3>
            <p className="text-pink-100 text-xs sm:text-sm leading-tight opacity-90 group-hover:opacity-100 transition-opacity duration-200">Browse teams</p>
          </button>

          <button
            onClick={() => handleQuickAction('players')}
            className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:from-green-500 hover:to-green-700 transition-all duration-200 text-left group cursor-pointer min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white/0 group-hover:text-white/100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-green-100 transition-colors duration-200">Players</h3>
            <p className="text-green-100 text-xs sm:text-sm leading-tight opacity-90 group-hover:opacity-100 transition-opacity duration-200">Discover players</p>
          </button>
        </div>

        {/* Latest Activity - Mobile Responsive - Emphasized */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border-2 border-blue-500/30 shadow-2xl shadow-blue-500/10">
          <div className="flex items-center justify-between mb-6 sm:mb-7 lg:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400 mr-3 flex-shrink-0 animate-pulse" />
              <span className="truncate">
                {searchTerm ? (
                  <>
                    <span className="hidden sm:inline">Search Results for &ldquo;</span>
                    <span className="sm:hidden">Results for &ldquo;</span>
                    {searchTerm}&rdquo;
                  </>
                ) : (
                  'Latest Matches'
                )}
              </span>
            </h2>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          </div>
          
          {/* Scrollable Match List - Mobile Optimized - Increased Height */}
          <div className="max-h-80 sm:max-h-96 lg:max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 rounded-lg">
            <div className="space-y-2 sm:space-y-3 lg:space-y-4 pr-2">
              {matchesLoading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="w-full flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 border-b border-gray-700/50 hover:bg-gray-700/20 rounded-lg px-3 sm:px-4 transition-all duration-200 animate-pulse min-h-[44px]">
                    <div className="flex items-start space-x-3 sm:space-x-4 w-full">
                      {/* Status indicator */}
                      <div className="relative flex-shrink-0 mt-1">
                        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                          i % 3 === 0 ? 'bg-red-500/50' :
                          i % 3 === 1 ? 'bg-blue-500/50' : 'bg-yellow-500/50'
                        }`} />
                      </div>
                      
                      <div className="flex flex-col flex-1 min-w-0">
                        {/* Match name skeleton */}
                        {i % 2 === 0 && (
                          <div className="mb-1 sm:mb-2">
                            <div className="h-4 sm:h-5 w-24 sm:w-32 bg-purple-300/20 rounded" />
                          </div>
                        )}
                        
                        {/* Team Images and Names */}
                        <div className="flex items-center space-x-2 mb-2 flex-wrap">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 ${
                              i % 2 === 0 ? 'bg-gray-600/50 rounded-xl' : 'bg-gradient-to-br from-gray-600/50 to-gray-700/50 rounded-lg'
                            } border border-gray-700/40 flex-shrink-0`} />
                            <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-300/30 rounded" />
                            <span className="text-xs sm:text-sm text-gray-500 mx-1 flex-shrink-0">vs</span>
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 ${
                              i % 2 === 1 ? 'bg-gray-600/50 rounded-xl' : 'bg-gradient-to-br from-gray-600/50 to-gray-700/50 rounded-lg'
                            } border border-gray-700/40 flex-shrink-0`} />
                            <div className="h-3 sm:h-4 w-10 sm:w-14 bg-gray-300/30 rounded" />
                          </div>
                        </div>
                        
                                                 {/* League, Serie, Tournament Info */}
                         <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
                           <div className="h-6 w-16 sm:w-20 bg-blue-400/20 rounded-lg border border-blue-500/20" />
                           <div className="h-6 w-18 sm:w-24 bg-green-400/20 rounded-lg border border-green-500/20" />
                           <div className="h-6 w-14 sm:w-18 bg-yellow-400/20 rounded-lg border border-yellow-500/20" />
                         </div>
                        
                        {/* Game and date info */}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <div className="h-3 w-12 sm:w-16 bg-gray-500/30 rounded" />
                          <div className="h-3 w-16 sm:w-20 bg-gray-500/30 rounded" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Status badge */}
                    <div className="flex items-center justify-between sm:justify-end space-x-2 mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                      <div className={`flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full border backdrop-blur-sm ${
                        i % 3 === 0 ? 'bg-red-500/20 border-red-500/30' :
                        i % 3 === 1 ? 'bg-blue-500/20 border-blue-500/30' : 'bg-yellow-500/20 border-yellow-500/30'
                      }`}>
                        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                          i % 3 === 0 ? 'bg-red-500/50' :
                          i % 3 === 1 ? 'bg-blue-500/50' : 'bg-yellow-500/50'
                        }`} />
                        <div className={`h-3 sm:h-4 w-12 sm:w-16 rounded ${
                          i % 3 === 0 ? 'bg-red-400/30' :
                          i % 3 === 1 ? 'bg-blue-400/30' : 'bg-yellow-400/30'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Filter and process matches
                (() => {
                  const filteredMatches = matches
                    .filter((match: Match) => {
                      if (!searchTerm || searchTerm.trim() === '') return true;
                      
                      const searchTermLower = searchTerm.toLowerCase().trim();
                      
                      // Search in match name
                      const matchName = match.name?.toLowerCase() || '';
                      
                      // Search in league name
                      const leagueName = match.league?.name?.toLowerCase() || '';
                      
                      // Search in serie name
                      const serieName = match.serie?.name?.toLowerCase() || '';
                      
                      // Search in tournament name
                      const tournamentName = match.tournament?.name?.toLowerCase() || '';
                      
                      // Search in videogame name
                      const videogameName = match.videogame?.name?.toLowerCase() || '';
                      
                      // Search in opponents
                      const opponentNames = match.opponents?.map(opp => opp.opponent.name.toLowerCase()).join(' ') || '';
                      
                      // Check if search term matches any of these fields
                      return matchName.includes(searchTermLower) ||
                             leagueName.includes(searchTermLower) ||
                             serieName.includes(searchTermLower) ||
                             tournamentName.includes(searchTermLower) ||
                             videogameName.includes(searchTermLower) ||
                             opponentNames.includes(searchTermLower);
                    })
                    .sort((a: Match, b: Match) => {
                      // First priority: live matches
                      if (a.status === 'running' && b.status !== 'running') return -1;
                      if (b.status === 'running' && a.status !== 'running') return 1;
                      
                      // Second priority: upcoming matches (ascending order - soonest first)
                      if (a.status === 'not_started' && b.status === 'not_started') {
                        const dateA = new Date(a.scheduled_at || a.begin_at).getTime();
                        const dateB = new Date(b.scheduled_at || b.begin_at).getTime();
                        return dateA - dateB; // Ascending order for upcoming matches
                      }
                      
                      // Third priority: upcoming matches before finished matches
                      if (a.status === 'not_started' && b.status === 'finished') return -1;
                      if (b.status === 'not_started' && a.status === 'finished') return 1;
                      
                      // Fourth priority: finished matches (most recent first)
                      const dateA = new Date(a.begin_at).getTime();
                      const dateB = new Date(b.begin_at).getTime();
                      return dateB - dateA;
                    })
                    .slice(0, 50);

                  // Show no results message if search term exists but no matches found
                  if (searchTerm && searchTerm.trim() !== '' && filteredMatches.length === 0) {
                    return (
                      <div className="text-center py-6 sm:py-8">
                        <div className="text-gray-400 mb-2 text-sm sm:text-base">
                          No matches found for &ldquo;{searchTerm}&rdquo;
                        </div>
                        <div className="text-gray-500 text-xs sm:text-sm">
                          Try searching for a different term or check your spelling
                        </div>
                      </div>
                    );
                  }

                  return filteredMatches.map((match: Match) => (
                    <MatchRow key={match.id} match={match} router={router} />
                  ));
                })()
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


