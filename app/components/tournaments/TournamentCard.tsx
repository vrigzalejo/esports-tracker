import { useState } from 'react'
import Image from 'next/image'
import { Calendar, MapPin, Users, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import type { Tournament } from '@/types/esports'
import { parseRegion, parseCountry, parseTournamentType } from '@/lib/tournamentUtils'

interface TournamentCardProps {
    tournament: Tournament
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
    const [showAllTeams, setShowAllTeams] = useState(false)

    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Format date in user's current timezone
    const formatDateInUserTimezone = (dateString: string) => {
        if (!dateString) return 'TBD'

        const date = new Date(dateString)
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: userTimezone,
            timeZoneName: 'short'
        }

        return date.toLocaleDateString('en-US', options)
    }

    const getLeagueImage = () => {
        const imageUrl = tournament.league.image_url;
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-tournament.svg';
    }

    const formatPrizePool = (prizePool: string | undefined | null): string => {
        if (!prizePool || prizePool.trim() === '') return 'TBD';
        
        // Handle common "TBD" or "To be determined" cases
        const lowerPrizePool = prizePool.toLowerCase().trim();
        if (lowerPrizePool === 'tbd' || lowerPrizePool === 'to be determined' || lowerPrizePool === 'n/a') {
            return 'TBD';
        }
        
        // Detect currency from the original string
        let currencySymbol = '$'; // Default to USD
        
        // Check for currency symbols
        if (/€/.test(prizePool)) currencySymbol = '€';
        else if (/£/.test(prizePool)) currencySymbol = '£';
        else if (/¥/.test(prizePool)) currencySymbol = '¥';
        else if (/₹/.test(prizePool)) currencySymbol = '₹';
        else if (/₽/.test(prizePool)) currencySymbol = '₽';
        
        // Check for currency names/codes
        else if (/indonesian rupiah|idr/gi.test(prizePool)) currencySymbol = 'IDR';
        else if (/euro|eur/gi.test(prizePool)) currencySymbol = '€';
        else if (/british pound|gbp/gi.test(prizePool)) currencySymbol = '£';
        else if (/japanese yen|jpy/gi.test(prizePool)) currencySymbol = '¥';
        else if (/indian rupee|inr/gi.test(prizePool)) currencySymbol = '₹';
        else if (/russian ruble|rub/gi.test(prizePool)) currencySymbol = '₽';
        else if (/chinese yuan|cny/gi.test(prizePool)) currencySymbol = '¥';
        else if (/korean won|krw/gi.test(prizePool)) currencySymbol = '₩';
        else if (/thai baht|thb/gi.test(prizePool)) currencySymbol = '฿';
        
        // Extract numeric value
        let numericValue = prizePool;
        
        // Remove all currency-related text but keep K/M suffixes
        numericValue = numericValue.replace(/[$€£¥₹₽₩฿]/g, '');
        numericValue = numericValue.replace(/united states dollar|us dollar|indonesian rupiah|euro|british pound|japanese yen|indian rupee|russian ruble|chinese yuan|korean won|thai baht|singapore dollar|malaysian ringgit|philippine peso|vietnamese dong|brazilian real|mexican peso|canadian dollar|australian dollar|new zealand dollar|south african rand|turkish lira|polish zloty|czech koruna|hungarian forint|norwegian krone|swedish krona|danish krone|swiss franc/gi, '');
        numericValue = numericValue.replace(/\b(usd|eur|gbp|jpy|inr|rub|cny|krw|thb|sgd|myr|php|vnd|brl|mxn|cad|aud|nzd|zar|try|pln|czk|huf|nok|sek|dkk|chf|idr)\b/gi, '');
        numericValue = numericValue.replace(/[,\s]+/g, '');
        
        // Check for K/M suffixes
        const hasK = /k$/i.test(numericValue.trim());
        const hasM = /m$/i.test(numericValue.trim());
        
        // Extract numbers
        const cleanValue = numericValue.replace(/[^0-9.]/g, '');
        let value = parseFloat(cleanValue);
        
        if (isNaN(value) || value <= 0) return 'TBD';
        
        // Apply multipliers
        if (hasK && !hasM) {
            value = value * 1000;
        } else if (hasM) {
            value = value * 1000000;
        }
        
        // Format with original currency
        if (value >= 1000000) {
            return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${currencySymbol}${(value / 1000).toFixed(1)}K`;
        } else {
            return `${currencySymbol}${value.toLocaleString()}`;
        }
    }

    const getTierBadge = (tier?: string): string => {
        if (!tier) return 'bg-gray-600';
        switch (tier.toLowerCase()) {
            case 's': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'a': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'b': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'c': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'd': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
        }
    }

    const getTournamentStatus = (tournament: Tournament) => {
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

    // Parse tournament data using utilities
    const region = parseRegion(tournament)
    const country = parseCountry(tournament)
    const tournamentType = parseTournamentType(tournament)

    return (
        <div className="group relative bg-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 hover:bg-white/[0.04]">
            {/* Clean background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
                <div className="flex flex-col">
                    {/* Tournament Image - Top */}
                    <div className="flex justify-center mb-3">
                        <div className="relative w-28 h-28">
                            <div className="absolute inset-0 bg-white/5 rounded-2xl backdrop-blur-sm shadow-2xl" />
                            <div className="relative w-full h-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-3 border border-white/20 backdrop-blur-md">
                                <div className="relative w-full h-full rounded-xl overflow-hidden bg-white/5">
                                    <Image
                                        src={getLeagueImage()}
                                        alt={tournament.league.name}
                                        fill
                                        className="object-contain object-center filter drop-shadow-lg"
                                        priority={false}
                                        sizes="84px"
                                        quality={100}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/images/placeholder-tournament.svg';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Content - Bottom */}
                    <div className="text-center">
                        <div className="mb-3">
                            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-purple-100 transition-colors duration-300 mb-1">
                                {tournament.league.name}
                                {tournament.serie?.name && ` • ${tournament.serie.name}`}
                                {tournament.serie?.year && ` ${tournament.serie.year}`}
                                {` • ${tournament.name}`}
                            </h3>
                            <p className="text-gray-300 text-sm font-medium">{tournament.videogame.name}</p>
                        </div>

                        {/* Date & Time - Clean Display */}
                        <div className="mb-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <div className="text-center">
                                    <div className="text-gray-200 font-medium">
                                        {formatDateInUserTimezone(tournament.begin_at)}
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        to {formatDateInUserTimezone(tournament.end_at)}
                                    </div>
                                </div>
                            </div>
                            {country && (
                                <div className="flex items-center justify-center gap-2 text-xs mt-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-400">{country}</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Prize Pool - Compact */}
                        {tournament.prizepool && (
                            <div className="mb-3">
                                <p className="text-green-400 font-bold text-2xl group-hover:text-green-300 transition-colors duration-300">{formatPrizePool(tournament.prizepool)}</p>
                                <p className="text-gray-400 text-xs font-medium">Prize Pool</p>
                            </div>
                        )}
                        
                        {/* Badges - Compact */}
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            {(() => {
                                const statusInfo = getTournamentStatus(tournament);
                                return (
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} flex items-center gap-1 backdrop-blur-sm`}>
                                        <Clock className="w-3 h-3" />
                                        {statusInfo.status.toUpperCase()}
                                    </span>
                                );
                            })()}
                            {tournamentType && (
                                <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-lg text-xs font-semibold backdrop-blur-sm">
                                    {tournamentType}
                                </span>
                            )}
                            {tournament.tier && (
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm ${getTierBadge(tournament.tier)}`}>
                                    Tier {tournament.tier.toUpperCase()}
                                </span>
                            )}
                            {region && (
                                <span className="px-2.5 py-1 bg-gray-500/20 text-gray-200 border border-gray-400/30 rounded-lg text-xs font-semibold backdrop-blur-sm">
                                    {region}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Participating Teams */}
                <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-400 font-medium">
                                Teams {tournament.teams && tournament.teams.length > 0 ? `(${tournament.teams.length})` : ''}
                            </span>
                        </div>
                        {tournament.teams && tournament.teams.length > 6 && (
                            <button
                                onClick={() => setShowAllTeams(!showAllTeams)}
                                className="flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            >
                                {showAllTeams ? (
                                    <>
                                        <span>Show less</span>
                                        <ChevronUp className="w-3 h-3 ml-1" />
                                    </>
                                ) : (
                                    <>
                                        <span>Show all</span>
                                        <ChevronDown className="w-3 h-3 ml-1" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    
                    {tournament.teams && tournament.teams.length > 0 ? (
                        <div className={`grid grid-cols-2 gap-2 ${showAllTeams ? 'max-h-32' : 'max-h-20'} overflow-y-auto transition-all duration-300`}>
                            {(showAllTeams ? tournament.teams : tournament.teams.slice(0, 6)).map((team) => (
                                <div key={team.id} className="flex items-center space-x-2 text-xs">
                                    {team.image_url ? (
                                        <div className="relative w-4 h-4 bg-gradient-to-br from-gray-600 to-gray-700 rounded-md flex-shrink-0 overflow-hidden shadow-sm ring-1 ring-gray-600/20">
                                            <Image
                                                src={team.image_url}
                                                alt={team.name}
                                                fill
                                                className="rounded-md object-cover object-center"
                                                sizes="16px"
                                                quality={85}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 rounded-md flex items-center justify-center"><span class="text-gray-400 text-xs font-medium">' + team.name.charAt(0).toUpperCase() + '</span></div>';
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-4 h-4 bg-gradient-to-br from-gray-600 to-gray-700 rounded-md flex-shrink-0 flex items-center justify-center shadow-sm ring-1 ring-gray-600/20">
                                            <span className="text-gray-400 text-xs font-medium">{team.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                    <span className="text-gray-300 truncate">
                                        {team.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-2">
                            <span className="text-gray-500 text-xs italic">No teams announced yet</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
