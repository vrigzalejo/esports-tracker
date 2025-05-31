'use client'

import { useState, useEffect } from 'react'
import { Play, Trophy, Users, TrendingUp, Filter, ExternalLink } from 'lucide-react'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import StatCard from '@/components/ui/StatCard'
import MatchCard from '@/components/matches/MatchCard'
import TournamentCard from '@/components/tournaments/TournamentCard'
import TeamCard from '@/components/teams/TeamCard'

import { mockMatches, mockTournaments, mockTeams } from '@/lib/data'
import type { Match, Tournament, Team, TabType } from '@/types/esports'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('matches')
  const [matches, setMatches] = useState<Match[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGame, setSelectedGame] = useState('all')

  useEffect(() => {
    // Simulate API loading
    setLoading(true)

    // In production, replace with actual PandaScore API calls:
    // const fetchData = async () => {
    //   const [matchesRes, tournamentsRes, teamsRes] = await Promise.all([
    //     fetch('https://api.pandascore.co/matches?token=YOUR_TOKEN'),
    //     fetch('https://api.pandascore.co/tournaments?token=YOUR_TOKEN'),
    //     fetch('https://api.pandascore.co/teams?token=YOUR_TOKEN')
    //   ])
    //   
    //   setMatches(await matchesRes.json())
    //   setTournaments(await tournamentsRes.json())
    //   setTeams(await teamsRes.json())
    // }

    setTimeout(() => {
      setMatches(mockMatches)
      setTournaments(mockTournaments)
      setTeams(mockTeams)
      setLoading(false)
    }, 500)
  }, [])

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.opponents.some(opp =>
        opp.opponent.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesGame = selectedGame === 'all' || match.videogame.slug === selectedGame
    return matchesSearch && matchesGame
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Play}
              title="Live Matches"
              value="12"
              subtitle="Across all games"
              trend="+3"
            />
            <StatCard
              icon={Trophy}
              title="Active Tournaments"
              value="45"
              subtitle="This month"
            />
            <StatCard
              icon={Users}
              title="Top Teams"
              value="2,341"
              subtitle="Tracked globally"
            />
            <StatCard
              icon={TrendingUp}
              title="Total Prize Pool"
              value="$125M"
              subtitle="This year"
              trend="+15%"
            />
          </div>
        )}

        {/* Live Matches */}
        {activeTab === 'matches' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Live & Upcoming Matches
              </h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="all">All Games</option>
                  <option value="lol">League of Legends</option>
                  <option value="cs2">Counter-Strike 2</option>
                  <option value="dota2">Dota 2</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* API Integration Notice */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mx-4 mb-8 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <ExternalLink className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-100 font-medium mb-1">PandaScore API Integration</p>
            <p className="text-blue-200 mb-2">
              This demo uses mock data. To connect to PandaScore API, replace the mock data with actual API calls:
            </p>
            <div className="bg-blue-900/30 rounded-md p-3 mb-3">
              <ul className="text-blue-200 space-y-1 text-xs font-mono">
                <li>• Matches: <code className="bg-blue-800/50 px-1 rounded">GET /matches</code></li>
                <li>• Tournaments: <code className="bg-blue-800/50 px-1 rounded">GET /tournaments</code></li>
                <li>• Teams: <code className="bg-blue-800/50 px-1 rounded">GET /teams</code></li>
                <li>• Players: <code className="bg-blue-800/50 px-1 rounded">GET /players</code></li>
              </ul>
            </div>
            <p className="text-blue-200">
              Visit{' '}
              <a
                href="https://pandascore.co"
                className="text-blue-300 underline hover:text-blue-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                pandascore.co
              </a>
              {' '}to get your free API token.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
