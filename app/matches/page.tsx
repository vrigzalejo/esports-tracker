'use client'

import { useState, useMemo } from 'react'
import { Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

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

    // Date filtering states
    const [dateFilter, setDateFilter] = useState('all') // 'all', 'today', 'week', 'month', 'custom'
    const [customDateRange, setCustomDateRange] = useState({
        start: '',
        end: ''
    })

    // Fetch games data
    const { games, loading: gamesLoading } = useGames()

    // Prepare date filters for the API
    const getDateFilters = () => {
        const now = new Date()
        const filters: any = {}

        switch (dateFilter) {
            case 'today':
                const todayStart = new Date(now)
                todayStart.setHours(0, 0, 0, 0)
                const todayEnd = new Date(now)
                todayEnd.setHours(23, 59, 59, 999)
                filters.since = todayStart.toISOString()
                filters.until = todayEnd.toISOString()
                break

            case 'week':
                const weekStart = new Date(now)
                weekStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
                weekStart.setHours(0, 0, 0, 0)
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekStart.getDate() + 6) // End of week (Saturday)
                weekEnd.setHours(23, 59, 59, 999)
                filters.since = weekStart.toISOString()
                filters.until = weekEnd.toISOString()
                break

            case 'month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
                filters.since = monthStart.toISOString()
                filters.until = monthEnd.toISOString()
                break

            case 'custom':
                if (customDateRange.start) {
                    filters.since = new Date(customDateRange.start).toISOString()
                }
                if (customDateRange.end) {
                    const endDate = new Date(customDateRange.end)
                    endDate.setHours(23, 59, 59, 999)
                    filters.until = endDate.toISOString()
                }
                break
        }

        return filters
    }

    // Pass all filters to the hook, including date filters
    const { data: matches, loading: matchesLoading } = useMatches({
        game: selectedGame,
        status: selectedStatus,
        page: currentPage,
        per_page: itemsPerPage,
        sort: 'proximity',
        ...getDateFilters()
    })

    // Only filter by search term since sorting and pagination are handled by the hook
    const filteredMatches = useMemo(() => {
        if (!searchTerm) return matches

        return matches.filter((match: any) => {
            const matchesSearch = match.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.opponents?.some((opp: any) =>
                    opp.opponent?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
            return matchesSearch
        })
    }, [matches, searchTerm])

    const currentMatches = filteredMatches

    // Pagination logic - assuming we have consistent page sizes
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

    // Format date for display
    const formatDateFilter = () => {
        switch (dateFilter) {
            case 'today': return 'Today'
            case 'week': return 'This Week'
            case 'month': return 'This Month'
            case 'custom':
                if (customDateRange.start && customDateRange.end) {
                    return `${customDateRange.start} to ${customDateRange.end}`
                } else if (customDateRange.start) {
                    return `From ${customDateRange.start}`
                } else if (customDateRange.end) {
                    return `Until ${customDateRange.end}`
                }
                return 'Custom Range'
            default: return 'All Dates'
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={(term) => {
                setSearchTerm(term)
                // Don't reset page for search since it's client-side filtering
            }} />
            <Navigation activeTab="matches" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Matches
                    </h1>

                    <div className="flex items-center space-x-4 flex-wrap gap-2">
                        {/* Game Filter */}
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

                        {/* Status Filter */}
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

                        {/* Date Filter */}
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <select
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value)
                                    resetPage()
                                }}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                            >
                                <option value="all">All Dates</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        {/* Items per page */}
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

                {/* Custom Date Range Inputs */}
                {dateFilter === 'custom' && (
                    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-4 flex-wrap gap-2">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-300">From:</label>
                                <input
                                    type="date"
                                    value={customDateRange.start}
                                    onChange={(e) => {
                                        setCustomDateRange(prev => ({ ...prev, start: e.target.value }))
                                        resetPage()
                                    }}
                                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-300">To:</label>
                                <input
                                    type="date"
                                    value={customDateRange.end}
                                    onChange={(e) => {
                                        setCustomDateRange(prev => ({ ...prev, end: e.target.value }))
                                        resetPage()
                                    }}
                                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setCustomDateRange({ start: '', end: '' })
                                    resetPage()
                                }}
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors duration-200"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Results info */}
                {!matchesLoading && currentMatches.length > 0 && (
                    <div className="mb-4 text-gray-400 text-sm">
                        Page {currentPage} - Showing {currentMatches.length} matches
                        {searchTerm && ` (filtered by "${searchTerm}")`}
                        {dateFilter !== 'all' && ` (${formatDateFilter()})`}
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
                                    {getPageNumbers().map((pageNum, index) => (
                                        <span key={index}>
                                            {pageNum === '...' ? (
                                                <span className="text-gray-500 px-2">...</span>
                                            ) : (
                                                <button
                                                    onClick={() => goToPage(pageNum as number)}
                                                    className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-400 hover:text-white hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            )}
                                        </span>
                                    ))}
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

                {currentMatches.length === 0 && !matchesLoading && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">
                            {searchTerm
                                ? `No matches found matching "${searchTerm}"`
                                : "No matches found matching your criteria"
                            }
                        </p>
                        {(searchTerm || dateFilter !== 'all') && (
                            <div className="mt-4 space-x-2">
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                    >
                                        Clear search
                                    </button>
                                )}
                                {dateFilter !== 'all' && (
                                    <button
                                        onClick={() => {
                                            setDateFilter('all')
                                            setCustomDateRange({ start: '', end: '' })
                                            resetPage()
                                        }}
                                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                    >
                                        Clear date filter
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
