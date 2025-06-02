import Image from 'next/image'
import { Calendar, Clock, Trophy, Users, Star, Globe, Crown, Play, ExternalLink, Tv } from 'lucide-react'
import type { Match } from '@/types/esports'
import { getStatusColor, getStatusText } from '@/lib/utils'
import { useState } from 'react'

interface MatchCardProps {
    match: Match
}

export default function MatchCard({ match }: MatchCardProps) {
    const [showStreams, setShowStreams] = useState(false)

    const getTeamImage = (opponent: any) => {
        return opponent?.opponent?.image_url || '/images/placeholder-team.svg'
    }

    const getTeamName = (opponent: any) => {
        return opponent?.opponent?.name || 'TBD'
    }

    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Format date and time with timezone
    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'TBD'

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
        const streams = []

        // Check for streams_list (primary location)
        if (match.streams_list && Array.isArray(match.streams_list)) {
            streams.push(...match.streams_list)
        }

        // Check for streams in various possible locations in the match object
        if (match.streams) {
            streams.push(...match.streams)
        }

        if (match.live_streams) {
            streams.push(...match.live_streams)
        }

        if (match.videos) {
            streams.push(...match.videos)
        }

        // Check tournament/league streams
        if (match.tournament?.streams) {
            streams.push(...match.tournament.streams)
        }

        if (match.league?.streams) {
            streams.push(...match.league.streams)
        }

        // Filter and format streams
        return streams.filter((stream: any) => stream && (stream.raw_url || stream.embed_url || stream.url))
            .map((stream: any, index: number) => ({
                id: stream.id || `stream-${index}`,
                name: stream.name || stream.language || `Stream ${index + 1}`,
                url: stream.raw_url || stream.embed_url || stream.url,
                language: stream.language || 'en',
                official: stream.official || false,
                live: stream.live !== undefined ? stream.live : match.status === 'running'
            }))
    }

    // Get stream platform from URL
    const getStreamPlatform = (url: string) => {
        if (url.includes('twitch.tv')) return 'Twitch'
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
        if (url.includes('facebook.com')) return 'Facebook'
        if (url.includes('twitter.com') || url.includes('x.com')) return 'X/Twitter'
        return 'External'
    }

    // Handle stream click
    const handleStreamClick = (streamUrl: string, e: React.MouseEvent) => {
        e.stopPropagation()
        window.open(streamUrl, '_blank', 'noopener,noreferrer')
    }

    const dateTime = formatDateTime(match.scheduled_at || match.begin_at)
    const tournamentStage = getTournamentStage()
    const gamesFormat = getGamesFormat()
    const leagueInfo = getLeagueInfo()
    const leagueTier = getLeagueTier()
    const region = getRegion()
    const stageColor = getStageColor(tournamentStage)
    const matchResults = getMatchResults()
    const winnerFromMatch = getWinnerFromMatch()
    const videoStreams = getVideoStreams()

    // Determine final winner (prefer results over winner_id, only for finished matches)
    const finalWinner = matchResults?.isLive ? -1 : (matchResults?.winnerIndex ?? winnerFromMatch)
    const isMatchFinished = match.status === 'finished' || match.status === 'completed'
    const isMatchLive = match.status === 'running'

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-200 cursor-pointer animate-slide-up shadow-lg">
            {/* Header with status and game */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(match.status)}`}>
                        {getStatusText(match.status)}
                    </span>
                    <span className="text-gray-400 text-sm font-medium">{match.videogame.name}</span>
                    {gamesFormat && (
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                            {gamesFormat}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-3">
                    {videoStreams.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowStreams(!showStreams)
                            }}
                            className="flex items-center space-x-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full font-medium transition-colors duration-200"
                        >
                            <Tv className="w-3 h-3" />
                            <span>{videoStreams.length} Stream{videoStreams.length > 1 ? 's' : ''}</span>
                        </button>
                    )}
                    {match.status === 'running' && (
                        <div className="flex items-center text-red-400">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2" />
                            <span className="text-sm font-bold">LIVE</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Streams Section */}
            {showStreams && videoStreams.length > 0 && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                        <Tv className="w-4 h-4 mr-2" />
                        Available Streams
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {videoStreams.map((stream: any) => (
                            <button
                                key={stream.id}
                                onClick={(e) => handleStreamClick(stream.url, e)}
                                className="flex items-center justify-between p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors duration-200 group"
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <Play className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                                        {stream.live && (
                                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-white text-sm font-medium truncate">
                                            {stream.name}
                                        </div>
                                        <div className="text-gray-400 text-xs">
                                            {getStreamPlatform(stream.url)}
                                            {stream.language && stream.language !== 'en' && (
                                                <span className="ml-1">• {stream.language.toUpperCase()}</span>
                                            )}
                                            {stream.official && (
                                                <span className="ml-1 text-yellow-400">• Official</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Teams */}
            <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-6">
                    {/* Team 1 */}
                    <div className="flex flex-col items-center space-y-3 min-w-0">
                        <div className="relative">
                            <div className="relative w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl overflow-hidden border-2 border-gray-600 shadow-lg transform hover:scale-105 transition-transform duration-200">
                                <Image
                                    src={getTeamImage(match.opponents[0])}
                                    alt={getTeamName(match.opponents[0])}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/placeholder-team.svg';
                                    }}
                                />
                                {finalWinner === 0 && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                                        <Crown className="w-3 h-3 text-gray-900" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <span className={`font-bold text-center text-sm ${finalWinner === 0 ? 'text-yellow-400' : 'text-white'} truncate max-w-24`}>
                                {getTeamName(match.opponents[0])}
                            </span>
                            {(isMatchFinished || isMatchLive) && matchResults && (
                                <span className={`text-xl font-bold px-3 py-1 rounded-lg ${isMatchLive
                                    ? 'bg-blue-600 text-white'
                                    : finalWinner === 0
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-600 text-gray-300'
                                    }`}>
                                    {matchResults.team1Score}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center space-y-2">
                        <span className="text-gray-400 font-bold text-lg">VS</span>
                        {isMatchFinished && matchResults?.isDraw && (
                            <div className="flex items-center text-orange-400 text-xs font-medium">
                                <span>DRAW</span>
                            </div>
                        )}
                    </div>

                    {/* Team 2 */}
                    <div className="flex flex-col items-center space-y-3 min-w-0">
                        <div className="relative">
                            <div className="relative w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl overflow-hidden border-2 border-gray-600 shadow-lg transform hover:scale-105 transition-transform duration-200">
                                <Image
                                    src={getTeamImage(match.opponents[1])}
                                    alt={getTeamName(match.opponents[1])}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/placeholder-team.svg';
                                    }}
                                />
                                {finalWinner === 1 && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                                        <Crown className="w-3 h-3 text-gray-900" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <span className={`font-bold text-center text-sm ${finalWinner === 1 ? 'text-yellow-400' : 'text-white'} truncate max-w-24`}>
                                {getTeamName(match.opponents[1])}
                            </span>
                            {(isMatchFinished || isMatchLive) && matchResults && (
                                <span className={`text-xl font-bold px-3 py-1 rounded-lg ${isMatchLive
                                    ? 'bg-blue-600 text-white'
                                    : finalWinner === 1
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-600 text-gray-300'
                                    }`}>
                                    {matchResults.team2Score}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-center justify-center space-x-6 mb-4">
                <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{dateTime.date}</span>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{dateTime.time}</span>
                </div>
            </div>

            {/* Region */}
            {region && (
                <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center text-emerald-400 text-sm">
                        <Globe className="w-4 h-4 mr-2" />
                        <span>{region}</span>
                    </div>
                </div>
            )}

            {/* Tournament Stage and League Tier */}
            <div className="flex items-center justify-between mb-4">
                {tournamentStage && (
                    <div className={`flex items-center text-sm ${stageColor}`}>
                        <Trophy className="w-4 h-4 mr-2" />
                        <span className="font-medium">{tournamentStage}</span>
                    </div>
                )}
                {leagueTier && (
                    <div className="flex items-center text-yellow-400 text-sm">
                        <Star className="w-4 h-4 mr-2" />
                        <span>{leagueTier}</span>
                    </div>
                )}
            </div>

            {/* League Information */}
            <div className="flex items-center justify-center text-sm">
                <div className="flex items-center text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-center">{leagueInfo}</span>
                </div>
            </div>
        </div>
    )
}
