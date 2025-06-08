'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Crown } from 'lucide-react'

interface Opponent {
    opponent: {
        id: number
        name: string
        image_url: string
    }
}

interface TeamDisplayProps {
    opponent: Opponent
    score?: number
    isWinner: boolean
    isLive: boolean
    showScore: boolean
}

export default function TeamDisplay({ 
    opponent, 
    score, 
    isWinner, 
    isLive, 
    showScore 
}: TeamDisplayProps) {
    const router = useRouter()

    const getTeamImage = (opponent: Opponent) => {
        const imageUrl = opponent?.opponent?.image_url;
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-team.svg';
    }

    const getTeamName = (opponent: Opponent) => {
        return opponent?.opponent?.name || 'TBD'
    }

    const handleTeamClick = () => {
        if (opponent?.opponent?.id) {
            router.push(`/teams/${opponent.opponent.id}`)
        }
    }

    return (
        <div className="flex flex-col items-center space-y-3">
            <div className="relative">
                <div 
                    className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-600/40 shadow-xl transform hover:scale-105 transition-all duration-300 group-hover:border-blue-500/40 cursor-pointer backdrop-blur-sm overflow-hidden"
                    onClick={handleTeamClick}
                >
                    <div className="absolute inset-0.5 bg-gradient-to-br from-gray-700/20 to-gray-800/20 rounded-2xl" />
                    <Image
                        src={getTeamImage(opponent)}
                        alt={getTeamName(opponent)}
                        fill
                        className="object-contain rounded-2xl p-1.5 relative z-10"
                        priority={false}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder-team.svg';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl pointer-events-none" />
                </div>
                {isWinner && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-yellow-600 backdrop-blur-sm rounded-full p-1.5 shadow-lg z-20 border border-yellow-300/30">
                        <Crown className="w-3 h-3 text-white drop-shadow-sm" size={12} />
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center space-y-1">
                <span className={`font-bold text-center text-xs sm:text-sm ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                    {getTeamName(opponent)}
                </span>
                {showScore && score !== undefined && (
                    <span className={`text-lg sm:text-xl font-bold px-3 py-1 rounded-lg ${
                        isLive
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                            : isWinner
                                ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                : 'bg-gray-700/30 text-gray-400 border border-gray-600/20'
                    }`}>
                        {score}
                    </span>
                )}
            </div>
        </div>
    )
} 
