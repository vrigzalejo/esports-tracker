'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, MapPin, Calendar, Gamepad2 } from 'lucide-react'
import type { Player } from '@/types/roster'

interface PlayerCardProps {
    player: Player
}

export default function PlayerCard({ player }: PlayerCardProps) {
    const router = useRouter()

    const handlePlayerClick = () => {
        router.push(`/players/${player.id}`)
    }

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/players/${player.id}`)
    }

    // Helper function to get flag component from country code
    const getFlagPath = (countryCode: string): string => {
        return countryCode ? `/flags/3x2/${countryCode}.svg` : '';
    }

    const formatBirthday = (birthday: string) => {
        if (!birthday) return null;
        const date = new Date(birthday);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    return (
        <div 
            onClick={handlePlayerClick}
            className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer animate-slide-up hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
        >
            {/* Subtle background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
                {/* Player Header */}
                <div className="flex flex-col items-center mb-4">
                    <div 
                        onClick={handleImageClick}
                        className="relative w-32 h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl ring-2 ring-gray-600/30 group-hover:ring-purple-500/30 transition-all duration-300 mb-3 overflow-hidden cursor-pointer hover:ring-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105"
                    >
                        <Image 
                            src={player.image_url || '/images/placeholder-player.svg'} 
                            alt={player.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/placeholder-player.svg'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 rounded-xl" />
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        
                        {/* Active status indicator */}
                        {player.active !== undefined && (
                            <div className="absolute top-2 right-2">
                                <div 
                                    className={`w-4 h-4 rounded-full ring-2 ring-gray-800 ${player.active ? 'bg-green-400' : 'bg-red-400'}`}
                                    title={player.active ? 'Active' : 'Inactive'} 
                                />
                            </div>
                        )}
                    </div>
                    
                    <div 
                        onClick={handleImageClick}
                        className="text-center cursor-pointer"
                    >
                        <h3 className="text-lg font-bold text-white leading-tight group-hover:text-purple-100 transition-colors duration-200 mb-1 hover:text-cyan-300">
                            {player.name}
                        </h3>
                        {(player.first_name || player.last_name) && (
                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200 hover:text-cyan-200">
                                {[player.first_name, player.last_name].filter(Boolean).join(' ')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Nationality */}
                    {player.nationality && (
                        <div className="flex items-center justify-center text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                            <div className="relative w-4 h-3 mr-2 flex-shrink-0">
                                {getFlagPath(player.nationality) ? (
                                    <Image
                                        src={getFlagPath(player.nationality)}
                                        alt={`${player.nationality} flag`}
                                        width={16}
                                        height={12}
                                        className="object-cover rounded-sm"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                            <span>{player.nationality}</span>
                        </div>
                    )}

                    {/* Age */}
                    {player.age && (
                        <div className="flex items-center justify-center text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                            <span>Age {player.age}</span>
                        </div>
                    )}

                    {/* Birthday */}
                    {player.birthday && (
                        <div className="flex items-center justify-center text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                            <span>{formatBirthday(player.birthday)}</span>
                        </div>
                    )}

                    {/* Current Team */}
                    {player.current_team && (
                        <div className="flex items-center justify-center text-sm text-blue-400 group-hover:text-blue-300 transition-colors duration-200">
                            <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{player.current_team.name}</span>
                        </div>
                    )}

                    {/* Current Game */}
                    {player.current_videogame && (
                        <div className="mt-4 pt-3 border-t border-gray-700 group-hover:border-gray-600 transition-colors duration-300">
                            <div className="flex items-center justify-center text-sm text-purple-400 group-hover:text-purple-300 transition-colors duration-200">
                                <Gamepad2 className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{player.current_videogame.name}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 
