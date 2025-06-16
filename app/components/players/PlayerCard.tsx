'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, MapPin, Gamepad2 } from 'lucide-react'
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

    return (
        <div 
            onClick={handlePlayerClick}
            className="group relative bg-gray-800 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10"
        >
            <div className="flex flex-col items-center">
                {/* Player Image */}
                <div className="relative w-24 h-24 bg-gray-700 rounded-xl overflow-hidden mb-4 ring-1 ring-gray-600/50 group-hover:ring-purple-500/30 transition-all duration-200">
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
                    
                    {/* Active status indicator */}
                    {player.active !== undefined && (
                        <div className="absolute top-2 right-2">
                            <div 
                                className={`w-3 h-3 rounded-full ring-1 ring-gray-800 ${player.active ? 'bg-green-400' : 'bg-red-400'}`}
                                title={player.active ? 'Active' : 'Inactive'} 
                            />
                        </div>
                    )}
                </div>
                
                {/* Player Name */}
                <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-100 transition-colors duration-200">
                        {player.name}
                    </h3>
                    {(player.first_name || player.last_name) && (
                        <p className="text-sm text-gray-400">
                            {[player.first_name, player.last_name].filter(Boolean).join(' ')}
                        </p>
                    )}
                </div>

                {/* Player Info */}
                <div className="w-full space-y-3">
                    {/* Nationality & Age */}
                    <div className="flex items-center justify-between text-sm">
                        {player.nationality && (
                            <div className="flex items-center text-gray-300">
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
                        
                        {player.age && (
                            <div className="text-gray-300">
                                Age {player.age}
                            </div>
                        )}
                    </div>

                    {/* Current Team */}
                    {player.current_team && (
                        <div className="flex items-center justify-center text-sm text-blue-400 bg-gray-700/30 rounded-lg py-2 px-3">
                            {player.current_team.image_url ? (
                                <div className="relative w-4 h-4 mr-2 flex-shrink-0">
                                    <Image
                                        src={player.current_team.image_url}
                                        alt={`${player.current_team.name} logo`}
                                        width={16}
                                        height={16}
                                        className="object-contain"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : (
                                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            )}
                            <span className="truncate font-medium">{player.current_team.name}</span>
                        </div>
                    )}

                    {/* Current Game */}
                    {player.current_videogame && (
                        <div className="flex items-center justify-center text-sm text-purple-400 bg-gray-700/30 rounded-lg py-2 px-3">
                            <Gamepad2 className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate font-medium">{player.current_videogame.name}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 
