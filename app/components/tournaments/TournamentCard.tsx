import Image from 'next/image'
import { Calendar } from 'lucide-react'
import type { Tournament } from '@/types/esports'
import { formatDate } from '@/lib/utils'

interface TournamentCardProps {
    tournament: Tournament
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-200 cursor-pointer animate-slide-up">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12">
                        <Image
                            src={tournament.league.image_url}
                            alt={tournament.league.name}
                            fill
                            className="rounded-lg object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">{tournament.name}</h3>
                        <p className="text-gray-400 text-sm">{tournament.videogame.name}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-green-400 font-bold">{tournament.prize_pool}</p>
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
