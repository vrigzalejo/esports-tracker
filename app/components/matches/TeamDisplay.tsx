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
        <div className="flex flex-col items-center space-y-2">
            <div className="relative">
                <div 
                    className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gray-800/60 rounded-xl border border-gray-700/40 hover:border-gray-600/60 transition-colors duration-200 cursor-pointer overflow-hidden"
                    onClick={handleTeamClick}
                >
                    <Image
                        src={getTeamImage(opponent)}
                        alt={getTeamName(opponent)}
                        fill
                        className="object-contain rounded-xl p-1.5"
                        priority={false}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder-team.svg';
                        }}
                    />
                </div>
                {isWinner && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 shadow-sm">
                        <Crown className="w-2.5 h-2.5 text-white" />
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center space-y-1">
                <span 
                    onClick={handleTeamClick}
                    className={`font-medium text-center text-xs cursor-pointer hover:text-gray-300 transition-colors duration-200 ${isWinner ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                    {getTeamName(opponent)}
                </span>
                {showScore && score !== undefined && (
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
                        isLive
                            ? 'bg-blue-500/20 text-blue-400'
                            : isWinner
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-700/40 text-gray-400'
                    }`}>
                        {score}
                    </span>
                )}
            </div>
        </div>
    )
} 
