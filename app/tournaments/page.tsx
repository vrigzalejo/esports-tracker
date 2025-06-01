'use client'

import { useState } from 'react'
import { Filter, Calendar } from 'lucide-react'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import TournamentCard from '@/components/tournaments/TournamentCard'
import { useTournaments } from '@/hooks/useEsportsData'

export default function TournamentsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedGame, setSelectedGame] = useState('all')
    const [selectedPeriod, setSelectedPeriod] = useState('all')

    const { data: tournaments, loading } = useTournaments({
        game: selectedGame
    })

    const filteredTournaments = tournaments.filter((tournament: any) => {
        const matchesSearch = tournament.name?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <Navigation activeTab="tournaments" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Tournaments
                    </h1>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedGame}
                                onChange={(e) => setSelectedGame(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                            >
                                <option value="all">All Games</option>
                                <option value="lol">League of Legends</option>
                                <option value="cs2">Counter-Strike 2</option>
                                <option value="dota2">Dota 2</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                            >
                                <option value="all">All Time</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="past">Past</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTournaments.map((tournament: any) => (
                            <TournamentCard key={tournament.id} tournament={tournament} />
                        ))}
                    </div>
                )}

                {filteredTournaments.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No tournaments found matching your criteria</p>
                    </div>
                )}
            </main>
        </div>
    )
}
