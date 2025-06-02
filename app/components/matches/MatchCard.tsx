import Image from 'next/image'
import { Calendar, Clock, Trophy, Users, Star, Globe, Crown, ExternalLink, Tv, Play } from 'lucide-react'
import type { Match } from '@/types/esports'
import { getStatusColor, getStatusText } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

interface MatchCardProps {
    match: Match
}

interface Opponent {
    opponent: {
        name: string
        image_url: string
    }
}

export default function MatchCard({ match }: MatchCardProps) {
    const [showStreams, setShowStreams] = useState(false)

    const getTeamImage = (opponent: Opponent) => {
        const imageUrl = opponent?.opponent?.image_url;
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-team.svg';
    }

    const getTeamName = (opponent: Opponent) => {
        return opponent?.opponent?.name || 'TBD'
    }

    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Format date and time with timezone
    const formatDateTime = (dateString: string) => {
        if (!dateString) return { date: 'TBD', time: 'TBD' }

        const date = new Date(dateString)
        const dateOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: userTimezone
        }
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: userTimezone,
            timeZoneName: 'short'
        }

        const formattedDate = date.toLocaleDateString('en-US', dateOptions)
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions)

        return { date: formattedDate, time: formattedTime }
    }

    // Get tournament stage information
    const getTournamentStage = () => {
        // Check various possible fields for stage information
        const stageName = match.tournament?.name || match.serie?.name || match.league?.name

        if (!stageName) return null

        // Common stage mappings
        const stageMap: { [key: string]: string } = {
            'group': 'Group Stage',
            'groups': 'Group Stage',
            'group_stage': 'Group Stage',
            'swiss': 'Swiss Stage',
            'swiss_stage': 'Swiss Stage',
            'playoff': 'Playoffs',
            'playoffs': 'Playoffs',
            'elimination': 'Playoffs',
            'bracket': 'Playoffs',
            'final': 'Finals',
            'finals': 'Finals',
            'semifinal': 'Semifinals',
            'semifinals': 'Semifinals',
            'quarterfinal': 'Quarterfinals',
            'quarterfinals': 'Quarterfinals'
        }

        const normalizedStage = stageName.toLowerCase().replace(/[-_\s]/g, '')
        return stageMap[normalizedStage] || stageName
    }

    // Get tournament stage color based on stage type
    const getStageColor = (stage: string | null) => {
        if (!stage) return 'text-purple-400'

        const lowerStage = stage.toLowerCase()
        if (lowerStage.includes('group')) return 'text-blue-400'
        if (lowerStage.includes('swiss')) return 'text-green-400'
        if (lowerStage.includes('playoff')) return 'text-orange-400'
        if (lowerStage.includes('final')) return 'text-red-400'

        return 'text-purple-400'
    }

    // Get number of games format
    const getGamesFormat = () => {
        if (match.number_of_games) {
            const games = match.number_of_games
            if (games === 1) return 'BO1'
            if (games === 3) return 'BO3'
            if (games === 5) return 'BO5'
            if (games === 7) return 'BO7'
            return `BO${games}`
        }
        return null
    }

    // Get league tier information
    const getLeagueTier = () => {
        // Check various possible fields for tier information
        const tier = match.tournament?.tier || match.league?.tier || match.serie?.tier

        if (!tier) return null

        // Common tier mappings
        const tierMap: { [key: string]: string } = {
            's': 'S-Tier',
            'a': 'A-Tier',
            'b': 'B-Tier',
            'c': 'C-Tier',
            'd': 'D-Tier',
            'tier_1': 'Tier 1',
            'tier_2': 'Tier 2',
            'tier_3': 'Tier 3',
            'major': 'Major',
            'premier': 'Premier',
            'pro': 'Professional',
            'regional': 'Regional',
            'local': 'Local'
        }

        const normalizedTier = tier.toString().toLowerCase().replace(/[-_\s]/g, '')
        return tierMap[normalizedTier] || `Tier ${tier}`
    }

    // Get complete league information
    const getLeagueInfo = () => {
        const league = match.league?.name || ''
        const serie = match.serie?.full_name || match.serie?.name || ''

        return league && serie ? `${league} - ${serie}` : league || serie;
    }

    // Get region information
    const getRegion = () => {
        // Check various possible fields for region
        const region = match.tournament?.region ||
            match.league?.region ||
            match.serie?.region ||
            match.region

        if (!region) return null

        // Common region mappings
        const regionMap: { [key: string]: string } = {
            'na': 'North America',
            'eu': 'Europe',
            'asia': 'Asia',
            'apac': 'Asia-Pacific',
            'emea': 'EMEA',
            'americas': 'Americas',
            'international': 'International',
            'global': 'Global',
            'world': 'World',
            'oceania': 'Oceania',
            'mena': 'MENA',
            'latam': 'Latin America',
            'kr': 'Korea',
            'cn': 'China',
            'jp': 'Japan',
            'sea': 'Southeast Asia'
        }

        const normalizedRegion = region.toString().toLowerCase().replace(/[-_\s]/g, '')
        return regionMap[normalizedRegion] || region
    }

    // Get match results and winner information
    const getMatchResults = () => {
        // Check if match is finished or running
        const isFinished = match.status === 'finished' || match.status === 'completed'
        const isLive = match.status === 'running'

        if ((!isFinished && !isLive) || !match.results || match.results.length === 0) {
            return null
        }

        // Get scores from results
        const team1Score = match.results[0]?.score || 0
        const team2Score = match.results[1]?.score || 0

        // Determine winner (only for finished matches)
        let winnerIndex = -1
        if (isFinished) {
            if (team1Score > team2Score) {
                winnerIndex = 0
            } else if (team2Score > team1Score) {
                winnerIndex = 1
            }
        }

        return {
            team1Score,
            team2Score,
            winnerIndex,
            isDraw: isFinished && team1Score === team2Score && team1Score > 0,
            isLive
        }
    }

    // Get winner from match winner field (alternative method)
    const getWinnerFromMatch = () => {
        if (match.winner_id && match.opponents) {
            const winnerOpponent = match.opponents.find(
                opponent => opponent.opponent?.id === match.winner_id
            )
            if (winnerOpponent) {
                const winnerIndex = match.opponents.indexOf(winnerOpponent)
                return winnerIndex
            }
        }
        return -1
    }

    // Get video streams from match data
    const getVideoStreams = () => {
        const streams: { url: string; platform: string }[] = []

        // Check for streams_list (primary location)
        if (match.streams_list && Array.isArray(match.streams_list)) {
            streams.push(...match.streams_list.map(stream => ({
                url: stream.raw_url || stream.url || '',
                platform: getPlatformFromUrl(stream.raw_url || stream.url || '')
            })))
        }

        // Check tournament streams
        if (match.tournament?.streams && Array.isArray(match.tournament.streams)) {
            streams.push(...match.tournament.streams.map(stream => ({
                url: stream.raw_url || stream.url || '',
                platform: getPlatformFromUrl(stream.raw_url || stream.url || '')
            })))
        }

        // Remove duplicates and invalid streams
        return streams
            .filter(stream => !!stream.url)
            .filter((stream, index, self) => 
                index === self.findIndex((s) => s.url === stream.url)
            );
    }

    const getPlatformFromUrl = (url: string) => {
        if (!url) return 'External'
        if (url.includes('twitch.tv')) return 'Twitch'
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
        if (url.includes('facebook.com') || url.includes('fb.gg')) return 'Facebook'
        if (url.includes('afreecatv.com')) return 'AfreecaTV'
        if (url.includes('huya.com')) return 'Huya'
        if (url.includes('douyu.com')) return 'Douyu'
        return 'External'
    }

    const handleStreamClick = (streamUrl: string, e: React.MouseEvent) => {
        e.preventDefault()
        window.open(streamUrl, '_blank', 'noopener,noreferrer')
    }

    // Handle click outside to close streams dropdown
    const streamsRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (streamsRef.current && !streamsRef.current.contains(event.target as Node)) {
                setShowStreams(false)
            }
        }

        if (showStreams) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showStreams])

    const videoStreams = getVideoStreams()
    const dateTime = formatDateTime(match.scheduled_at || match.begin_at)
    const tournamentStage = getTournamentStage()
    const gamesFormat = getGamesFormat()
    const leagueInfo = getLeagueInfo()
    const leagueTier = getLeagueTier()
    const region = getRegion()
    const stageColor = getStageColor(tournamentStage)
    const matchResults = getMatchResults()
    const winnerFromMatch = getWinnerFromMatch()

    // Determine final winner (prefer results over winner_id, only for finished matches)
    const finalWinner = matchResults?.isLive ? -1 : (matchResults?.winnerIndex ?? winnerFromMatch)
    const isMatchFinished = match.status === 'finished' || match.status === 'completed'
    const isMatchLive = match.status === 'running'

    return (
        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer animate-slide-up shadow-lg hover:shadow-blue-500/10 relative overflow-hidden">
            {/* Glowing effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Header with status and game */}
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm rounded-full pl-1 pr-3 py-1 border border-gray-700/50">
                        {match.status === 'running' ? (
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse ml-2" />
                        ) : (
                            <div className={`w-2 h-2 rounded-full ml-2 ${getStatusColor(match.status)}`} />
                        )}
                        <span className="text-xs font-medium text-white">{getStatusText(match.status)}</span>
                    </div>
                    <span className="text-gray-400 text-xs sm:text-sm font-medium bg-gray-900/30 px-3 py-1 rounded-full">
                        {match.videogame.name}
                    </span>
                    {gamesFormat && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium border border-blue-500/20">
                            {gamesFormat}
                        </span>
                    )}
                </div>
                {videoStreams.length > 0 && (
                    <div className="relative" ref={streamsRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowStreams(!showStreams)
                            }}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/20 hover:border-purple-500/30 text-xs rounded-full font-medium transition-all duration-200 cursor-pointer group/stream whitespace-nowrap"
                        >
                            <Tv className="w-3 h-3 group-hover/stream:animate-pulse" />
                            <span>{videoStreams.length} Stream{videoStreams.length > 1 ? 's' : ''}</span>
                        </button>

                        {/* Video Streams Dropdown */}
                        {showStreams && (
                            <div className="absolute right-0 top-full mt-2 min-w-[200px] max-w-[300px] w-max bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl z-[9999] max-h-[300px] overflow-y-auto">
                                <div className="sticky top-0 p-3 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-white text-sm font-medium flex items-center whitespace-nowrap">
                                            <Tv className="w-4 h-4 mr-2 text-purple-400" />
                                            Available Streams
                                        </h4>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowStreams(false)
                                            }}
                                            className="text-gray-400 hover:text-gray-300 ml-3"
                                            aria-label="Close streams menu"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-y-auto">
                                    {videoStreams.map((stream, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => handleStreamClick(stream.url, e)}
                                            className="flex items-center w-full px-4 py-3 hover:bg-gray-700/50 transition-colors duration-200 group/item"
                                        >
                                            <div className="flex items-center min-w-0 flex-1">
                                                <div className="flex items-center space-x-2 text-purple-400">
                                                    <Play className="w-4 h-4 flex-shrink-0" />
                                                    {stream.platform === 'Twitch' && (
                                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                                                    )}
                                                </div>
                                                <span className="ml-3 text-gray-300 text-sm font-medium truncate">
                                                    {stream.platform}
                                                </span>
                                                <ExternalLink className="w-4 h-4 text-gray-500 ml-3 flex-shrink-0" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Teams */}
            <div className="flex items-center justify-center mb-6">
                <div className="grid grid-cols-[auto_auto_auto] items-center gap-4 sm:gap-6">
                    {/* Team 1 */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl overflow-hidden border-2 border-gray-600/30 shadow-lg transform hover:scale-105 transition-all duration-300 group-hover:border-blue-500/30">
                                <Image
                                    src={getTeamImage(match.opponents[0] as Opponent)}
                                    alt={getTeamName(match.opponents[0] as Opponent)}
                                    fill
                                    className="object-cover"
                                    priority={false}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/placeholder-team.svg';
                                    }}
                                />
                                {finalWinner === 0 && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-500/90 backdrop-blur-sm rounded-full p-1 shadow-lg">
                                        <Crown className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <span className={`font-bold text-center text-xs sm:text-sm ${finalWinner === 0 ? 'text-yellow-400' : 'text-white'} truncate max-w-[6rem] sm:max-w-24`}>
                                {getTeamName(match.opponents[0] as Opponent)}
                            </span>
                            {(isMatchFinished || isMatchLive) && matchResults && (
                                <span className={`text-lg sm:text-xl font-bold px-3 py-1 rounded-lg ${
                                    isMatchLive
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                        : finalWinner === 0
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                            : 'bg-gray-700/30 text-gray-400 border border-gray-600/20'
                                }`}>
                                    {matchResults.team1Score}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="text-gray-500 font-bold text-base sm:text-lg">VS</span>
                        {isMatchFinished && matchResults?.isDraw && (
                            <div className="flex items-center text-orange-400 text-xs font-medium px-2 py-1 bg-orange-500/20 rounded-full border border-orange-500/20">
                                <span>DRAW</span>
                            </div>
                        )}
                    </div>

                    {/* Team 2 */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl overflow-hidden border-2 border-gray-600/30 shadow-lg transform hover:scale-105 transition-all duration-300 group-hover:border-blue-500/30">
                                <Image
                                    src={getTeamImage(match.opponents[1] as Opponent)}
                                    alt={getTeamName(match.opponents[1] as Opponent)}
                                    fill
                                    className="object-cover"
                                    priority={false}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/placeholder-team.svg';
                                    }}
                                />
                                {finalWinner === 1 && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-500/90 backdrop-blur-sm rounded-full p-1 shadow-lg">
                                        <Crown className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <span className={`font-bold text-center text-xs sm:text-sm ${finalWinner === 1 ? 'text-yellow-400' : 'text-white'} truncate max-w-[6rem] sm:max-w-24`}>
                                {getTeamName(match.opponents[1] as Opponent)}
                            </span>
                            {(isMatchFinished || isMatchLive) && matchResults && (
                                <span className={`text-lg sm:text-xl font-bold px-3 py-1 rounded-lg ${
                                    isMatchLive
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                        : finalWinner === 1
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                            : 'bg-gray-700/30 text-gray-400 border border-gray-600/20'
                                }`}>
                                    {matchResults.team2Score}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Date and Time */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mb-4">
                <div className="flex items-center text-gray-400 text-xs sm:text-sm bg-gray-900/30 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{dateTime.date}</span>
                </div>
                <div className="flex items-center text-gray-400 text-xs sm:text-sm bg-gray-900/30 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{dateTime.time}</span>
                </div>
            </div>

            {/* Region */}
            {region && (
                <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center text-emerald-400 text-xs sm:text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Globe className="w-4 h-4 mr-2" />
                        <span>{region}</span>
                    </div>
                </div>
            )}

            {/* Tournament Stage and League Tier */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                {tournamentStage && (
                    <div className={`flex items-center text-xs sm:text-sm ${stageColor} bg-gray-900/30 px-3 py-1 rounded-full`}>
                        <Trophy className="w-4 h-4 mr-2" />
                        <span className="font-medium">{tournamentStage}</span>
                    </div>
                )}
                {leagueTier && (
                    <div className="flex items-center text-yellow-400 text-xs sm:text-sm bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                        <Star className="w-4 h-4 mr-2" />
                        <span>{leagueTier}</span>
                    </div>
                )}
            </div>

            {/* League Information */}
            <div className="flex items-center justify-center text-xs sm:text-sm">
                <div className="flex items-center text-gray-400 bg-gray-900/30 px-3 py-1 rounded-full max-w-full">
                    <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                    <span className="text-center truncate">{leagueInfo}</span>
                </div>
            </div>
        </div>
    )
}

