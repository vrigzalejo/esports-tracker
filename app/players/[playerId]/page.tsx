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
                    {/* Header */}
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full ring-2 ring-gray-600/30">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 rounded-full" />
                        </div>
                        <div className="flex-1">
                            <div className="h-8 w-64 bg-gray-700 rounded mb-2" />
                            <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
                            <div className="h-4 w-48 bg-gray-700 rounded" />
                        </div>
                    </div>

                    {/* Content sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
                                <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-16 bg-gray-700/50 rounded" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
                                <div className="h-6 w-24 bg-gray-700 rounded mb-4" />
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-700/50 rounded" />
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