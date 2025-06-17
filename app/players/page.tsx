import { Suspense } from 'react'
import PlayersContent from '@/components/players/PlayersContent'

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
