'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PlayerCard from './PlayerCard'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import { Users, ChevronLeft, ChevronRight, List } from 'lucide-react'
import type { Player } from '@/types/roster'
import { getDropdownValue, saveDropdownValue } from '@/lib/localStorage'
import { trackPageView } from '@/lib/analytics'

// Component that uses useSearchParams and needs Suspense
function PlayersContentWithSearchParams() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Initialize state from URL parameters with local storage fallback
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('per_page') || getDropdownValue('playerItemsPerPage', 20).toString()))

    // Track page view on component mount
    useEffect(() => {
        trackPageView('/players', 'Players - Professional Esports Players & Profiles')
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
        router.push(`/players?${params.toString()}`)
    }

    // Update URL when filters change
    useEffect(() => {
        const updates: Record<string, string | null> = {
            search: searchTerm || null,
            page: currentPage.toString(),
            per_page: itemsPerPage.toString()
        }

        updateUrlParams(updates)
    }, [searchTerm, currentPage, itemsPerPage])

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1) // Reset to first page when searching
    }

    const handlePageChange = (page: number) => {
        if (page >= 1) {
            setCurrentPage(page)
        }
    }

    // Reset to first page when filters change
    const resetPage = () => setCurrentPage(1)

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items)
        resetPage()
        saveDropdownValue('playerItemsPerPage', items)
    }

    // Fetch players data - fetch multiple pages to get more players
    const [allPlayers, setAllPlayers] = useState<Player[]>([])
    const [isLoadingAllPlayers, setIsLoadingAllPlayers] = useState(true)

    // Fetch multiple pages of players
    useEffect(() => {
        const fetchAllPlayers = async () => {
            setIsLoadingAllPlayers(true)
            try {
                const { getPlayers } = await import('@/lib/clientApi')
                const players = []
                let page = 1
                let hasMore = true

                // Fetch up to 5 pages (250 players max) to avoid infinite loading
                while (hasMore && page <= 5) {
                    const pagePlayers = await getPlayers({
                        page,
                        per_page: 50,
                        search: searchTerm
                    })
                    
                    if (pagePlayers && pagePlayers.length > 0) {
                        players.push(...pagePlayers)
                        hasMore = pagePlayers.length === 50 // Continue if we got a full page
                        page++
                    } else {
                        hasMore = false
                    }
                }

                setAllPlayers(players)
            } catch (error) {
                console.error('Error fetching all players:', error)
                setAllPlayers([])
            } finally {
                setIsLoadingAllPlayers(false)
            }
        }

        fetchAllPlayers()
    }, [searchTerm])

    const playersLoading = isLoadingAllPlayers

    // Implement client-side pagination since API returns all results
    const totalPlayers = allPlayers.length
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const players = allPlayers.slice(startIndex, endIndex)

    // Pagination logic - based on total available data
    const totalPages = Math.ceil(totalPlayers / itemsPerPage)
    const hasMorePages = currentPage < totalPages



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
                for (let i = newStart; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                for (let i = start; i <= end; i++) {
                    pages.push(i)
                }
            }

            // Add ellipsis if needed
            if (start > 1) {
                if (start > 2) {
                    pages.unshift('...')
                }
                pages.unshift(1)
            }
            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pages.push('...')
                }
                pages.push(totalPages)
            }
        }

        return pages
    }

    // Generate descriptive no data message
    const getNoDataMessage = () => {
        let message = "No players found"
        if (searchTerm) {
            message += ` matching "${searchTerm}"`
        }
        return message
    }

    // Generate helpful suggestions for no data state
    const getNoDataSuggestions = () => {
        const suggestions = []
        
        if (searchTerm) {
            suggestions.push("Try different search terms")
        } else {
            suggestions.push("Try searching for players or teams")
        }
        
        return suggestions
    }



    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearch={handleSearch} />
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Players
                    </h1>

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

                {/* Loading State */}
                {playersLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(itemsPerPage)].map((_, i) => (
                            <div key={i} className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer animate-slide-up hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 animate-pulse">
                                {/* Subtle background glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                <div className="relative z-10">
                                    <div className="flex flex-col items-center">
                                        {/* Player Image - Full Size */}
                                        <div className="w-full h-64 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl mb-4 ring-2 ring-gray-600/30 group-hover:ring-purple-500/30 transition-all duration-300" />
                                    
                                        {/* Player Name */}
                                        <div className="text-center mb-4">
                                            <div className="h-5 w-24 bg-gray-700 rounded mb-1" />
                                            <div className="h-4 w-16 bg-gray-700 rounded" />
                                        </div>

                                        {/* Player Info */}
                                        <div className="w-full space-y-3">
                                            {/* Nationality & Age */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-4 h-3 bg-gray-700 rounded mr-2" />
                                                    <div className="h-4 w-8 bg-gray-700 rounded" />
                                                </div>
                                                <div className="h-4 w-12 bg-gray-700 rounded" />
                                            </div>
                                            
                                            {/* Team */}
                                            <div className="bg-gray-700/30 rounded-lg py-2 px-3">
                                                <div className="flex items-center justify-center">
                                                    <div className="w-4 h-4 bg-gray-700 rounded mr-2" />
                                                    <div className="h-4 w-20 bg-gray-700 rounded" />
                                                </div>
                                            </div>
                                            
                                            {/* Game */}
                                            <div className="bg-gray-700/30 rounded-lg py-2 px-3">
                                                <div className="flex items-center justify-center">
                                                    <div className="w-4 h-4 bg-gray-700 rounded mr-2" />
                                                    <div className="h-4 w-16 bg-gray-700 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Players Grid */}
                {!playersLoading && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {players.map((player) => (
                                <PlayerCard key={player.id} player={player} />
                            ))}
                        </div>



                        {/* Empty State - moved here above pagination */}
                        {players.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-gray-400 text-lg mb-3">{getNoDataMessage()}</h3>
                                <div className="space-y-1">
                                    {getNoDataSuggestions().map((suggestion, index) => (
                                        <p key={index} className="text-gray-500 text-sm">{suggestion}</p>
                                    ))}
                                </div>
                            </div>
                        )}



                        {/* Pagination */}
                        {(currentPage > 1 || hasMorePages) && (
                            <div className="flex items-center justify-center space-x-2 mt-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors cursor-pointer"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {getPageNumbers().map((pageNum, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : undefined}
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
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors cursor-pointer"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Pagination Description */}
                        {players.length > 0 && (
                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-500">
                                    Showing {players.length} players per page
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

// Loading component for search params suspense
function PlayersContentLoading() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm="" onSearch={() => {}} />
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Players
                    </h1>
                    <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 animate-pulse">
                            <div className="w-full h-64 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl mb-4" />
                            <div className="text-center mb-4">
                                <div className="h-5 w-24 bg-gray-700 rounded mb-1 mx-auto" />
                                <div className="h-4 w-16 bg-gray-700 rounded mx-auto" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-4 h-3 bg-gray-700 rounded mr-2" />
                                        <div className="h-4 w-8 bg-gray-700 rounded" />
                                    </div>
                                    <div className="h-4 w-12 bg-gray-700 rounded" />
                                </div>
                                <div className="bg-gray-700/30 rounded-lg py-2 px-3">
                                    <div className="flex items-center justify-center">
                                        <div className="w-4 h-4 bg-gray-700 rounded mr-2" />
                                        <div className="h-4 w-20 bg-gray-700 rounded" />
                                    </div>
                                </div>
                                <div className="bg-gray-700/30 rounded-lg py-2 px-3">
                                    <div className="flex items-center justify-center">
                                        <div className="w-4 h-4 bg-gray-700 rounded mr-2" />
                                        <div className="h-4 w-16 bg-gray-700 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

// Main export component with Suspense boundary
export default function PlayersContent() {
    return (
        <Suspense fallback={<PlayersContentLoading />}>
            <PlayersContentWithSearchParams />
        </Suspense>
    )
} 
