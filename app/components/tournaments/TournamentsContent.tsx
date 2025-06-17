'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Trophy, Clock, CheckCircle, List } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import TournamentCard from '@/components/tournaments/TournamentCard'
import { useUpcomingTournaments, useRunningTournaments, usePastTournaments } from '@/hooks/useEsportsData'
import type { Tournament } from '@/types/esports'
import { getDropdownValue, saveDropdownValue } from '@/lib/localStorage'

type TournamentStatus = 'upcoming' | 'running' | 'past'

export default function TournamentsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize state from URL parameters with local storage fallback
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [selectedStatus, setSelectedStatus] = useState<TournamentStatus>(
        (searchParams.get('status') as TournamentStatus) || getDropdownValue('tournamentStatus', 'running')
    )
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('per_page') || getDropdownValue('tournamentItemsPerPage', 20).toString()))
    const [dateFilter, setDateFilter] = useState(searchParams.get('date_filter') || getDropdownValue('tournamentDateFilter', 'all'))
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

    // Modified filter handlers with local storage
    const handleStatusChange = (status: TournamentStatus) => {
        setSelectedStatus(status)
        setCurrentPage(1)
        saveDropdownValue('tournamentStatus', status)
    }

    const handleDateFilterChange = (filter: string) => {
        setDateFilter(filter)
        setCurrentPage(1)
        saveDropdownValue('tournamentDateFilter', filter)
        if (filter !== 'custom') {
            setCustomDateRange({ start: '', end: '' })
        }
    }

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items)
        resetPage()
        saveDropdownValue('tournamentItemsPerPage', items)
    }

    // Fetch tournaments based on selected status
    const { data: upcomingTournaments, loading: upcomingLoading } = useUpcomingTournaments(
        selectedStatus === 'upcoming' ? {
            page: currentPage,
            per_page: itemsPerPage
        } : undefined
    )

    const { data: runningTournaments, loading: runningLoading } = useRunningTournaments(
        selectedStatus === 'running' ? {
            page: currentPage,
            per_page: itemsPerPage
        } : undefined
    )

    const { data: pastTournaments, loading: pastLoading } = usePastTournaments(
        selectedStatus === 'past' ? {
            page: currentPage,
            per_page: itemsPerPage
        } : undefined
    )

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
                const tournamentName = tournament.name?.toLowerCase() || ''
                const leagueName = tournament.league?.name?.toLowerCase() || ''
                const serieName = tournament.serie?.name?.toLowerCase() || ''
                const serieFullName = tournament.serie?.full_name?.toLowerCase() || ''
                const videogameName = tournament.videogame?.name?.toLowerCase() || ''
                const region = tournament.region?.toLowerCase() || ''
                const leagueRegion = tournament.league?.region?.toLowerCase() || ''
                const country = tournament.country?.toLowerCase() || ''
                
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

        // Sort by begin_at date
        return filtered.sort((a: Tournament, b: Tournament) => {
            const dateA = new Date(a.begin_at || 0).getTime()
            const dateB = new Date(b.begin_at || 0).getTime()
            
            if (selectedStatus === 'upcoming') {
                return dateA - dateB // Ascending order for upcoming
            } else {
                return dateB - dateA // Descending order for running/past
            }
        })
    }, [tournaments, searchTerm, dateFilter, customDateRange, selectedStatus])

    const currentTournaments = filteredTournaments

    // Pagination logic
    const isFiltering = searchTerm.trim() !== '' || dateFilter !== 'all'
    const hasMorePages = !isFiltering && tournaments.length === itemsPerPage && currentTournaments.length > 0
    const totalPages = hasMorePages ? currentPage + 1 : currentPage

    const resetPage = () => setCurrentPage(1)

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
                setCurrentPage(1)
            }} />
            <Navigation />

            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Tournaments
                    </h1>

                    {/* Filter Controls - Mobile Responsive */}
                    <div className="filter-controls">
                        {/* Status Filter */}
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    handleStatusChange(e.target.value as TournamentStatus)
                                }}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-auto"
                                aria-label="Select tournament status"
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="running">On-going</option>
                                <option value="past">Finished</option>
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
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-auto"
                                aria-label="Select date filter"
                            >
                                <option value="all">All</option>
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
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-auto"
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
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                <label htmlFor="date-from" className="text-sm text-gray-300 font-medium">From:</label>
                                <input
                                    id="date-from"
                                    type="date"
                                    value={customDateRange.start}
                                    onChange={(e) => {
                                        setCustomDateRange(prev => ({ ...prev, start: e.target.value }))
                                        setCurrentPage(1)
                                    }}
                                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 w-full sm:w-auto min-h-[44px] sm:min-h-auto"
                                    aria-label="From date"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                <label htmlFor="date-to" className="text-sm text-gray-300 font-medium">To:</label>
                                <input
                                    id="date-to"
                                    type="date"
                                    value={customDateRange.end}
                                    onChange={(e) => {
                                        setCustomDateRange(prev => ({ ...prev, end: e.target.value }))
                                        setCurrentPage(1)
                                    }}
                                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 w-full sm:w-auto min-h-[44px] sm:min-h-auto"
                                    aria-label="To date"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setCustomDateRange({ start: '', end: '' })
                                    setCurrentPage(1)
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer min-h-[44px] sm:min-h-auto flex items-center justify-center"
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
                                <span className="hidden sm:inline">Page {currentPage} - </span>
                                Showing {currentTournaments.length} {getStatusInfo(selectedStatus).label.toLowerCase()} tournaments
                                {searchTerm && (
                                    <span className="block sm:inline">
                                        <span className="hidden sm:inline"> (filtered by &ldquo;</span>
                                        <span className="sm:hidden">Filtered by &ldquo;</span>
                                        {searchTerm}&rdquo;)
                                    </span>
                                )}
                                {dateFilter !== 'all' && (
                                    <span className="block sm:inline">
                                        <span className="hidden sm:inline"> (</span>
                                        <span className="sm:hidden">Date: </span>
                                        {formatDateFilter()}
                                        <span className="hidden sm:inline">)</span>
                                    </span>
                                )}
                                {hasMorePages && <span className="hidden sm:inline"> (more available)</span>}
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
                    /* Loading Skeleton - Responsive Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="group relative bg-white/[0.02] backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 animate-pulse">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-xl sm:rounded-2xl opacity-50" />
                                
                                <div className="relative z-10">
                                    <div className="flex flex-col">
                                        {/* Tournament Image */}
                                        <div className="flex justify-center mb-3">
                                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
                                                <div className="absolute inset-0 bg-white/5 rounded-xl sm:rounded-2xl backdrop-blur-sm shadow-2xl" />
                                                <div className="relative w-full h-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/20 backdrop-blur-md">
                                                    <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-700/50" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="text-center">
                                            {/* Title and Game */}
                                            <div className="mb-3">
                                                <div className="h-4 sm:h-5 w-32 sm:w-48 bg-gray-700/50 rounded mx-auto mb-1" />
                                                <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-700/50 rounded mx-auto" />
                                            </div>

                                            {/* Date & Time */}
                                            <div className="mb-3 px-3 py-2 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 backdrop-blur-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 bg-purple-400/50 rounded" />
                                                    <div className="text-center">
                                                        <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-700/50 rounded mb-1" />
                                                        <div className="h-2 sm:h-3 w-20 sm:w-28 bg-gray-700/50 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Prize Pool */}
                                            <div className="mb-3">
                                                <div className="h-6 sm:h-8 w-16 sm:w-20 bg-green-400/30 rounded mx-auto mb-1" />
                                                <div className="h-2 sm:h-3 w-12 sm:w-16 bg-gray-700/50 rounded mx-auto" />
                                            </div>
                                            
                                            {/* Badges */}
                                            <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
                                                <div className="h-5 sm:h-6 w-12 sm:w-16 bg-blue-500/20 rounded-lg" />
                                                <div className="h-5 sm:h-6 w-10 sm:w-12 bg-yellow-500/20 rounded-lg" />
                                                <div className="h-5 sm:h-6 w-12 sm:w-14 bg-gray-500/20 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Teams Section */}
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-gray-700/50 rounded mr-2" />
                                                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-700/50 rounded" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-20">
                                            {[...Array(4)].map((_, j) => (
                                                <div key={j} className="flex items-center space-x-2">
                                                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600/50 rounded" />
                                                    <div className="h-2 sm:h-3 w-12 sm:w-16 bg-gray-700/50 rounded" />
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
                        {/* Tournament Grid - Responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {currentTournaments.map((tournament: Tournament) => (
                                <TournamentCard key={tournament.id} tournament={tournament} />
                            ))}
                        </div>

                        {/* Pagination - Mobile Responsive */}
                        {(currentPage > 1 || hasMorePages) && (
                            <div className="flex flex-col sm:flex-row items-center justify-center mt-6 sm:mt-8 space-y-4 sm:space-y-0 sm:space-x-2">
                                {/* Mobile: Stack buttons vertically */}
                                <div className="flex items-center space-x-2 sm:hidden">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 min-h-[44px]"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </button>

                                    <span className="px-4 py-3 text-sm text-gray-300 bg-gray-800 rounded-lg border border-gray-600 min-h-[44px] flex items-center">
                                        Page {currentPage}
                                    </span>

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={!hasMorePages}
                                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 min-h-[44px]"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>

                                {/* Desktop: Horizontal layout */}
                                <div className="hidden sm:flex items-center space-x-2">
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
                            </div>
                        )}
                    </>
                )}

                {/* No Results State */}
                {currentTournaments.length === 0 && !tournamentsLoading && (
                    <div className="text-center py-8 sm:py-12">
                        <p className="text-gray-400 text-base sm:text-lg mb-4">
                            {searchTerm ? (
                                <>
                                    No {getStatusInfo(selectedStatus).label.toLowerCase()} tournaments found matching &ldquo;{searchTerm}&rdquo;
                                </>
                            ) : (
                                <>
                                    No {getStatusInfo(selectedStatus).label.toLowerCase()} tournaments found
                                </>
                            )}
                        </p>
                        {(searchTerm || dateFilter !== 'all') && (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-auto flex items-center justify-center border border-blue-500/20 hover:border-blue-500/40"
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
                                        className="px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-auto flex items-center justify-center border border-blue-500/20 hover:border-blue-500/40"
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
