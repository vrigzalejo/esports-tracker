import TeamDisplay from './TeamDisplay'

interface Opponent {
    opponent: {
        name: string
        image_url: string
    }
}

interface MatchResults {
    team1Score: number
    team2Score: number
    winnerIndex: number
    isDraw: boolean
    isLive: boolean
}

interface TeamsSectionProps {
    opponents: Opponent[]
    matchResults: MatchResults | null
    finalWinner: number
    isMatchFinished: boolean
    isMatchLive: boolean
}

export default function TeamsSection({ 
    opponents, 
    matchResults, 
    finalWinner, 
    isMatchFinished, 
    isMatchLive 
}: TeamsSectionProps) {
    const showScore = (isMatchFinished || isMatchLive) && matchResults

    return (
        <div className="flex items-center justify-center mb-6">
            <div className="grid grid-cols-3 items-center gap-4 sm:gap-6 w-full max-w-md">
                {/* Team 1 */}
                <div className="flex justify-center">
                    <TeamDisplay
                        opponent={opponents[0]}
                        score={matchResults?.team1Score}
                        isWinner={finalWinner === 0}
                        isLive={isMatchLive}
                        showScore={!!showScore}
                    />
                </div>

                {/* VS - Always centered */}
                <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-gray-500 font-bold text-base sm:text-lg">VS</span>
                    {isMatchFinished && matchResults?.isDraw && (
                        <div className="flex items-center text-orange-400 text-xs font-medium px-2 py-1 bg-orange-500/20 rounded-full border border-orange-500/20">
                            <span>DRAW</span>
                        </div>
                    )}
                </div>

                {/* Team 2 */}
                <div className="flex justify-center">
                    <TeamDisplay
                        opponent={opponents[1]}
                        score={matchResults?.team2Score}
                        isWinner={finalWinner === 1}
                        isLive={isMatchLive}
                        showScore={!!showScore}
                    />
                </div>
            </div>
        </div>
    )
} 