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
                        <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 animate-pulse">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex gap-2">
                                    <div className="h-6 w-20 bg-gray-700 rounded-full" />
                                    <div className="h-6 w-24 bg-gray-700 rounded-full" />
                                </div>
                                <div className="h-6 w-16 bg-gray-700 rounded-full" />
                            </div>

                            <div className="flex items-center justify-center mb-6">
                                <div className="grid grid-cols-[auto_auto_auto] items-center gap-4 sm:gap-6">
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-700 rounded-xl" />
                                        <div className="h-4 w-16 bg-gray-700 rounded" />
                                    </div>
                                    <div className="h-6 w-8 bg-gray-700 rounded" />
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-700 rounded-xl" />
                                        <div className="h-4 w-16 bg-gray-700 rounded" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="h-6 w-28 bg-gray-700 rounded-full" />
                                <div className="h-6 w-28 bg-gray-700 rounded-full" />
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <div className="h-6 w-32 bg-gray-700 rounded-full" />
                                <div className="h-6 w-40 bg-gray-700 rounded-full" />
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
