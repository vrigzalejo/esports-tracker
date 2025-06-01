'use client'

import { useState } from 'react'
import { Filter, Users } from 'lucide-react'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import TeamCard from '@/components/teams/TeamCard'
import { useTeams } from '@/hooks/useEsportsData'

export default function TeamsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedGame, setSelectedGame] = useState('all')
    const [selectedRegion, setSelectedRegion] = useState('all')

    const { data: teams, loading } = useTeams({
        game: selectedGame
    })

    const filteredTeams = teams.filter((team: any) => {
        const matchesSearch = team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.acronym?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <Navigation activeTab="teams" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        Teams
                    </h1>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedGame}
                                onChange={(e) => setSelectedGame(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200"
                            >
                                <option value="all">All Games</option>
                                <option value="lol">League of Legends</option>
                                <option value="cs2">Counter-Strike 2</option>
                                <option value="dota2">Dota 2</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200"
                            >
                                <option value="all">All Regions</option>
                                <option value="na">North America</option>
                                <option value="eu">Europe</option>
                                <option value="asia">Asia</option>
                                <option value="kr">Korea</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team: any) => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>
                )}

                {filteredTeams.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No teams found matching your criteria</p>
                    </div>
                )}
            </main>
        </div>
    )
}
