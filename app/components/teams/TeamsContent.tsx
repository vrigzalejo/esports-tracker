'use client'

import { useState, useMemo, useEffect } from 'react'
import { Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import TeamCard from '@/components/teams/TeamCard'
import { useTeams, useGames } from '@/hooks/useEsportsData'
import type { Team } from '@/types/esports'

interface Game {
    id: string | number
    slug: string
    name: string
}

export default function TeamsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize state from URL parameters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [selectedGame, setSelectedGame] = useState(searchParams.get('game') || 'valorant')
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('per_page') || '20'))

    const [dateFilter, setDateFilter] = useState(searchParams.get('date_filter') || 'all')
    const [customDateRange, setCustomDateRange] = useState({
        start: searchParams.get('date_start') || '',
        end: searchParams.get('date_end') || ''
    })

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
        router.push(`/teams?${params.toString()}`)
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

    // Modified filter handlers
    const handleGameChange = (game: string) => {
        setSelectedGame(game)
        setCurrentPage(1) // Reset to first page
    }



    const handleDateFilterChange = (filter: string) => {
        setDateFilter(filter)
        setCurrentPage(1) // Reset to first page
        if (filter !== 'custom') {
            setCustomDateRange({ start: '', end: '' })
        }
    }

    // Fetch games data
    const { games, loading: gamesLoading } = useGames()

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
            case 'all':
            default: {
                // For "All Dates", start from current date and time to show current and future tournaments
                const now = new Date()
                filters.since = now.toISOString().split('T')[0]
                break
            }
        }

        return filters
    }

    // Pass all filters to the hook, including date filters
    const { data: teams, loading: teamsLoading } = useTeams({
        game: selectedGame,
        page: currentPage,
        per_page: itemsPerPage,
        ...getDateFilters()
    })

    // Only filter by search term since other filtering is handled by the API
    const filteredTeams = useMemo(() => {
        if (!searchTerm || searchTerm.trim() === '') return teams

        const searchTermLower = searchTerm.toLowerCase().trim()
        
        return teams.filter((team: Team) => {
            // Search in team name
            const teamName = team.name?.toLowerCase() || ''
            
            // Search in team acronym
            const teamAcronym = team.acronym?.toLowerCase() || ''
            
            // Search in team location
            const teamLocation = team.location?.toLowerCase() || ''
            
            // Check if search term matches any of these fields
            return teamName.includes(searchTermLower) ||
                   teamAcronym.includes(searchTermLower) ||
                   teamLocation.includes(searchTermLower)
        })
    }, [teams, searchTerm])

    const currentTeams = filteredTeams

    // Pagination logic - assuming we have consistent page sizes
    const hasMorePages = teams.length === itemsPerPage
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

    const formatDateFilter = () => {
        switch (dateFilter) {
            case 'today':
                return 'Today'
            case 'week':
                return 'This Week'
            case 'month':
                return 'This Month'
            case 'custom':
                if (customDateRange.start && customDateRange.end) {
                    return `${customDateRange.start} to ${customDateRange.end}`
                } else if (customDateRange.start) {
                    return `From ${customDateRange.start}`
                } else if (customDateRange.end) {
                    return `Until ${customDateRange.end}`
                } else {
                    return 'Custom Range'
                }
            case 'all':
            default:
                return 'All Dates'
        }
    }

    // Calculate display indices for results info
    const startIndex = (currentPage - 1) * itemsPerPage + 1
    const endIndex = Math.min(currentPage * itemsPerPage, currentTeams.length)

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Teams</h1>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={selectedGame}
                                onChange={(e) => handleGameChange(e.target.value)}
                                className="bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Filter by game"
                            >
                                {!gamesLoading && games.map((game: Game) => (
                                    <option key={game.slug} value={game.slug}>
                                        {game.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <select
                                value={dateFilter}
                                onChange={(e) => handleDateFilterChange(e.target.value)}
                                className="bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Filter by date"
                            >
                                <option value="all">All Dates</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(parseInt(e.target.value))
                                    resetPage()
                                }}
                                className="bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Items per page"
                            >
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Custom Date Range Inputs */}
                {dateFilter === 'custom' && (
                    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <label htmlFor="start-date" className="text-sm text-gray-300 whitespace-nowrap">
                                    Start Date:
                                </label>
                                <input
                                    id="start-date"
                                    type="date"
                                    value={customDateRange.start}
                                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="end-date" className="text-sm text-gray-300 whitespace-nowrap">
                                    End Date:
                                </label>
                                <input
                                    id="end-date"
                                    type="date"
                                    value={customDateRange.end}
                                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {teamsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(itemsPerPage)].map((_, i) => (
                            <div key={i} className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 animate-pulse">
                                {/* Subtle background glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-xl opacity-0" />
                                
                                <div className="relative z-10">
                                    {/* Team Header */}
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="relative w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg ring-2 ring-gray-600/30">
                                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 rounded-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
                                            <div className="h-4 bg-gray-700 rounded w-1/2" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Tournament Information */}
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm">
                                                <div className="w-4 h-4 bg-gray-700 rounded mr-2 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-700 rounded w-full mb-1" />
                                                    <div className="h-3 bg-gray-700 rounded w-2/3 mb-1" />
                                                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                                                </div>
                                            </div>
                                            
                                            {/* Tournament Details */}
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-3 h-3 bg-gray-700 rounded" />
                                                    <div className="h-3 bg-gray-700 rounded w-2/3" />
                                                    <div className="h-4 w-12 bg-gray-700 rounded-full px-2 py-1" />
                                                </div>
                                                
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-1">
                                                        <div className="w-3 h-3 bg-gray-700 rounded" />
                                                        <div className="h-3 bg-gray-700 rounded w-8" />
                                                        <div className="h-3 bg-gray-700 rounded w-4" />
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-1">
                                                        <div className="w-3 h-3 bg-gray-700 rounded" />
                                                        <div className="h-3 bg-gray-700 rounded w-12" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Players */}
                                        <div className="pt-3 border-t border-gray-700">
                                            <div className="flex items-center justify-between text-sm mb-3">
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-gray-700 rounded mr-2 flex-shrink-0" />
                                                    <div className="h-4 bg-gray-700 rounded w-16" />
                                                </div>
                                                <div className="h-3 bg-gray-700 rounded w-12" />
                                            </div>
                                            <div className="space-y-3 max-h-64">
                                                {[...Array(3)].map((_, j) => (
                                                    <div key={j} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-800/50">
                                                        {/* Player Image */}
                                                        <div className="relative w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full ring-1 ring-gray-600/30 flex-shrink-0" />
                                                        
                                                        {/* Player Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <div className="h-4 bg-gray-700 rounded w-24" />
                                                            </div>
                                                            
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <div className="flex items-center space-x-1">
                                                                    <div className="w-4 h-3 bg-gray-700 rounded-sm" />
                                                                    <div className="h-3 bg-gray-700 rounded w-6" />
                                                                </div>
                                                                
                                                                <div className="flex items-center space-x-1">
                                                                    <div className="w-3 h-3 bg-gray-700 rounded" />
                                                                    <div className="h-3 bg-gray-700 rounded w-12" />
                                                                </div>
                                                                
                                                                <div className="flex items-center space-x-1">
                                                                    <div className="w-3 h-3 bg-gray-700 rounded" />
                                                                    <div className="h-3 bg-gray-700 rounded w-8" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentTeams.map((team: Team) => (
                                <TeamCard key={team.id} team={team} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 mt-8">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
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
                                                ? 'bg-blue-600 text-white'
                                                : pageNum === '...'
                                                ? 'text-gray-400 cursor-default'
                                                : 'bg-gray-800 text-white hover:bg-gray-700'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Results info */}
                        <div className="text-center text-gray-400 mt-4">
                            <div>
                                Showing {startIndex}-{endIndex} of {currentTeams.length} teams
                            </div>
                            {dateFilter !== 'all' && (
                                <div className="text-sm mt-1">
                                    Filtered by: {formatDateFilter()}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
} 