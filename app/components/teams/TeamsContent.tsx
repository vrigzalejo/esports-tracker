'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import TeamCard from '@/components/teams/TeamCard'
import { useTeams } from '@/hooks/useEsportsData'
import type { Team } from '@/types/esports'

export default function TeamsContent() {
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
        router.push(`/teams?${params.toString()}`)
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

    // Fetch teams data using the hook
    const { data: teams, loading: teamsLoading } = useTeams({
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm
    })

    // Teams are already filtered by the API based on search term
    const currentTeams = teams

    // Pagination logic - assuming we have consistent page sizes
    const hasMorePages = teams.length === itemsPerPage
    const totalPages = hasMorePages ? currentPage + 1 : currentPage

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

    // Calculate display indices for results info
    const startIndex = (currentPage - 1) * itemsPerPage + 1

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={handleSearch} />
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Teams
                    </h1>

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

                {/* Loading State */}
                {teamsLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(itemsPerPage)].map((_, i) => (
                            <div key={i} className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 animate-pulse">
                                {/* Subtle background glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-xl opacity-50" />
                                
                                <div className="relative z-10">
                                    {/* Team Header */}
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="relative w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg ring-2 ring-gray-600/30" />
                                        <div className="flex-1">
                                            <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
                                            <div className="h-4 bg-gray-700 rounded w-1/2" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Current Videogame */}
                                        <div className="bg-gray-700/30 rounded-lg py-2 px-3">
                                            <div className="flex items-center justify-center">
                                                <div className="w-4 h-4 bg-gray-600 rounded mr-2" />
                                                <div className="h-4 bg-gray-600 rounded w-24" />
                                            </div>
                                        </div>

                                        {/* Tournament Information */}
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-gray-600 rounded mr-2 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-700 rounded w-full mb-1" />
                                                    <div className="h-3 bg-gray-700 rounded w-2/3 mb-1" />
                                                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                                                </div>
                                            </div>
                                            
                                            {/* Tournament Details */}
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-3 h-3 bg-gray-600 rounded" />
                                                    <div className="h-3 bg-gray-700 rounded w-2/3" />
                                                    <div className="h-4 w-16 bg-gray-600 rounded-full" />
                                                </div>
                                                
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-1">
                                                        <div className="w-3 h-3 bg-gray-600 rounded" />
                                                        <div className="h-3 bg-gray-700 rounded w-8" />
                                                        <div className="h-3 bg-gray-600 rounded w-4" />
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-1">
                                                        <div className="w-3 h-3 bg-gray-600 rounded" />
                                                        <div className="h-3 bg-gray-700 rounded w-12" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Players Section */}
                                        <div className="pt-3 border-t border-gray-700">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-gray-600 rounded mr-2" />
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
                                                                {/* Nationality */}
                                                                <div className="flex items-center space-x-1">
                                                                    <div className="w-4 h-3 bg-gray-600 rounded-sm" />
                                                                    <div className="h-3 bg-gray-700 rounded w-6" />
                                                                </div>
                                                                
                                                                {/* Age */}
                                                                <div className="flex items-center space-x-1">
                                                                    <div className="w-3 h-3 bg-gray-600 rounded" />
                                                                    <div className="h-3 bg-gray-700 rounded w-12" />
                                                                </div>
                                                                
                                                                {/* Role */}
                                                                <div className="flex items-center space-x-1">
                                                                    <div className="w-3 h-3 bg-gray-600 rounded" />
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
                )}

                {/* Teams Grid */}
                {!teamsLoading && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentTeams.map((team: Team) => (
                                <TeamCard key={team.id} team={team} />
                            ))}
                        </div>

                        {/* Empty State */}
                        {currentTeams.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <div className="text-gray-400 text-lg mb-2">No teams found</div>
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

                        {/* Results info */}
                        <div className="text-center text-gray-400 mt-4">
                            <div>
                                Showing {startIndex}-{Math.min(currentPage * itemsPerPage, startIndex + currentTeams.length - 1)} teams
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
} 
