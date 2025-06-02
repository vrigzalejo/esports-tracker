'use client'

import { useState } from 'react'
import { Filter, Trophy } from 'lucide-react'
import { useTournaments } from '@/hooks/useEsportsData'
import { Tournament } from '@/types/esports'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import TournamentCard from '@/components/tournaments/TournamentCard'

export default function TournamentsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedGame, setSelectedGame] = useState('all')
    const [selectedRegion, setSelectedRegion] = useState('all')

    const { data: tournaments, loading } = useTournaments()

    const filteredTournaments = tournaments.filter((tournament: Tournament) => {
        const searchLower = searchQuery.toLowerCase()
        return tournament.name.toLowerCase().includes(searchLower)
    })

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchQuery} onSearchChange={setSearchQuery} />
            <Navigation />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold mb-4 md:mb-0">Tournaments</h1>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={selectedGame}
                                onChange={(e) => setSelectedGame(e.target.value)}
                                className="bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Filter by game"
                            >
                                <option value="all">All Games</option>
                                <option value="csgo">CS:GO</option>
                                <option value="dota2">Dota 2</option>
                                <option value="lol">League of Legends</option>
                                <option value="valorant">VALORANT</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-gray-400" />
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Filter by region"
                            >
                                <option value="all">All Regions</option>
                                <option value="na">North America</option>
                                <option value="eu">Europe</option>
                                <option value="asia">Asia</option>
                                <option value="sa">South America</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                                <div className="h-48 bg-gray-700 rounded-lg mb-4" />
                                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTournaments.map((tournament: Tournament) => (
                            <TournamentCard key={tournament.id} tournament={tournament} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
