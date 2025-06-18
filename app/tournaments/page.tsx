import { Suspense } from 'react'
import TournamentsContent from '@/components/tournaments/TournamentsContent'

// Loading component for the suspense boundary
function TournamentsLoading() {
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
                    <div className="h-9 w-32 bg-gray-700 rounded animate-pulse" />
                    <div className="flex items-center space-x-4">
                        <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
                        <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
                        <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="group relative bg-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-pulse">
                            {/* Clean background glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="relative z-10">
                                <div className="flex flex-col">
                                    {/* Tournament Image - Top */}
                                    <div className="flex justify-center mb-3">
                                        <div className="relative w-32 h-32 bg-gray-600/60 rounded-xl border border-gray-700/40" />
                                    </div>
                                    
                                    {/* Content - Bottom */}
                                    <div className="text-center">
                                        <div className="mb-3">
                                            <div className="h-5 w-48 bg-gray-700 rounded mb-1 mx-auto" />
                                            <div className="h-4 w-32 bg-gray-700 rounded mx-auto" />
                                        </div>

                                        {/* Date & Time - Clean Display */}
                                        <div className="mb-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 bg-purple-400/50 rounded" />
                                                <div className="text-center">
                                                    <div className="h-4 w-32 bg-gray-700 rounded mb-1" />
                                                    <div className="h-3 w-24 bg-gray-700 rounded mx-auto" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 mt-1">
                                                <div className="w-3 h-3 bg-gray-400/50 rounded" />
                                                <div className="h-3 w-16 bg-gray-700 rounded" />
                                            </div>
                                        </div>
                                        
                                        {/* Tournament Info Badges */}
                                        <div className="flex flex-wrap justify-center gap-2 mb-3">
                                            {/* Status Badge */}
                                            <div className={`h-6 px-3 rounded-lg border ${
                                                i % 3 === 0 ? 'bg-blue-500/20 border-blue-500/30' : 
                                                i % 3 === 1 ? 'bg-green-500/20 border-green-500/30' : 'bg-gray-500/20 border-gray-500/30'
                                            }`}>
                                                <div className={`h-3 w-12 rounded mt-1.5 ${
                                                    i % 3 === 0 ? 'bg-blue-400/50' : 
                                                    i % 3 === 1 ? 'bg-green-400/50' : 'bg-gray-400/50'
                                                }`} />
                                            </div>
                                            
                                            {/* Tier Badge */}
                                            <div className={`h-6 px-3 rounded-lg border ${
                                                i % 5 === 0 ? 'bg-yellow-500/20 border-yellow-500/30' :
                                                i % 5 === 1 ? 'bg-blue-500/20 border-blue-500/30' :
                                                i % 5 === 2 ? 'bg-green-500/20 border-green-500/30' :
                                                i % 5 === 3 ? 'bg-orange-500/20 border-orange-500/30' : 'bg-red-500/20 border-red-500/30'
                                            }`}>
                                                <div className={`h-3 w-8 rounded mt-1.5 ${
                                                    i % 5 === 0 ? 'bg-yellow-400/50' :
                                                    i % 5 === 1 ? 'bg-blue-400/50' :
                                                    i % 5 === 2 ? 'bg-green-400/50' :
                                                    i % 5 === 3 ? 'bg-orange-400/50' : 'bg-red-400/50'
                                                }`} />
                                            </div>
                                        </div>

                                        {/* Prize Pool */}
                                        <div className="mb-3 px-3 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 bg-green-400/50 rounded" />
                                                <div className="h-4 w-16 bg-gray-700 rounded" />
                                            </div>
                                        </div>

                                        {/* Teams Section */}
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <div className="w-4 h-4 bg-gray-400/50 rounded" />
                                                <div className="h-4 w-16 bg-gray-700 rounded" />
                                                <div className="h-4 w-8 bg-gray-700 rounded" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[...Array(6)].map((_, j) => (
                                                    <div key={j} className="flex items-center space-x-1">
                                                        <div className="w-6 h-6 bg-gray-600/60 rounded-xl" />
                                                        <div className="h-3 w-8 bg-gray-700 rounded" />
                                                    </div>
                                                ))}
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

export default function TournamentsPage() {
    return (
        <Suspense fallback={<TournamentsLoading />}>
            <TournamentsContent />
        </Suspense>
    )
}
