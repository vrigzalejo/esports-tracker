import Image from 'next/image'
import { Star } from 'lucide-react'
import type { Team } from '@/types/esports'

interface TeamCardProps {
    team: Team
}

export default function TeamCard({ team }: TeamCardProps) {
    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-200 cursor-pointer animate-slide-up">
            <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16">
                    <Image
                        src={team.image_url}
                        alt={team.name}
                        fill
                        className="rounded-lg object-cover"
                    />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                    <p className="text-gray-400">{team.acronym}</p>
                    <p className="text-gray-500 text-sm">{team.location}</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center text-yellow-400 mb-1">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="text-sm">8.5</span>
                    </div>
                    <p className="text-gray-400 text-xs">Rating</p>
                </div>
            </div>
        </div>
    )
}
