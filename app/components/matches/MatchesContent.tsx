'use client'

import { useState, useMemo, useEffect } from 'react'
import { Filter, ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import MatchCard from '@/components/matches/MatchCard'
import { useMatches } from '@/hooks/useEsportsData'
import type { Match } from '@/types/esports'
import { useGamesContext } from '@/contexts/GamesContext'
import { getDropdownValue, saveDropdownValue } from '@/lib/localStorage'
import { trackPageView, trackFilter } from '@/lib/analytics'

interface Game {
    id: string | number
    slug: string
    name: string
}

export default function MatchesContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize state from URL parameters with local storage fallback
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [selectedGame, setSelectedGame] = useState(searchParams.get('game') || getDropdownValue('matchGame', 'valorant'))
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('per_page') || getDropdownValue('matchItemsPerPage', 20).toString()))
    const [dateFilter, setDateFilter] = useState(searchParams.get('date_filter') || getDropdownValue('matchDateFilter', 'all'))
    const [customDateRange, setCustomDateRange] = useState({
        start: searchParams.get('date_start') || '',
        end: searchParams.get('date_end') || ''
    })

    // Track page view on component mount
    useEffect(() => {
        trackPageView('/matches', 'Matches - Live Matches & Esports Results')
    }, [])

    // Function to update URL parameters
    const updateUrlParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })

        // Update the URL without reloading the page
        router.push(`/matches?${params.toString()}`)
    }

    // Update URL when filters change
    useEffect(() => {
        const updates: Record<string, string | null> = {
            search: searchTerm || null,
            game: selectedGame,
            page: currentPage.toString(),
            per_page: itemsPerPage.toString(),
            date_filter: dateFilter
        }

        if (dateFilter === 'custom') {
            updates.date_start = customDateRange.start || null
            updates.date_end = customDateRange.end || null
        }

        updateUrlParams(updates)
    }, [searchTerm, selectedGame, currentPage, itemsPerPage, dateFilter, customDateRange, searchParams, router])

    // Modified filter handlers with local storage and analytics tracking
    const handleGameChange = (game: string) => {
        setSelectedGame(game)
        setCurrentPage(1) // Reset to first page
        saveDropdownValue('matchGame', game)
        // Track filter usage
        trackFilter('game', game, filteredMatches.length)
    }

    const handleDateFilterChange = (filter: string) => {
        setDateFilter(filter)
        setCurrentPage(1) // Reset to first page
        saveDropdownValue('matchDateFilter', filter)
        if (filter !== 'custom') {
            setCustomDateRange({ start: '', end: '' })
        }
        // Track filter usage
        trackFilter('date', filter, filteredMatches.length)
    }

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items)
        resetPage()
        saveDropdownValue('matchItemsPerPage', items)
    }

    // Fetch games data
    const { games, loading: gamesLoading } = useGamesContext()

    // Prepare date filters for the API
    const getDateFilters = () => {
        const filters: {
            since?: string;
            until?: string;
        } = {}

        switch (dateFilter) {
            case 'today': {
                // Get today's date at UTC midnight
                const today = new Date()
                today.setUTCHours(0, 0, 0, 0)
                filters.since = today.toISOString().split('T')[0]

                // Get tomorrow's date at UTC midnight
                const tomorrow = new Date(today)
                tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
                filters.until = tomorrow.toISOString().split('T')[0]
                break
            }
            case 'week': {
                const now = new Date()
                // Get the start of current week (Sunday) at UTC midnight
                const weekStart = new Date(now)
                weekStart.setUTCHours(0, 0, 0, 0)
                weekStart.setUTCDate(now.getUTCDate() - now.getUTCDay())
                filters.since = weekStart.toISOString().split('T')[0]

                // Get the end of current week (Saturday) at UTC midnight
                const weekEnd = new Date(weekStart)
                weekEnd.setUTCDate(weekStart.getUTCDate() + 7)
                filters.until = weekEnd.toISOString().split('T')[0]
                break
            }
            case 'month': {
                const now = new Date()
                // Get the start of current month at UTC midnight
                const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
                filters.since = monthStart.toISOString().split('T')[0]

                // Get the start of next month at UTC midnight
                const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
                filters.until = monthEnd.toISOString().split('T')[0]
                break
            }
            case 'custom': {
                if (customDateRange.start) {
                    filters.since = customDateRange.start // Already in YYYY-MM-DD format
                }
                if (customDateRange.end) {
                    // For custom end date, include the entire day by using the next day as the until date
                    const nextDay = new Date(customDateRange.end)
                    nextDay.setDate(nextDay.getDate() + 1)
                    filters.until = nextDay.toISOString().split('T')[0]
                }
                break
            }
        }

        return filters
    }

    // Pass all filters to the hook, including date filters
    const { data: matches, loading: matchesLoading } = useMatches({
        game: selectedGame,
        page: currentPage,
        per_page: itemsPerPage,
        sort: 'begin_at',
        ...getDateFilters()
    })

    // Filter by search term and sort to prioritize live matches
    const filteredMatches = useMemo(() => {
        let result = matches;

        // Filter by search term if provided
        if (searchTerm) {
            result = matches.filter((match: Match) => {
                const matchesSearch = match.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    match.opponents?.some((opp) =>
                        opp.opponent?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                return matchesSearch
            })
        }

        // Sort to prioritize live matches first, then by date ascending
        return result.sort((a: Match, b: Match) => {
            // First priority: live matches (status === 'running')
            if (a.status === 'running' && b.status !== 'running') return -1;
            if (b.status === 'running' && a.status !== 'running') return 1;
            
            // Second priority: sort by date ascending (oldest first for same status)
            const dateA = new Date(a.begin_at).getTime();
            const dateB = new Date(b.begin_at).getTime();
            return dateA - dateB;
        });
    }, [matches, searchTerm])

    const currentMatches = filteredMatches

    // Pagination logic - disable next if current page has fewer items than itemsPerPage
    const hasMorePages = currentMatches.length === itemsPerPage
    const totalPages = hasMorePages ? currentPage + 1 : currentPage

    // Reset to first page when filters change
    const resetPage = () => setCurrentPage(1)

    // Modified pagination handler
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
            const start = Math.max(1, currentPage - 2)
            const end = Math.min(totalPages, start + maxVisiblePages - 1)

            if (end - start < maxVisiblePages - 1) {
                const newStart = Math.max(1, end - maxVisiblePages + 1)
                if (newStart > 1) {
                    pages.push(1)
                    if (newStart > 2) pages.push('...')
                }
                for (let i = newStart; i <= end; i++) {
                    pages.push(i)
                }
            } else {
                if (start > 1) {
                    pages.push(1)
                    if (start > 2) pages.push('...')
                }
                for (let i = start; i <= end; i++) {
                    pages.push(i)
                }
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
            default: return 'Most Recent'
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearch={(term) => {
                setSearchTerm(term)
                // Don't reset page for search since it's client-side filtering
            }} />
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Matches
                    </h1>

                    <div className="filter-controls">
                        {/* Game Filter */}
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <select
                                value={selectedGame}
                                onChange={(e) => {
                                    handleGameChange(e.target.value)
                                }}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                                disabled={gamesLoading}
                                aria-label="Select game"
                            >
                                {!gamesLoading && games.map((game: Game) => (
                                    <option key={game.id || game.slug} value={game.slug || game.id}>
                                        {game.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <select
                                value={dateFilter}
                                onChange={(e) => {
                                    handleDateFilterChange(e.target.value)
                                }}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                                aria-label="Select date filter"
                            >
                                <option value="all">Most Recent</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        {/* Items per page */}
                        <div className="flex items-center space-x-2">
                            <List className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    handleItemsPerPageChange(Number(e.target.value))
                                }}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                                aria-label="Select items per page"
                            >
                                <option value="10">10 per page</option>
                                <option value="20">20 per page</option>
                                <option value="50">50 per page</option>
                                <option value="100">100 per page</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Custom Date Range Inputs */}
                {dateFilter === 'custom' && (
                    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-4 flex-wrap gap-2">
                            <div className="flex items-center space-x-2">
                                <label htmlFor="date-from" className="text-sm text-gray-300">From:</label>
                                <input
                                    id="date-from"
                                    type="date"
                                    value={customDateRange.start}
                                    onChange={(e) => {
                                        setCustomDateRange(prev => ({ ...prev, start: e.target.value }))
                                        resetPage()
                                    }}
                                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                                    aria-label="From date"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="date-to" className="text-sm text-gray-300">To:</label>
                                <input
                                    id="date-to"
                                    type="date"
                                    value={customDateRange.end}
                                    onChange={(e) => {
                                        setCustomDateRange(prev => ({ ...prev, end: e.target.value }))
                                        resetPage()
                                    }}
                                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                                    aria-label="To date"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setCustomDateRange({ start: '', end: '' })
                                    resetPage()
                                }}
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors duration-200 cursor-pointer"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {matchesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="group bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-gray-700/50 transition-all duration-300 shadow-lg relative overflow-hidden animate-pulse">
                                {/* Glowing effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-50" />

                                {/* Content Container with consistent spacing */}
                                <div className="relative z-10 space-y-5">
                                    {/* Header with status, game, and buttons */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Status badge */}
                                            <div className={`h-6 px-3 rounded-lg border ${
                                                i % 3 === 0 ? 'bg-red-500/20 border-red-500/30' :
                                                i % 3 === 1 ? 'bg-blue-500/20 border-blue-500/30' : 'bg-yellow-500/20 border-yellow-500/30'
                                            }`}>
                                                <div className={`h-3 w-8 rounded mt-1.5 ${
                                                    i % 3 === 0 ? 'bg-red-400/50' :
                                                    i % 3 === 1 ? 'bg-blue-400/50' : 'bg-yellow-400/50'
                                                }`} />
                                            </div>
                                            {/* Game badge */}
                                            <div className="h-6 w-20 bg-purple-500/20 rounded-lg border border-purple-500/30" />
                                            {/* BO badge */}
                                            <div className="h-6 w-12 bg-purple-500/20 rounded-lg border border-purple-500/30" />
                                        </div>
                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-700/50 rounded-lg" />
                                            <div className="w-8 h-8 bg-gray-700/50 rounded-lg" />
                                        </div>
                                    </div>

                                    {/* Teams Section */}
                                    <div className="flex items-center justify-center">
                                        <div className="grid grid-cols-[auto_auto_auto] items-center gap-4 sm:gap-6">
                                            {/* Team 1 */}
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gray-700/50 rounded-xl border border-gray-600/30" />
                                                <div className="h-4 w-16 bg-gray-300/30 rounded" />
                                                {/* Score placeholder */}
                                                {i % 2 === 0 && (
                                                    <div className="w-8 h-8 bg-gray-600/30 rounded-lg border border-gray-500/30" />
                                                )}
                                            </div>

                                            {/* VS */}
                                            <div className="flex flex-col items-center">
                                                <div className="h-6 w-8 bg-gray-600/50 rounded flex items-center justify-center">
                                                    <span className="text-gray-500 text-sm font-bold">VS</span>
                                                </div>
                                            </div>

                                            {/* Team 2 */}
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gray-700/50 rounded-xl border border-gray-600/30" />
                                                <div className="h-4 w-14 bg-gray-300/30 rounded" />
                                                {/* Score placeholder */}
                                                {i % 2 === 0 && (
                                                    <div className="w-8 h-8 bg-gray-600/30 rounded-lg border border-gray-500/30" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date and Time */}
                                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6">
                                        <div className="flex items-center bg-gray-900/30 px-3 py-1 rounded-lg">
                                            <div className="w-4 h-4 bg-gray-500/50 rounded mr-2" />
                                            <div className="h-4 w-20 bg-gray-400/30 rounded" />
                                        </div>
                                        <div className="flex items-center bg-gray-900/30 px-3 py-1 rounded-lg">
                                            <div className="w-4 h-4 bg-gray-500/50 rounded mr-2" />
                                            <div className="h-4 w-24 bg-gray-400/30 rounded" />
                                        </div>
                                        {/* Countdown placeholder */}
                                        {i % 3 !== 1 && (
                                            <div className="flex items-center px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/20">
                                                <div className="w-4 h-4 bg-green-400/50 rounded mr-2" />
                                                <div className="h-4 w-16 bg-green-400/30 rounded" />
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Predictions Button */}
                                    {i % 3 !== 2 && (
                                        <div className="flex items-center justify-center">
                                            <div className="h-7 w-32 bg-indigo-500/10 rounded-lg border border-indigo-500/20" />
                                        </div>
                                    )}

                                    {/* Match Information */}
                                    <div className="space-y-3">
                                        {/* Tournament stage and format */}
                                        <div className="flex items-center justify-center gap-3 flex-wrap">
                                            <div className="h-6 w-24 bg-orange-400/20 rounded-lg border border-orange-500/20" />
                                            <div className="h-6 w-12 bg-blue-400/20 rounded-lg border border-blue-500/20" />
                                            <div className="h-6 w-16 bg-yellow-400/20 rounded-lg border border-yellow-500/20" />
                                        </div>
                                        
                                        {/* League info */}
                                        <div className="text-center">
                                            <div className="h-4 w-48 bg-gray-400/30 rounded mx-auto mb-2" />
                                            <div className="h-3 w-32 bg-gray-500/30 rounded mx-auto" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {currentMatches.map((match: Match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>

                        {/* No Data State */}
                        {currentMatches.length === 0 && (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-300 mb-2">
                                    {searchTerm ? (
                                        <>No matches found matching &ldquo;{searchTerm}&rdquo;{dateFilter !== 'all' ? ` for ${formatDateFilter().toLowerCase()}` : ''}</>
                                    ) : dateFilter !== 'all' ? (
                                        <>No matches found for {formatDateFilter().toLowerCase()}</>
                                    ) : (
                                        <>No matches found</>
                                    )}
                                </h3>
                                
                                {/* Suggestions */}
                                <div className="space-y-3">
                                    <p className="text-gray-400 text-sm">
                                        {searchTerm ? (
                                            'Try different search terms'
                                        ) : dateFilter !== 'all' ? (
                                            dateFilter === 'today' ? 'Try "This Week" or "This Month"' :
                                            dateFilter === 'week' ? 'Try "Today" or "This Month"' :
                                            dateFilter === 'month' ? 'Try "Today" or "This Week"' :
                                            'Try "Today", "This Week", or "This Month"'
                                        ) : (
                                            'Try searching for specific teams or tournaments'
                                        )}
                                    </p>
                                    
                                    {/* Clear Filters */}
                                    {(searchTerm || dateFilter !== 'all') && (
                                        <div className="flex items-center justify-center gap-2 flex-wrap">
                                            {searchTerm && (
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors duration-200 cursor-pointer"
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
                                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors duration-200 cursor-pointer"
                                                >
                                                    Clear date filter
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {(currentPage > 1 || hasMorePages) && (
                            <div className="flex items-center justify-center space-x-2 mt-8">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors cursor-pointer"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {getPageNumbers().map((pageNum, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof pageNum === 'number' ? goToPage(pageNum) : undefined}
                                        disabled={pageNum === '...'}
                                        className={`px-3 py-2 rounded-lg transition-colors ${
                                            pageNum === currentPage
                                                ? 'bg-blue-600 text-white cursor-pointer'
                                                : pageNum === '...'
                                                ? 'text-gray-400 cursor-default'
                                                : 'bg-gray-800 text-white hover:bg-gray-700 cursor-pointer'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasMorePages}
                                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors cursor-pointer"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Pagination Description */}
                        {currentMatches.length > 0 && (
                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-500">
                                    Showing {currentMatches.length} matches per page
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
