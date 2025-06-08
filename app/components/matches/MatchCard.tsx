import { useState, useEffect } from 'react'
import type { Match } from '@/types/esports'
import MatchDetails from './MatchDetails'
import MatchHeader from './MatchHeader'
import TeamsSection from './TeamsSection'
import MatchDateTime from './MatchDateTime'
import MatchInfo from './MatchInfo'
import { useMatchData } from './useMatchData'

interface MatchCardProps {
    match: Match
}

interface Opponent {
    opponent: {
        id: number
        name: string
        image_url: string
    }
}

export default function MatchCard({ match }: MatchCardProps) {
    const [showDetails, setShowDetails] = useState(false)

    const {
        countdown,
        isLive,
        isPast,
        videoStreams,
        dateTime,
        endDateTime,
        tournamentStage,
        gamesFormat,
        leagueInfo,
        leagueTier,
        region,
        stageColor,
        matchResults,
        finalWinner,
        isMatchFinished,
        isMatchLive
    } = useMatchData(match)

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showDetails) {
                setShowDetails(false)
            }
        }

        if (showDetails) {
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [showDetails])

    return (
        <>
            <div className="group bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 animate-slide-up shadow-lg hover:shadow-blue-500/10 relative overflow-hidden">
                {/* Glowing effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content Container with consistent spacing */}
                <div className="relative z-10 space-y-5">
                    {/* Header with status, game, and buttons */}
                    <MatchHeader
                        match={match}
                        videoStreams={videoStreams}
                        onShowDetails={() => setShowDetails(true)}
                    />

                    {/* Teams Section */}
                    <TeamsSection
                        opponents={match.opponents as Opponent[]}
                        matchResults={matchResults}
                        finalWinner={finalWinner}
                        isMatchFinished={isMatchFinished}
                        isMatchLive={isMatchLive}
                    />

                    {/* Date and Time */}
                    <MatchDateTime
                        dateTime={dateTime}
                        endDateTime={endDateTime}
                        countdown={countdown}
                        isLive={isLive}
                        isPast={isPast}
                        isMatchFinished={isMatchFinished}
                    />

                    {/* Match Information */}
                    <MatchInfo
                        region={region}
                        tournamentStage={tournamentStage}
                        stageColor={stageColor}
                        leagueTier={leagueTier}
                        leagueInfo={leagueInfo}
                        matchName={match.name}
                        gamesFormat={gamesFormat}
                    />
                </div>
            </div>

            {/* Match Details Modal */}
            {showDetails && (
                <MatchDetails
                    match={match}
                    onClose={() => setShowDetails(false)}
                />
            )}
        </>
    )
}
