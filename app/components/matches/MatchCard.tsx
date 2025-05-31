import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import type { Match } from '@/types/esports'
import { getStatusColor, getStatusText, formatDate } from '@/lib/utils'

interface MatchCardProps {
    match: Match
}

export default function MatchCard({ match }: MatchCardProps) {
    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-200 cursor-pointer animate-slide-up">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(match.status)}`}>
                        {getStatusText(match.status)}
                    </span>
                    <span className="text-gray-400 text-sm">{match.videogame.name}</span>
                </div>
                <span className="text-gray-400 text-sm">{formatDate(match.begin_at)}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src={match.opponents[0]?.opponent.image_url || '/api/placeholder/32/32'}
                                alt={match.opponents[0]?.opponent.name || 'Team'}
                                fill
                                className="rounded object-cover"
                            />
                        </div>
                        <span className="text-white font-medium">{match.opponents[0]?.opponent.name}</span>
                    </div>
                    <span className="text-gray-400 font-bold">vs</span>
                    <div className="flex items-center space-x-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src={match.opponents[1]?.opponent.image_url || '/api/placeholder/32/32'}
                                alt={match.opponents[1]?.opponent.name || 'Team'}
                                fill
                                className="rounded object-cover"
                            />
                        </div>
                        <span className="text-white font-medium">{match.opponents[1]?.opponent.name}</span>
                    </div>
                </div>
                {match.status === 'running' && (
                    <div className="flex items-center text-red-400">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2" />
                        LIVE
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{match.tournament.league.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    )
}
