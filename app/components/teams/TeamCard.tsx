import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Users, Trophy, User, Calendar, Clock, Globe, Star } from 'lucide-react'
import type { Team } from '@/types/esports'

interface TeamCardProps {
    team: Team
}

export default function TeamCard({ team }: TeamCardProps) {
    const router = useRouter()

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/teams/${team.id}`)
    }
    const getTeamImage = () => {
        const imageUrl = team.image_url;
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-team.svg';
    }

    const getPlayerImage = (player: NonNullable<Team['players']>[0]) => {
        return player.image_url && player.image_url !== '' ? player.image_url : '/images/placeholder-player.svg';
    }

    const getPlayers = () => {
        if (!team.players || !Array.isArray(team.players)) return [];
        return team.players.slice(0, 8); // Show max 8 players for better display
    }

    const getTournamentInfo = () => {
        if (!team.tournaments || team.tournaments.length === 0) return null;
        
        const now = new Date();
        
        // First, try to find a currently running tournament
        const runningTournament = team.tournaments.find(tournament => {
            const startDate = new Date(tournament.begin_at);
            const endDate = new Date(tournament.end_at);
            return now >= startDate && now <= endDate;
        });
        
        if (runningTournament) {
            return runningTournament;
        }
        
        // If no running tournament, find the next upcoming tournament
        const upcomingTournaments = team.tournaments
            .filter(tournament => {
                const startDate = new Date(tournament.begin_at);
                return now < startDate;
            })
            .sort((a, b) => new Date(a.begin_at).getTime() - new Date(b.begin_at).getTime());
        
        if (upcomingTournaments.length > 0) {
            return upcomingTournaments[0];
        }
        
        // If no upcoming tournaments, get the most recent finished tournament
        const finishedTournaments = team.tournaments
            .filter(tournament => {
                const endDate = new Date(tournament.end_at);
                return now > endDate;
            })
            .sort((a, b) => new Date(b.end_at).getTime() - new Date(a.end_at).getTime());
        
        if (finishedTournaments.length > 0) {
            return finishedTournaments[0];
        }
        
        // Fallback to the first tournament
        return team.tournaments[0];
    }

    const formatPlayerName = (player: NonNullable<Team['players']>[0]) => {
        if (player.first_name && player.last_name) {
            return `${player.first_name} "${player.name}" ${player.last_name}`;
        } else if (player.first_name) {
            return `${player.first_name} "${player.name}"`;
        } else if (player.last_name) {
            return `"${player.name}" ${player.last_name}`;
        }
        return player.name;
    }

    // Helper function to get flag component from country code (same as TeamRoster)
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

    const formatTournamentDate = (dateString: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZoneName: 'short'
        });
    }

    const getTournamentStatus = (tournament: NonNullable<Team['tournaments']>[0]) => {
        const now = new Date();
        const startDate = new Date(tournament.begin_at);
        const endDate = new Date(tournament.end_at);
        
        if (now < startDate) {
            return { status: 'upcoming', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' };
        } else if (now >= startDate && now <= endDate) {
            return { status: 'ongoing', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' };
        } else {
            return { status: 'finished', color: 'text-gray-400', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' };
        }
    }

    const getTierColor = (tier: string) => {
        const tierColors: { [key: string]: string } = {
            's': 'text-yellow-400',
            'a': 'text-orange-400',
            'b': 'text-blue-400',
            'c': 'text-green-400',
            'd': 'text-gray-400'
        };
        return tierColors[tier?.toLowerCase()] || 'text-gray-400';
    }

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

    const players = getPlayers();
    const tournamentInfo = getTournamentInfo();

    return (
        <div className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 animate-slide-up hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
        >
            {/* Subtle background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
                {/* Team Header */}
                <div className="flex items-center space-x-3 mb-4">
                    <div 
                        onClick={handleImageClick}
                        className="relative w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg ring-2 ring-gray-600/30 group-hover:ring-purple-500/30 transition-all duration-300 cursor-pointer hover:ring-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105"
                    >
                        <Image
                            src={getTeamImage()}
                            alt={team.name}
                            fill
                            className="rounded-lg object-cover"
                            priority={false}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder-team.svg';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 rounded-lg" />
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                    </div>
                    <div 
                        onClick={handleImageClick}
                        className="flex-1 cursor-pointer"
                    >
                        <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-purple-100 transition-colors duration-200 hover:text-cyan-300">{team.name}</h3>
                        {team.acronym && (
                            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-200 hover:text-cyan-200">{team.acronym}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Tournament Information */}
                    {tournamentInfo && (
                        <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                                <Trophy className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                                <div className="flex-1">
                                    <div className="font-medium">{tournamentInfo.name}</div>
                                    {tournamentInfo.league && (
                                        <div className="text-xs text-gray-400">League: {tournamentInfo.league.name}</div>
                                    )}
                                    {tournamentInfo.serie && (
                                        <div className="text-xs text-gray-400">
                                            Serie: {tournamentInfo.serie.full_name || tournamentInfo.serie.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Tournament Details */}
                            <div className="grid grid-cols-1 gap-2 text-xs">
                                {/* Schedule */}
                                {(tournamentInfo.begin_at || tournamentInfo.end_at) && (
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-3 h-3 text-gray-500" />
                                        <span className="text-gray-400">
                                            {formatTournamentDate(tournamentInfo.begin_at)} - {formatTournamentDate(tournamentInfo.end_at)}
                                        </span>
                                        {(() => {
                                            const statusInfo = getTournamentStatus(tournamentInfo);
                                            return (
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} flex items-center gap-1`}>
                                                    <Clock className="w-3 h-3" />
                                                    {statusInfo.status.toUpperCase()}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                )}
                                
                                {/* Tier and Region */}
                                <div className="flex items-center space-x-4">
                                    {tournamentInfo.tier && (
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-3 h-3 text-gray-500" />
                                            <span className="text-gray-400">Tier:</span>
                                            <span className={`font-medium ${getTierColor(tournamentInfo.tier)}`}>
                                                {tournamentInfo.tier.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {(tournamentInfo.region || tournamentInfo.league?.region) && (
                                        <div className="flex items-center space-x-1">
                                            <Globe className="w-3 h-3 text-gray-500" />
                                            <span className="text-gray-400">
                                                {tournamentInfo.region || tournamentInfo.league?.region}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Players */}
                    {players.length > 0 && (
                        <div className="pt-3 border-t border-gray-700 group-hover:border-gray-600 transition-colors duration-300">
                            <div className="flex items-center justify-between text-sm mb-3">
                                <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                                    <Users className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                                    <span className="font-medium">Players</span>
                                </div>
                                <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-200">
                                    {players.length} player{players.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {players.map((player, index) => (
                                    <div key={player.id || index} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-800/50 group-hover:bg-gray-700/50 transition-colors duration-200">
                                        {/* Player Image */}
                                        <div className="relative w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full ring-1 ring-gray-600/30 flex-shrink-0">
                                            <Image
                                                src={getPlayerImage(player)}
                                                alt={player.name}
                                                fill
                                                className="rounded-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/placeholder-player.svg';
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Player Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium text-white text-sm truncate">
                                                    {formatPlayerName(player)}
                                                </span>
                                                {player.active === false && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                                {/* Nationality */}
                                                {player.nationality && (
                                                    <div className="flex items-center space-x-1">
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
                                                                    const parent = target.parentElement;
                                                                    if (parent) {
                                                                        parent.innerHTML = `<span class="text-xs text-gray-400">${player.nationality}</span>`;
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-gray-400">{player.nationality}</span>
                                                        )}
                                                        <span className="text-xs">{player.nationality}</span>
                                                    </div>
                                                )}
                                                
                                                {/* Age and Birthday */}
                                                {(player.age || player.birthday) && (
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>
                                                            {player.age && `${player.age} years`}
                                                            {player.age && player.birthday && ' • '}
                                                            {player.birthday && formatBirthday(player.birthday)}
                                                            {!player.age && player.birthday && `${calculateAge(player.birthday)} years`}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {/* Role */}
                                                {player.role && (
                                                    <div className="flex items-center space-x-1">
                                                        <User className="w-3 h-3" />
                                                        <span>{player.role}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No players message */}
                    {players.length === 0 && (
                        <div className="pt-3 border-t border-gray-700 group-hover:border-gray-600 transition-colors duration-300">
                            <div className="flex items-center text-sm text-gray-500">
                                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>No player information available</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
