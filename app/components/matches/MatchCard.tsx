import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import type { Match } from '@/types/esports'
import { getStatusColor, getStatusText, formatDate } from '@/lib/utils'

interface MatchCardProps {
    match: Match
}

export default function MatchCard({ match }: MatchCardProps) {
    const getTeamImage = (opponent: any) => {
        return opponent?.opponent?.image_url || '/images/placeholder-team.svg'
    }

    const getTeamName = (opponent: any) => {
        return opponent?.opponent?.name || 'TBD'
    }

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
                        <div className="relative w-8 h-8 bg-gray-700 rounded overflow-hidden">
                            <Image
                                src={getTeamImage(match.opponents[0])}
                                alt={getTeamName(match.opponents[0])}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/placeholder-team.svg';
                                }}
                            />
                        </div>
                        <span className="text-white font-medium">{getTeamName(match.opponents[0])}</span>
                    </div>
                    <span className="text-gray-400 font-bold">vs</span>
                    <div className="flex items-center space-x-2">
                        <div className="relative w-8 h-8 bg-gray-700 rounded overflow-hidden">
                            <Image
                                src={getTeamImage(match.opponents[1])}
                                alt={getTeamName(match.opponents[1])}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/placeholder-team.svg';
                                }}
                            />
                        </div>
                        <span className="text-white font-medium">{getTeamName(match.opponents[1])}</span>
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
                <span className="text-gray-400">{match.league.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    )
}
