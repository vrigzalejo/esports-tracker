import { Globe, Trophy, Star, Users } from 'lucide-react'
import { cleanMatchName } from '@/lib/textUtils'
import { useRouter } from 'next/navigation'
import type { Match } from '@/types/esports'

interface MatchInfoProps {
    region: string | null
    tournamentStage: string | null
    stageColor: string
    leagueTier: string | null
    leagueInfo: string
    matchName?: string
    gamesFormat?: string | null
    match: Match
}

export default function MatchInfo({ 
    region, 
    tournamentStage, 
    stageColor, 
    leagueTier, 
    leagueInfo,
    matchName,
    gamesFormat,
    match
}: MatchInfoProps) {
    const router = useRouter();
    const cleanedLeagueInfo = leagueInfo;
    const cleanedMatchName = cleanMatchName(matchName);
    
    const handleTournamentClick = () => {
        if (match.tournament?.id) {
            router.push(`/tournaments/${match.tournament.id}`);
        }
    };
    
    return (
        <div className="space-y-2">
            {/* Region */}
            {region && (
                <div className="flex items-center justify-center">
                    <div className="flex items-center text-emerald-400 text-xs bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <Globe className="w-3 h-3 mr-2" />
                        <span>{region}</span>
                    </div>
                </div>
            )}

            {/* Tournament Stage and League Tier */}
            {(tournamentStage || leagueTier) && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {tournamentStage && (
                        <div className={`flex items-center text-xs ${stageColor} bg-gray-800/40 px-3 py-1.5 rounded-lg border border-gray-700/30`}>
                            <Trophy className="w-3 h-3 mr-2" />
                            <span className="font-medium">{tournamentStage}</span>
                        </div>
                    )}
                    {leagueTier && (
                        <div className="flex items-center text-yellow-400 text-xs bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                            <Star className="w-3 h-3 mr-2" />
                            <span>{leagueTier}</span>
                        </div>
                    )}
                </div>
            )}

            {/* League Information with Match Name */}
            {(cleanedLeagueInfo || cleanedMatchName) && (
                <div className="flex items-center justify-center text-xs">
                    <div 
                        className="group flex items-center text-gray-300 bg-gray-800/60 hover:bg-gray-800/70 px-3 py-1.5 rounded-xl border border-gray-700/40 hover:border-gray-600/50 max-w-full cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-gray-500/5"
                        onClick={handleTournamentClick}
                    >
                        <Users className="w-3 h-3 mr-2 flex-shrink-0 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                        <span className="text-center break-words font-light group-hover:text-white transition-colors duration-300">
                            <span className="text-gray-200 font-normal text-xs">
                                {cleanedLeagueInfo}
                            </span>
                            {cleanedLeagueInfo && cleanedMatchName && <span className="text-gray-500 mx-2">•</span>}
                            {cleanedMatchName && (
                                <span className="text-blue-300 group-hover:text-blue-200 font-normal text-xs">
                                    {cleanedMatchName}
                                    {gamesFormat && (
                                        <span className="ml-2 px-2 py-0.5 bg-purple-500/25 hover:bg-purple-500/30 text-purple-200 rounded-lg text-xs font-normal border border-purple-500/30 transition-all duration-300">
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
