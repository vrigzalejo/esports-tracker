'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, MapPin, Gamepad2, Calendar } from 'lucide-react'
import type { Player } from '@/types/roster'

interface PlayerCardProps {
    player: Player
}

export default function PlayerCard({ player }: PlayerCardProps) {
    const router = useRouter()

    const handlePlayerClick = () => {
        router.push(`/players/${player.id}`)
    }

    // Helper function to get flag component from country code
    const getFlagPath = (countryCode: string): string => {
        return countryCode ? `/flags/3x2/${countryCode}.svg` : '';
    }

    // Helper function to calculate age from birthday
    const calculateAge = (birthday: string) => {
        if (!birthday) return null;
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    return (
        <div 
            onClick={handlePlayerClick}
            className="group bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 cursor-pointer hover:bg-gray-800/80 overflow-hidden"
        >
            {/* Player Image */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-600 to-gray-700 overflow-hidden">
                <Image 
                    src={player.image_url || '/images/placeholder-player.svg'} 
                    alt={player.name}
                    fill
                    unoptimized
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/placeholder-player.svg'
                    }}
                />
                
                {/* Status indicator */}
                {player.active !== undefined && (
                    <div className="absolute top-3 right-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${player.active ? 'bg-green-400' : 'bg-red-400'} shadow-lg`} />
                    </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            
            {/* Player Info */}
            <div className="p-5 space-y-4">
                {/* Player Name */}
                <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-200 transition-colors">
                        {player.name}
                    </h3>
                    {(player.first_name || player.last_name) && (
                        <p className="text-sm text-gray-400">
                            {[player.first_name, player.last_name].filter(Boolean).join(' ')}
                        </p>
                    )}
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {/* Nationality */}
                    {player.nationality && (
                        <div className="flex items-center space-x-2">
                            <div className="relative w-4 h-3 rounded-sm overflow-hidden flex-shrink-0">
                                {getFlagPath(player.nationality) ? (
                                    <Image
                                        src={getFlagPath(player.nationality)}
                                        alt={`${player.nationality} flag`}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                            <span className="text-gray-300 font-medium truncate">{player.nationality}</span>
                        </div>
                    )}
                    
                    {/* Age */}
                    {(player.age || player.birthday) && (
                        <div className="flex items-center justify-end space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-300 font-medium">
                                {player.age || calculateAge(player.birthday!)} years
                            </span>
                        </div>
                    )}
                </div>

                {/* Team & Game */}
                <div className="space-y-2">
                    {/* Current Team */}
                    {player.current_team && (
                        <div 
                            className="flex items-center space-x-3 p-3 bg-gray-700/40 rounded-lg hover:bg-gray-700/60 transition-colors cursor-pointer group"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (player.current_team?.id) {
                                    router.push(`/teams/${player.current_team.id}`);
                                }
                            }}
                        >
                            <div className="relative w-6 h-6 bg-gray-600 rounded-md overflow-hidden flex-shrink-0">
                                {player.current_team.image_url ? (
                                    <Image
                                        src={player.current_team.image_url}
                                        alt={`${player.current_team.name} logo`}
                                        fill
                                        unoptimized
                                        className="object-contain p-0.5"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-3 h-3 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Team</p>
                                <p className="text-sm text-white font-semibold truncate group-hover:text-blue-200 transition-colors">
                                    {player.current_team.name}
                                </p>
                            </div>
                            <div className="text-blue-400/60 group-hover:text-blue-400 transition-colors">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Current Game */}
                    {player.current_videogame && (
                        <div 
                            className="flex items-center space-x-3 p-3 bg-gray-700/40 rounded-lg hover:bg-gray-700/60 transition-colors cursor-pointer group"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/matches?game=${encodeURIComponent(player.current_videogame!.slug)}`);
                            }}
                        >
                            <div className="p-1.5 bg-purple-500/20 rounded-md group-hover:bg-purple-500/30 transition-colors">
                                <Gamepad2 className="w-3 h-3 text-purple-400 group-hover:text-purple-300 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Game</p>
                                <p className="text-sm text-white font-semibold truncate group-hover:text-purple-200 transition-colors">
                                    {player.current_videogame.name}
                                </p>
                            </div>
                            <div className="text-purple-400/60 group-hover:text-purple-400 transition-colors">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 
