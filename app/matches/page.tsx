'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import MatchCard from '@/components/matches/MatchCard'
import { useMatches } from '@/hooks/useEsportsData'

export default function MatchesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedGame, setSelectedGame] = useState('all')
    const [selectedStatus, setSelectedStatus] = useState('all')

    const { data: matches, loading } = useMatches({
        game: selectedGame,
        status: selectedStatus
    })

    const filteredMatches = matches.filter((match: any) => {
        const matchesSearch = match.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.opponents?.some((opp: any) =>
                opp.opponent?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        return matchesSearch
    })

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <Navigation activeTab="matches" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Matches
                    </h1>

                    <div className="flex items-center space-x-4">
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

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        >
                            <option value="all">All Status</option>
                            <option value="running">Live</option>
                            <option value="not_started">Upcoming</option>
                            <option value="finished">Finished</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMatches.map((match: any) => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                )}

                {filteredMatches.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No matches found matching your criteria</p>
                    </div>
                )}
            </main>
        </div>
    )
}
