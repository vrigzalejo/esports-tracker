import { Suspense } from 'react'
import MatchesContent from '@/components/matches/MatchesContent'

// Loading component for the suspense boundary
function MatchesLoading() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        <div key={i} className="group bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-gray-700/50 transition-all duration-300 shadow-lg relative overflow-hidden animate-pulse">
                            {/* Glowing effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-50" />

                            {/* Content Container with consistent spacing */}
                            <div className="relative z-10 space-y-5">
                                {/* Header with status, game, and buttons */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Status badge */}
                                        <div className={`h-6 px-3 rounded-lg border ${
                                            i % 3 === 0 ? 'bg-red-500/20 border-red-500/30' :
                                            i % 3 === 1 ? 'bg-blue-500/20 border-blue-500/30' : 'bg-yellow-500/20 border-yellow-500/30'
                                        }`}>
                                            <div className={`h-3 w-8 rounded mt-1.5 ${
                                                i % 3 === 0 ? 'bg-red-400/50' :
                                                i % 3 === 1 ? 'bg-blue-400/50' : 'bg-yellow-400/50'
                                            }`} />
                                        </div>
                                        {/* Game badge */}
                                        <div className="h-6 w-20 bg-purple-500/20 rounded-lg border border-purple-500/30" />
                                        {/* BO badge */}
                                        <div className="h-6 w-12 bg-purple-500/20 rounded-lg border border-purple-500/30" />
                                    </div>
                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gray-700/50 rounded-lg" />
                                        <div className="w-8 h-8 bg-gray-700/50 rounded-lg" />
                                    </div>
                                </div>

                                {/* Teams Section */}
                                <div className="flex items-center justify-center">
                                    <div className="grid grid-cols-[auto_auto_auto] items-center gap-4 sm:gap-6">
                                        {/* Team 1 */}
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gray-700/50 rounded-xl border border-gray-600/30" />
                                            <div className="h-4 w-16 bg-gray-300/30 rounded" />
                                            {/* Score placeholder */}
                                            {i % 2 === 0 && (
                                                <div className="w-8 h-8 bg-gray-600/30 rounded-lg border border-gray-500/30" />
                                            )}
                                        </div>

                                        {/* VS */}
                                        <div className="flex flex-col items-center">
                                            <div className="h-6 w-8 bg-gray-600/50 rounded flex items-center justify-center">
                                                <span className="text-gray-500 text-sm font-bold">VS</span>
                                            </div>
                                        </div>

                                        {/* Team 2 */}
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gray-700/50 rounded-xl border border-gray-600/30" />
                                            <div className="h-4 w-14 bg-gray-300/30 rounded" />
                                            {/* Score placeholder */}
                                            {i % 2 === 0 && (
                                                <div className="w-8 h-8 bg-gray-600/30 rounded-lg border border-gray-500/30" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Date and Time */}
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6">
                                    <div className="flex items-center bg-gray-900/30 px-3 py-1 rounded-lg">
                                        <div className="w-4 h-4 bg-gray-500/50 rounded mr-2" />
                                        <div className="h-4 w-20 bg-gray-400/30 rounded" />
                                    </div>
                                    <div className="flex items-center bg-gray-900/30 px-3 py-1 rounded-lg">
                                        <div className="w-4 h-4 bg-gray-500/50 rounded mr-2" />
                                        <div className="h-4 w-24 bg-gray-400/30 rounded" />
                                    </div>
                                    {/* Countdown placeholder */}
                                    {i % 3 !== 1 && (
                                        <div className="flex items-center px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/20">
                                            <div className="w-4 h-4 bg-green-400/50 rounded mr-2" />
                                            <div className="h-4 w-16 bg-green-400/30 rounded" />
                                        </div>
                                    )}
                                </div>

                                {/* Match Information */}
                                <div className="space-y-3">
                                    {/* Tournament stage and format */}
                                    <div className="flex items-center justify-center gap-3 flex-wrap">
                                        <div className="h-6 w-24 bg-orange-400/20 rounded-lg px-3 py-1.5 border border-orange-400/30" />
                                        <div className="h-6 w-12 bg-blue-400/20 rounded-lg px-3 py-1.5 border border-blue-400/30" />
                                        <div className="h-6 w-16 bg-yellow-400/20 rounded-lg px-3 py-1.5 border border-yellow-400/30" />
                                    </div>
                                    
                                    {/* AI Predictions Button */}
                                    <div className="flex justify-center">
                                        <div className="h-7 w-32 bg-indigo-500/10 rounded-lg border border-indigo-500/20" />
                                    </div>
                                    
                                    {/* League info */}
                                    <div className="text-center">
                                        <div className="h-4 w-48 bg-gray-400/30 rounded mx-auto mb-2" />
                                        <div className="h-3 w-32 bg-gray-500/30 rounded mx-auto" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function MatchesPage() {
    return (
        <Suspense fallback={<MatchesLoading />}>
            <MatchesContent />
        </Suspense>
    )
}
