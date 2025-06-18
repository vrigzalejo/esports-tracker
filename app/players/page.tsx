import { Suspense } from 'react'
import type { Metadata } from 'next'
import PlayersContent from '@/components/players/PlayersContent'

export const metadata: Metadata = {
  title: 'Professional Esports Players & Profiles - EsportsTracker',
  description: 'Discover professional esports players, view detailed profiles, track statistics, and follow your favorite gaming athletes across all competitions.',
  keywords: ['esports players', 'professional gamers', 'player profiles', 'gaming athletes', 'player statistics', 'esports pros'],
  openGraph: {
    title: 'Professional Esports Players & Profiles - EsportsTracker',
    description: 'Discover professional esports players, view detailed profiles, track statistics, and follow your favorite gaming athletes across all competitions.',
    type: 'website',
  }
}

// Loading component for the suspense boundary
function PlayersLoading() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header skeleton */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded" />
                            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="flex-1 max-w-lg mx-8">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <div className="h-5 w-5 bg-gray-600 rounded" />
                                </div>
                                <div className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 h-10 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="p-2 w-9 h-9 bg-gray-700 rounded-lg animate-pulse" />
                            <div className="p-2 w-9 h-9 bg-gray-700 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Navigation skeleton */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 h-12 items-center">
                        <div className="h-5 w-16 bg-gray-700 rounded animate-pulse" />
                        <div className="h-5 w-20 bg-gray-700 rounded animate-pulse" />
                        <div className="h-5 w-24 bg-gray-700 rounded animate-pulse" />
                        <div className="h-5 w-16 bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
            </nav>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-9 w-20 bg-gray-700 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="group bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 animate-pulse overflow-hidden">
                            {/* Player Image */}
                            <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-600 to-gray-700">
                                {/* Status indicator */}
                                <div className="absolute top-3 right-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${i % 2 === 0 ? 'bg-green-400/50' : 'bg-red-400/50'}`} />
                                </div>
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>
                            
                            {/* Player Info */}
                            <div className="p-5 space-y-4">
                                {/* Player Name */}
                                <div className="text-center">
                                    <div className="h-5 w-24 bg-gray-700 rounded mb-1 mx-auto" />
                                    <div className="h-4 w-16 bg-gray-700 rounded mx-auto" />
                                </div>

                                {/* Key Info Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Nationality */}
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-3 bg-gray-700 rounded-sm" />
                                        <div className="h-4 w-8 bg-gray-700 rounded" />
                                    </div>
                                    
                                    {/* Age */}
                                    <div className="flex items-center justify-end space-x-1">
                                        <div className="w-4 h-4 bg-gray-700 rounded" />
                                        <div className="h-4 w-12 bg-gray-700 rounded" />
                                    </div>
                                </div>

                                {/* Team & Game */}
                                <div className="space-y-2">
                                    {/* Current Team */}
                                    <div className="flex items-center space-x-3 p-3 bg-gray-700/40 rounded-lg">
                                        <div className="w-6 h-6 bg-gray-600 rounded-md" />
                                        <div className="flex-1 min-w-0">
                                            <div className="h-3 w-8 bg-gray-700 rounded mb-1" />
                                            <div className="h-4 w-20 bg-gray-700 rounded" />
                                        </div>
                                    </div>

                                    {/* Current Game */}
                                    <div className="flex items-center space-x-3 p-3 bg-gray-700/40 rounded-lg">
                                        <div className="p-1.5 bg-purple-500/20 rounded-md">
                                            <div className="w-3 h-3 bg-purple-400/50 rounded" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="h-3 w-8 bg-gray-700 rounded mb-1" />
                                            <div className="h-4 w-24 bg-gray-700 rounded" />
                                        </div>
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

export default function PlayersPage() {
    return (
        <Suspense fallback={<PlayersLoading />}>
            <PlayersContent />
        </Suspense>
    )
} 
