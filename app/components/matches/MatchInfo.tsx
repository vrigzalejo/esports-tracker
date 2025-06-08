import { Globe, Trophy, Star, Users } from 'lucide-react'
import { cleanMatchName } from '@/lib/textUtils'

interface MatchInfoProps {
    region: string | null
    tournamentStage: string | null
    stageColor: string
    leagueTier: string | null
    leagueInfo: string
    matchName?: string
    gamesFormat?: string | null
}

export default function MatchInfo({ 
    region, 
    tournamentStage, 
    stageColor, 
    leagueTier, 
    leagueInfo,
    matchName,
    gamesFormat
}: MatchInfoProps) {
    const cleanedLeagueInfo = leagueInfo;
    const cleanedMatchName = cleanMatchName(matchName);
    
    return (
        <div className="space-y-3">
            {/* Region */}
            {region && (
                <div className="flex items-center justify-center">
                    <div className="flex items-center text-emerald-400 text-xs sm:text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Globe className="w-4 h-4 mr-2" size={16} />
                        <span>{region}</span>
                    </div>
                </div>
            )}

            {/* Tournament Stage and League Tier */}
            {(tournamentStage || leagueTier) && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {tournamentStage && (
                        <div className={`flex items-center text-xs sm:text-sm ${stageColor} bg-gray-900/30 px-3 py-1 rounded-full`}>
                            <Trophy className="w-4 h-4 mr-2" size={16} />
                            <span className="font-medium">{tournamentStage}</span>
                        </div>
                    )}
                    {leagueTier && (
                        <div className="flex items-center text-yellow-400 text-xs sm:text-sm bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                            <Star className="w-4 h-4 mr-2" size={16} />
                            <span>{leagueTier}</span>
                        </div>
                    )}
                </div>
            )}

            {/* League Information with Match Name */}
            {(cleanedLeagueInfo || cleanedMatchName) && (
                <div className="flex items-center justify-center text-xs sm:text-sm">
                    <div className="flex items-center text-gray-400 bg-gray-900/30 px-3 py-1 rounded-full max-w-full">
                        <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" size={16} />
                        <span className="text-center break-words">
                            {cleanedLeagueInfo}
                            {cleanedLeagueInfo && cleanedMatchName && ' • '}
                            {cleanedMatchName && (
                                <span className="text-blue-300 font-medium">
                                    {cleanedMatchName}
                                    {gamesFormat && (
                                        <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                                            {gamesFormat}
                                        </span>
                                    )}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
} 
