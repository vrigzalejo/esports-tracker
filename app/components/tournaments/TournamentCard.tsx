import Image from 'next/image'
import { Calendar } from 'lucide-react'
import type { Tournament } from '@/types/esports'
import { formatDate } from '@/lib/utils'

interface TournamentCardProps {
    tournament: Tournament
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
    const getLeagueImage = () => {
        const imageUrl = tournament.league.image_url;
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-tournament.svg';
    }

    const formatPrizePool = (prizePool: string | undefined | null): string => {
        if (!prizePool) return 'TBD';
        
        // Remove any currency symbols and commas, keep only numbers and decimal points
        const numericValue = prizePool.replace(/[^0-9.]/g, '');
        const value = parseFloat(numericValue);
        
        if (isNaN(value)) return 'TBD';
        
        // Format based on value size
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`;
        } else {
            return `$${value.toFixed(0)}`;
        }
    }

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-200 cursor-pointer animate-slide-up">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg">
                        <Image
                            src={getLeagueImage()}
                            alt={tournament.league.name}
                            fill
                            className="rounded-lg object-cover"
                            priority={false}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder-tournament.svg';
                            }}
                        />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">{tournament.name}</h3>
                        <p className="text-gray-400 text-sm">{tournament.videogame.name}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-green-400 font-bold">{formatPrizePool(tournament.prizepool)}</p>
                    <p className="text-gray-400 text-xs">Prize Pool</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-300">
                        {formatDate(tournament.begin_at)} - {formatDate(tournament.end_at)}
                    </span>
                </div>
            </div>
        </div>
    )
}
