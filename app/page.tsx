'use client'

import { useState } from 'react'
import { Play, Trophy, Users, TrendingUp, ExternalLink } from 'lucide-react'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import StatCard from '@/components/ui/StatCard'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <Navigation activeTab="home" />

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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 cursor-pointer">
            <Play className="w-8 h-8 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Live Matches</h3>
            <p className="text-blue-100">Watch ongoing matches and get real-time updates</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 cursor-pointer">
            <Trophy className="w-8 h-8 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Tournaments</h3>
            <p className="text-purple-100">Explore upcoming and ongoing tournaments</p>
          </div>

          <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg p-6 hover:from-pink-500 hover:to-pink-700 transition-all duration-200 cursor-pointer">
            <Users className="w-8 h-8 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Teams</h3>
            <p className="text-pink-100">Browse teams and player statistics</p>
          </div>
        </div>

        {/* API Integration Notice */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <ExternalLink className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-100 font-medium mb-1">PandaScore API Integration</p>
              <p className="text-blue-200 mb-2">
                This demo uses mock data. To connect to PandaScore API, replace the mock data with actual API calls.
              </p>
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
      </main>
    </div>
  )
}
