'use client'

import { useState, useMemo } from 'react'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import MatchCard from '@/components/matches/MatchCard'
import { useMatches, useGames } from '@/hooks/useEsportsData'

export default function MatchesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedGame, setSelectedGame] = useState('all')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)

    // Fetch games data
    const { games, loading: gamesLoading } = useGames()

    const { data: matches, loading: matchesLoading } = useMatches({
        game: selectedGame,
        status: selectedStatus,
        page: currentPage,
        per_page: itemsPerPage
    })

    // Client-side filtering and sorting
    const filteredAndSortedMatches = useMemo(() => {
        // First filter by search term
        const filtered = matches.filter((match: any) => {
            if (!searchTerm) return true
            const matchesSearch = match.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.opponents?.some((opp: any) =>
                    opp.opponent?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
            return matchesSearch
        })

        // Then sort by date - current/recent matches first
        const sorted = filtered.sort((a: any, b: any) => {
            const now = new Date()
            const dateA = new Date(a.scheduled_at || a.begin_at)
            const dateB = new Date(b.scheduled_at || b.begin_at)

            // Calculate time difference from now (absolute value for proximity)
            const diffA = Math.abs(now.getTime() - dateA.getTime())
            const diffB = Math.abs(now.getTime() - dateB.getTime())

            // Sort by proximity to current time (closest first)
            return diffA - diffB
        })

        return sorted
    }, [matches, searchTerm])

    // Since API handles pagination, we use the filtered and sorted results directly
    const currentMatches = filteredAndSortedMatches

    // For display purposes - in a real implementation, you'd get total count from API
    // This is a simplified version assuming each page has itemsPerPage items
    const hasMorePages = matches.length === itemsPerPage
    const totalPages = hasMorePages ? currentPage + 1 : currentPage

    // Reset to first page when filters change
    const resetPage = () => setCurrentPage(1)

    // Handle page changes
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            let start = Math.max(1, currentPage - 2)
            let end = Math.min(totalPages, start + maxVisiblePages - 1)

            if (end - start < maxVisiblePages - 1) {
                start = Math.max(1, end - maxVisiblePages + 1)
            }

            if (start > 1) {
                pages.push(1)
                if (start > 2) pages.push('...')
            }

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (end < totalPages) {
                if (end < totalPages - 1) pages.push('...')
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={(term) => {
                setSearchTerm(term)
                resetPage()
            }} />
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
                                onChange={(e) => {
                                    setSelectedGame(e.target.value)
                                    resetPage()
                                }}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                                disabled={gamesLoading}
                            >
                                <option value="all">
                                    {gamesLoading ? 'Loading games...' : 'All Games'}
                                </option>
                                {!gamesLoading && games.map((game: any) => (
                                    <option key={game.id || game.slug} value={game.id || game.slug}>
                                        {game.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value)
                                resetPage()
                            }}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        >
                            <option value="all">All Status</option>
                            <option value="running">Live</option>
                            <option value="not_started">Upcoming</option>
                            <option value="finished">Finished</option>
                        </select>

                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value))
                                resetPage()
                            }}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        >
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                </div>

                {/* Results info */}
                {!matchesLoading && currentMatches.length > 0 && (
                    <div className="mb-4 text-gray-400 text-sm">
                        Page {currentPage} - Showing {currentMatches.length} matches
                        {hasMorePages && <span> (more available)</span>}
                    </div>
                )}

                {matchesLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentMatches.map((match: any) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {(currentPage > 1 || hasMorePages) && (
                            <div className="flex items-center justify-center mt-8 space-x-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </button>

                                <div className="flex items-center space-x-2 px-4">
                                    <span className="text-gray-400 text-sm">Page {currentPage}</span>
                                </div>

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasMorePages}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {filteredAndSortedMatches.length === 0 && !matchesLoading && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No matches found matching your criteria</p>
                    </div>
                )}
            </main>
        </div>
    )
}
