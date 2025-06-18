import { Suspense } from 'react'
import PlayerDetailsContent from '../../components/players/PlayerDetailsContent'

// Loading component for the suspense boundary
function PlayerDetailsLoading() {
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
                <div className="animate-pulse">
                    {/* Back button skeleton */}
                    <div className="h-6 w-16 bg-gray-700 rounded mb-6" />
                    
                    {/* Player Header */}
                    <div className="relative bg-gradient-to-br from-gray-800/90 via-gray-800 to-gray-900 rounded-2xl p-8 mb-8 border border-gray-700/50">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                            {/* Player Image */}
                            <div className="relative w-32 h-32 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl border-2 border-gray-600/40" />
                            
                            {/* Player Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="h-10 w-64 bg-gray-700 rounded mb-3" />
                                <div className="h-6 w-48 bg-gray-700 rounded mb-4" />
                                
                                {/* Player Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="bg-gray-700/30 rounded-lg p-3">
                                            <div className="h-3 w-12 bg-gray-700 rounded mb-2" />
                                            <div className="h-5 w-16 bg-gray-700 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Tournaments */}
                        <div className="lg:col-span-2">
                            <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="h-7 w-32 bg-gray-700 rounded" />
                                    <div className="h-6 w-8 bg-gray-700 rounded" />
                                </div>
                                
                                {/* Tournament Cards */}
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-gray-600/60 rounded-lg" />
                                                    <div>
                                                        <div className="h-5 w-40 bg-gray-700 rounded mb-2" />
                                                        <div className="h-4 w-32 bg-gray-700 rounded" />
                                                    </div>
                                                </div>
                                                <div className="h-6 w-16 bg-blue-500/20 rounded-lg px-3 py-1.5 border border-blue-500/30" />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <div className="h-6 w-20 bg-orange-500/20 rounded-lg px-3 py-1.5 border border-orange-500/30" />
                                                <div className="h-6 w-16 bg-yellow-500/20 rounded-lg px-3 py-1.5 border border-yellow-500/30" />
                                                <div className="h-6 w-24 bg-green-500/20 rounded-lg px-3 py-1.5 border border-green-500/30" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Current Team */}
                            <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
                                <div className="h-6 w-24 bg-gray-700 rounded mb-4" />
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gray-600/60 rounded-lg" />
                                    <div>
                                        <div className="h-5 w-32 bg-gray-700 rounded mb-2" />
                                        <div className="h-4 w-24 bg-gray-700 rounded" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Player Details */}
                            <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
                                <div className="h-6 w-20 bg-gray-700 rounded mb-4" />
                                <div className="space-y-3">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="h-4 w-16 bg-gray-700 rounded" />
                                            <div className="h-4 w-20 bg-gray-700 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Recent Activity */}
                            <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
                                <div className="h-6 w-28 bg-gray-700 rounded mb-4" />
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-600/60 rounded-lg" />
                                            <div className="flex-1">
                                                <div className="h-4 w-24 bg-gray-700 rounded mb-1" />
                                                <div className="h-3 w-16 bg-gray-700 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

interface PlayerDetailsPageProps {
    params: Promise<{
        playerId: string
    }>
}

export default async function PlayerDetailsPage({ params }: PlayerDetailsPageProps) {
    const { playerId } = await params
    
    return (
        <Suspense fallback={<PlayerDetailsLoading />}>
            <PlayerDetailsContent playerId={playerId} />
        </Suspense>
    )
} 
