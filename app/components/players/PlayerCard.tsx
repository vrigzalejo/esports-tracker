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

    // Helper function to format birthday
    const formatBirthday = (birthday: string) => {
        if (!birthday) return null;
        const date = new Date(birthday);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
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
            className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer animate-slide-up hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
        >
            {/* Subtle background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
                <div className="flex flex-col items-center">
                    {/* Player Image - Full Size */}
                    <div className="relative w-full h-64 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl overflow-hidden mb-4 ring-2 ring-gray-600/30 group-hover:ring-purple-500/30 transition-all duration-300 hover:ring-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20">
                                            <Image 
                            src={player.image_url || '/images/placeholder-player.svg'} 
                            alt={player.name}
                            fill
                            className="object-cover object-top"
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
                
                {/* Player Info */}
                <div className="p-4">
                    {/* Player Name */}
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-100 transition-colors duration-200 hover:text-cyan-300">
                            {player.name}
                        </h3>
                        {(player.first_name || player.last_name) && (
                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200 hover:text-cyan-200">
                                {[player.first_name, player.last_name].filter(Boolean).join(' ')}
                            </p>
                        )}
                    </div>

                    {/* Player Details */}
                    <div className="space-y-3">
                    {/* Nationality & Age */}
                    <div className="flex items-center justify-between text-sm">
                        {player.nationality && (
                            <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
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
                        
                        {(player.age || player.birthday) && (
                            <div className="text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                                {player.age && `Age ${player.age}`}
                                {!player.age && player.birthday && `Age ${calculateAge(player.birthday)}`}
                            </div>
                        )}
                    </div>

                    {/* Birthday */}
                    {player.birthday && (
                        <div className="flex items-center justify-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-purple-400" />
                            <span>{formatBirthday(player.birthday)}</span>
                        </div>
                    )}

                    {/* Current Team */}
                    {player.current_team && (
                        <div 
                            className="bg-gray-700/30 rounded-lg py-2 px-3 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (player.current_team?.id) {
                                    router.push(`/teams/${player.current_team.id}`);
                                }
                            }}
                        >
                                    <div className="flex items-center justify-center text-sm rounded-lg py-2 px-3">
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
                                    <User className="w-4 h-4 mr-2 flex-shrink-0 text-blue-400" />
                                )}
                                <span className="text-gray-300 group-hover:text-gray-200 transition-colors duration-200 truncate font-medium hover:text-blue-300">
                                    {player.current_team.name}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Current Game */}
                    {player.current_videogame && (
                        <div className="bg-gray-700/30 rounded-lg py-2 px-3">
                            <div className="flex items-center justify-center text-sm">
                                <Gamepad2 className="w-4 h-4 mr-2 flex-shrink-0 text-purple-400" />
                                <span className="text-gray-300 group-hover:text-gray-200 transition-colors duration-200 truncate font-medium">
                                    {player.current_videogame.name}
                                </span>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
} 
