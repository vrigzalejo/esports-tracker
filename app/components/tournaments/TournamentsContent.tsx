'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Trophy, Clock, CheckCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import TournamentCard from '@/components/tournaments/TournamentCard'
import { useUpcomingTournaments, useRunningTournaments, usePastTournaments } from '@/hooks/useEsportsData'
import type { Tournament } from '@/types/esports'

type TournamentStatus = 'upcoming' | 'running' | 'past'

export default function TournamentsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize state from URL parameters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [selectedStatus, setSelectedStatus] = useState<TournamentStatus>(
        (searchParams.get('status') as TournamentStatus) || 'upcoming'
    )
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
        router.push(`/tournaments?${params.toString()}`)
    }

    // Update URL when filters change
    useEffect(() => {
        const updates: Record<string, string | null> = {
            search: searchTerm || null,
            status: selectedStatus,
            page: currentPage.toString(),
            per_page: itemsPerPage.toString(),
            date_filter: dateFilter
        }

        if (dateFilter === 'custom') {
            updates.date_start = customDateRange.start || null
            updates.date_end = customDateRange.end || null
        }

        updateUrlParams(updates)
    }, [searchTerm, selectedStatus, currentPage, itemsPerPage, dateFilter, customDateRange, searchParams, router])

    // Modified filter handlers
    const handleStatusChange = (status: TournamentStatus) => {
        setSelectedStatus(status)
        setCurrentPage(1) // Reset to first page
    }

    const handleDateFilterChange = (filter: string) => {
        setDateFilter(filter)
        setCurrentPage(1) // Reset to first page
        if (filter !== 'custom') {
            setCustomDateRange({ start: '', end: '' })
        }
    }

    // Fetch tournaments based on selected status
    const { data: upcomingTournaments, loading: upcomingLoading } = useUpcomingTournaments({
        page: selectedStatus === 'upcoming' ? currentPage : 1,
        per_page: itemsPerPage
    })

    const { data: runningTournaments, loading: runningLoading } = useRunningTournaments({
        page: selectedStatus === 'running' ? currentPage : 1,
        per_page: itemsPerPage
    })

    const { data: pastTournaments, loading: pastLoading } = usePastTournaments({
        page: selectedStatus === 'past' ? currentPage : 1,
        per_page: itemsPerPage
    })

    // Get current tournaments and loading state based on selected status
    const getCurrentTournaments = () => {
        switch (selectedStatus) {
            case 'upcoming':
                return { tournaments: upcomingTournaments, loading: upcomingLoading }
            case 'running':
                return { tournaments: runningTournaments, loading: runningLoading }
            case 'past':
                return { tournaments: pastTournaments, loading: pastLoading }
            default:
                return { tournaments: [], loading: false }
        }
    }

    const { tournaments, loading: tournamentsLoading } = getCurrentTournaments()

    // Filter by search term, date, and sort by descending date
    const filteredTournaments = useMemo(() => {
        let filtered = tournaments

        // Apply search filter if search term exists
        if (searchTerm && searchTerm.trim() !== '') {
            const searchTermLower = searchTerm.toLowerCase().trim()
            
            filtered = tournaments.filter((tournament: Tournament) => {
                // Search in tournament name
                const tournamentName = tournament.name?.toLowerCase() || ''
                
                // Search in league name
                const leagueName = tournament.league?.name?.toLowerCase() || ''
                
                // Search in serie name
                const serieName = tournament.serie?.name?.toLowerCase() || ''
                const serieFullName = tournament.serie?.full_name?.toLowerCase() || ''
                
                // Search in videogame name
                const videogameName = tournament.videogame?.name?.toLowerCase() || ''
                
                // Search in region
                const region = tournament.region?.toLowerCase() || ''
                const leagueRegion = tournament.league?.region?.toLowerCase() || ''
                
                // Search in country
                const country = tournament.country?.toLowerCase() || ''
                
                // Check if search term matches any of these fields
                return tournamentName.includes(searchTermLower) ||
                       leagueName.includes(searchTermLower) ||
                       serieName.includes(searchTermLower) ||
                       serieFullName.includes(searchTermLower) ||
                       videogameName.includes(searchTermLower) ||
                       region.includes(searchTermLower) ||
                       leagueRegion.includes(searchTermLower) ||
                       country.includes(searchTermLower)
            })
        }

        // Apply date filter
        if (dateFilter !== 'all') {
            filtered = filtered.filter((tournament: Tournament) => {
                const tournamentDate = new Date(tournament.begin_at || 0)
                const now = new Date()

                switch (dateFilter) {
                    case 'today': {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const tomorrow = new Date(today)
                        tomorrow.setDate(tomorrow.getDate() + 1)
                        return tournamentDate >= today && tournamentDate < tomorrow
                    }
                    case 'week': {
                        const weekStart = new Date(now)
                        weekStart.setHours(0, 0, 0, 0)
                        weekStart.setDate(now.getDate() - now.getDay())
                        const weekEnd = new Date(weekStart)
                        weekEnd.setDate(weekStart.getDate() + 7)
                        return tournamentDate >= weekStart && tournamentDate < weekEnd
                    }
                    case 'month': {
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
                        return tournamentDate >= monthStart && tournamentDate < monthEnd
                    }
                    case 'custom': {
                        let matchesStart = true
                        let matchesEnd = true
                        
                        if (customDateRange.start) {
                            const startDate = new Date(customDateRange.start)
                            startDate.setHours(0, 0, 0, 0)
                            matchesStart = tournamentDate >= startDate
                        }
                        
                        if (customDateRange.end) {
                            const endDate = new Date(customDateRange.end)
                            endDate.setHours(23, 59, 59, 999)
                            matchesEnd = tournamentDate <= endDate
                        }
                        
                        return matchesStart && matchesEnd
                    }
                    default:
                        return true
                }
            })
        }

        // Sort by begin_at date in descending order (most recent first)
        return filtered.sort((a: Tournament, b: Tournament) => {
            const dateA = new Date(a.begin_at || 0).getTime()
            const dateB = new Date(b.begin_at || 0).getTime()
            return dateB - dateA // Descending order (newest first)
        })
    }, [tournaments, searchTerm, dateFilter, customDateRange])

    const currentTournaments = filteredTournaments

    // Pagination logic - more robust check for available pages
    // Only show "next" if:
    // 1. We got a full page of data from the API (tournaments.length === itemsPerPage)
    // 2. AND we have tournaments to show after filtering (currentTournaments.length > 0)
    // 3. AND we're not applying search/date filters that might reduce the dataset
    const isFiltering = searchTerm.trim() !== '' || dateFilter !== 'all'
    const hasMorePages = !isFiltering && tournaments.length === itemsPerPage && currentTournaments.length > 0
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

    // Get status display info
    const getStatusInfo = (status: TournamentStatus) => {
        switch (status) {
            case 'upcoming':
                return { label: 'Upcoming', icon: Clock, color: 'text-blue-400' }
            case 'running':
                return { label: 'On-going', icon: Trophy, color: 'text-green-400' }
            case 'past':
                return { label: 'Finished', icon: CheckCircle, color: 'text-gray-400' }
        }
    }

    // Format date filter for display
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
            default: return 'All'
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearch={(term) => {
                setSearchTerm(term)
                setCurrentPage(1) // Reset to first page when searching
            }} />
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Tournaments
                    </h1>

                    <div className="flex items-center space-x-4 flex-wrap gap-2">
                        {/* Status Filter */}
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    handleStatusChange(e.target.value as TournamentStatus)
                                }}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                                aria-label="Select tournament status"
                            >
                                <option value="upcoming" className="cursor-pointer">Upcoming</option>
                                <option value="running" className="cursor-pointer">On-going</option>
                                <option value="past" className="cursor-pointer">Finished</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <select
                                value={dateFilter}
                                onChange={(e) => {
                                    handleDateFilterChange(e.target.value)
                                }}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                                aria-label="Select date filter"
                            >
                                <option value="all" className="cursor-pointer">All</option>
                                <option value="today" className="cursor-pointer">Today</option>
                                <option value="week" className="cursor-pointer">This Week</option>
                                <option value="month" className="cursor-pointer">This Month</option>
                                <option value="custom" className="cursor-pointer">Custom Range</option>
                            </select>
                        </div>

                        {/* Items per page */}
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value))
                                resetPage()
                            }}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                            aria-label="Select items per page"
                        >
                            <option value="10" className="cursor-pointer">10 per page</option>
                            <option value="20" className="cursor-pointer">20 per page</option>
                            <option value="50" className="cursor-pointer">50 per page</option>
                        </select>
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
                                        setCurrentPage(1)
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
                                        setCurrentPage(1)
                                    }}
                                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                                    aria-label="To date"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setCustomDateRange({ start: '', end: '' })
                                    setCurrentPage(1)
                                }}
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors duration-200 cursor-pointer"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Results info */}
                {!tournamentsLoading && (
                    <div className="mb-4 text-gray-400 text-sm">
                        {currentTournaments.length > 0 ? (
                            <>
                                Page {currentPage} - Showing {currentTournaments.length} {getStatusInfo(selectedStatus).label.toLowerCase()} tournaments
                                {searchTerm && ` (filtered by "${searchTerm}")`}
                                {dateFilter !== 'all' && ` (${formatDateFilter()})`}
                                {hasMorePages && <span> (more available)</span>}
                            </>
                        ) : (
                            <>
                                {searchTerm ? (
                                    `No ${getStatusInfo(selectedStatus).label.toLowerCase()} tournaments found matching "${searchTerm}"`
                                ) : (
                                    `No ${getStatusInfo(selectedStatus).label.toLowerCase()} tournaments found`
                                )}
                                {dateFilter !== 'all' && ` for ${formatDateFilter()}`}
                            </>
                        )}
                    </div>
                )}

                {tournamentsLoading ? (
                    <div className="grid grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="group relative bg-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-pulse">
                                {/* Clean background glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl opacity-50" />
                                
                                <div className="relative z-10">
                                    <div className="flex flex-col">
                                        {/* Tournament Image - Top */}
                                        <div className="flex justify-center mb-3">
                                            <div className="relative w-28 h-28">
                                                <div className="absolute inset-0 bg-white/5 rounded-2xl backdrop-blur-sm shadow-2xl" />
                                                <div className="relative w-full h-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-3 border border-white/20 backdrop-blur-md">
                                                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-700/50" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Content - Bottom */}
                                        <div className="text-center">
                                            {/* Title and Game */}
                                            <div className="mb-3">
                                                <div className="h-5 w-48 bg-gray-700/50 rounded mx-auto mb-1" />
                                                <div className="h-4 w-24 bg-gray-700/50 rounded mx-auto" />
                                            </div>

                                            {/* Date & Time - Clean Display */}
                                            <div className="mb-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 bg-purple-400/50 rounded" />
                                                    <div className="text-center">
                                                        <div className="h-4 w-32 bg-gray-700/50 rounded mb-1" />
                                                        <div className="h-3 w-28 bg-gray-700/50 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Prize Pool */}
                                            <div className="mb-3">
                                                <div className="h-8 w-20 bg-green-400/30 rounded mx-auto mb-1" />
                                                <div className="h-3 w-16 bg-gray-700/50 rounded mx-auto" />
                                            </div>
                                            
                                            {/* Badges */}
                                            <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
                                                <div className="h-6 w-16 bg-blue-500/20 rounded-lg" />
                                                <div className="h-6 w-12 bg-yellow-500/20 rounded-lg" />
                                                <div className="h-6 w-14 bg-gray-500/20 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Teams Section */}
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-gray-700/50 rounded mr-2" />
                                                <div className="h-4 w-16 bg-gray-700/50 rounded" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 max-h-20">
                                            {[...Array(4)].map((_, j) => (
                                                <div key={j} className="flex items-center space-x-2">
                                                    <div className="w-4 h-4 bg-gray-600/50 rounded-md" />
                                                    <div className="h-3 w-16 bg-gray-700/50 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-6">
                            {currentTournaments.map((tournament: Tournament) => (
                                <TournamentCard key={tournament.id} tournament={tournament} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {(currentPage > 1 || hasMorePages) && (
                            <div className="flex items-center justify-center mt-8 space-x-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
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
                                                    className={`px-3 py-1 text-sm rounded-md cursor-pointer transition-all duration-200 ${currentPage === pageNum
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
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {currentTournaments.length === 0 && !tournamentsLoading && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">
                            {searchTerm
                                ? `No ${getStatusInfo(selectedStatus).label.toLowerCase()} tournaments found matching "${searchTerm}"`
                                : `No ${getStatusInfo(selectedStatus).label.toLowerCase()} tournaments found`
                            }
                        </p>
                        {(searchTerm || dateFilter !== 'all') && (
                            <div className="mt-4 space-x-2">
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200 cursor-pointer"
                                    >
                                        Clear search
                                    </button>
                                )}
                                {dateFilter !== 'all' && (
                                    <button
                                        onClick={() => {
                                            setDateFilter('all')
                                            setCustomDateRange({ start: '', end: '' })
                                            setCurrentPage(1)
                                        }}
                                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200 cursor-pointer"
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
