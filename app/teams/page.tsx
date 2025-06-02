'use client'

import { useState, useMemo } from 'react'
import { Filter, Users } from 'lucide-react'
import { useTeams, useMatches } from '@/hooks/useEsportsData'
import { Team, Match } from '@/types/esports'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import TeamCard from '@/components/teams/TeamCard'

export default function TeamsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedGame, setSelectedGame] = useState('all')
    const [selectedRegion, setSelectedRegion] = useState('all')

    const { data: teams, loading: teamsLoading } = useTeams()
    const { data: matches, loading: matchesLoading } = useMatches({
        per_page: 100, // Get enough matches to calculate meaningful statistics
        sort: 'begin_at'
    })

    // Calculate team performance metrics
    const teamsWithMetrics = useMemo(() => {
        if (teamsLoading || matchesLoading) return teams;

        return teams.map((team: Team) => {
            // Filter matches for this team
            const teamMatches = matches.filter((match: Match) => 
                match.opponents?.some(opp => opp.opponent?.id === team.id)
            );

            if (teamMatches.length === 0) return team;

            let wins = 0;
            let losses = 0;
            let draws = 0;
            let currentStreak = 0;
            let lastResult = '';

            // Calculate match statistics
            teamMatches.forEach((match: Match) => {
                if (match.status !== 'finished' && match.status !== 'completed') return;

                const teamOpponent = match.opponents?.find(opp => opp.opponent?.id === team.id);
                if (!teamOpponent) return;

                const teamIndex = match.opponents?.indexOf(teamOpponent);
                if (teamIndex === undefined) return;

                const results = match.results || [];
                if (results.length < 2) return;

                const teamScore = results[teamIndex]?.score || 0;
                const otherScore = results[teamIndex === 0 ? 1 : 0]?.score || 0;

                if (teamScore > otherScore) {
                    wins++;
                    if (lastResult === 'win') {
                        currentStreak++;
                    } else {
                        currentStreak = 1;
                    }
                    lastResult = 'win';
                } else if (teamScore < otherScore) {
                    losses++;
                    currentStreak = 0;
                    lastResult = 'loss';
                } else {
                    draws++;
                    currentStreak = 0;
                    lastResult = 'draw';
                }
            });

            const matches_played = wins + losses + draws;
            const win_rate = matches_played > 0 ? (wins / matches_played) * 100 : 0;

            return {
                ...team,
                matches_played,
                matches_won: wins,
                matches_lost: losses,
                matches_draw: draws,
                current_streak: currentStreak,
                win_rate: Math.round(win_rate)
            };
        });
    }, [teams, matches, teamsLoading, matchesLoading]);

    // Apply filters
    const filteredTeams = useMemo(() => {
        return teamsWithMetrics.filter((team: Team) => {
            const searchLower = searchQuery.toLowerCase().trim();
            const matchesSearch = team.name.toLowerCase().includes(searchLower) ||
                team.acronym?.toLowerCase().includes(searchLower) ||
                team.location?.toLowerCase().includes(searchLower);

            const matchesRegion = selectedRegion === 'all' || 
                (team.location?.toLowerCase().includes(selectedRegion.toLowerCase()));

            return matchesSearch && matchesRegion;
        });
    }, [teamsWithMetrics, searchQuery, selectedRegion]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchQuery} onSearchChange={setSearchQuery} />
            <Navigation />

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

                {teamsLoading || matchesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gray-700 rounded-lg" />
                                    <div className="flex-1">
                                        <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
                                        <div className="h-4 bg-gray-700 rounded w-1/3" />
                                    </div>
                                    <div className="text-right">
                                        <div className="h-6 w-12 bg-gray-700 rounded mb-1" />
                                        <div className="h-4 w-16 bg-gray-700 rounded" />
                                    </div>
                                </div>
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
