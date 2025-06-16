'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PlayerCard from './PlayerCard'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePlayers } from '@/hooks/useEsportsData'

export default function PlayersContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Initialize state from URL parameters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('per_page') || '20'))

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
    }, [searchTerm, currentPage, itemsPerPage, searchParams, router])

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

    // Fetch players data using the hook
    const { data: players, loading: playersLoading } = usePlayers({
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm
    })

    // Pagination logic - assuming we have consistent page sizes
    const hasMorePages = players.length === itemsPerPage
    const totalPages = hasMorePages ? currentPage + 1 : currentPage

    // Calculate display indices for results info
    const startIndex = (currentPage - 1) * itemsPerPage + 1
    const endIndex = Math.min(currentPage * itemsPerPage, players.length)

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={handleSearch} />
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Players
                    </h1>

                    <div className="flex items-center space-x-4 flex-wrap gap-2">
                        {/* Search */}
                        <div className="flex-1 max-w-md relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search players..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                            />
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
                            <option value="100" className="cursor-pointer">100 per page</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {playersLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(itemsPerPage)].map((_, i) => (
                            <div key={i} className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 animate-pulse">
                                {/* Subtle background glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-xl opacity-0" />
                                
                                <div className="relative z-10">
                                    <div className="flex flex-col items-center mb-4">
                                        <div className="relative w-32 h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl ring-2 ring-gray-600/30 mb-3">
                                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 rounded-xl" />
                                        </div>
                                        <div className="text-center">
                                            <div className="h-5 w-24 bg-gray-700 rounded mb-1" />
                                            <div className="h-4 w-16 bg-gray-700 rounded" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center text-sm">
                                            <div className="w-4 h-3 bg-gray-700 rounded mr-2 flex-shrink-0" />
                                            <div className="h-4 w-12 bg-gray-700 rounded" />
                                        </div>
                                        <div className="flex items-center justify-center text-sm">
                                            <div className="w-4 h-4 bg-gray-700 rounded mr-2 flex-shrink-0" />
                                            <div className="h-4 w-16 bg-gray-700 rounded" />
                                        </div>
                                        <div className="flex items-center justify-center text-sm">
                                            <div className="w-4 h-4 bg-gray-700 rounded mr-2 flex-shrink-0" />
                                            <div className="h-4 w-20 bg-gray-700 rounded" />
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-gray-700 group-hover:border-gray-600 transition-colors duration-300">
                                            <div className="flex items-center justify-center text-sm">
                                                <div className="w-4 h-4 bg-gray-700 rounded mr-2 flex-shrink-0" />
                                                <div className="h-4 w-24 bg-gray-700 rounded" />
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

                        {/* Empty State */}
                        {players.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <div className="text-gray-400 text-lg mb-2">No players found</div>
                                <div className="text-gray-500">Try adjusting your search criteria</div>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 mt-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors cursor-pointer"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <button
                                    className="px-3 py-2 rounded-lg bg-blue-600 text-white cursor-pointer"
                                >
                                    {currentPage}
                                </button>

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

                        {/* Results info */}
                        <div className="text-center text-gray-400 mt-4">
                            <div>
                                Showing {startIndex}-{endIndex} of {players.length} players
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
} 
