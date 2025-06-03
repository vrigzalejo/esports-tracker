import { Globe, Trophy, Star, Users } from 'lucide-react'

interface MatchInfoProps {
    region: string | null
    tournamentStage: string | null
    stageColor: string
    leagueTier: string | null
    leagueInfo: string
}

export default function MatchInfo({ 
    region, 
    tournamentStage, 
    stageColor, 
    leagueTier, 
    leagueInfo 
}: MatchInfoProps) {
    return (
        <>
            {/* Region */}
            {region && (
                <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center text-emerald-400 text-xs sm:text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Globe className="w-4 h-4 mr-2" size={16} />
                        <span>{region}</span>
                    </div>
                </div>
            )}

            {/* Tournament Stage and League Tier */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
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

            {/* League Information */}
            <div className="flex items-center justify-center text-xs sm:text-sm">
                <div className="flex items-center text-gray-400 bg-gray-900/30 px-3 py-1 rounded-full max-w-full">
                    <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" size={16} />
                    <span className="text-center">{leagueInfo}</span>
                </div>
            </div>
        </>
    )
} 