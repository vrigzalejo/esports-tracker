import Image from 'next/image'
import { Crown } from 'lucide-react'

interface Opponent {
    opponent: {
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
    const getTeamImage = (opponent: Opponent) => {
        const imageUrl = opponent?.opponent?.image_url;
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-team.svg';
    }

    const getTeamName = (opponent: Opponent) => {
        return opponent?.opponent?.name || 'TBD'
    }

    return (
        <div className="flex flex-col items-center space-y-3">
            <div className="relative">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl border-2 border-gray-600/30 shadow-lg transform hover:scale-105 transition-all duration-300 group-hover:border-blue-500/30">
                    <Image
                        src={getTeamImage(opponent)}
                        alt={getTeamName(opponent)}
                        fill
                        className="object-cover rounded-xl"
                        priority={false}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder-team.svg';
                        }}
                    />
                </div>
                {isWinner && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500/90 backdrop-blur-sm rounded-full p-1 shadow-lg z-10">
                        <Crown className="w-3 h-3 text-white" size={12} />
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