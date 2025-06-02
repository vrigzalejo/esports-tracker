'use client'

import { useState } from 'react'
import { Filter, Users } from 'lucide-react'
import { useTeams } from '@/hooks/useEsportsData'
import { Team } from '@/types/esports'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import TeamCard from '@/components/teams/TeamCard'

export default function TeamsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedGame, setSelectedGame] = useState('all')
    const [selectedRegion, setSelectedRegion] = useState('all')

    const { data: teams, loading } = useTeams()

    const filteredTeams = teams.filter((team: Team) => {
        const searchLower = searchQuery.toLowerCase()
        return (
            team.name.toLowerCase().includes(searchLower) ||
            team.acronym.toLowerCase().includes(searchLower) ||
            team.location.toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchQuery} onSearchChange={setSearchQuery} />
            <Navigation activeTab="teams" />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold mb-4 md:mb-0">Teams</h1>
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
                            <Users className="w-5 h-5 text-gray-400" />
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
                                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4" />
                                <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2" />
                                <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team: Team) => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
