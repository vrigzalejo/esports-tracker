import { useState, useEffect } from 'react'
import type { Match } from '@/types/esports'
import MatchDetails from './MatchDetails'
import MatchHeader from './MatchHeader'
import TeamsSection from './TeamsSection'
import MatchDateTime from './MatchDateTime'
import MatchInfo from './MatchInfo'
import { useMatchData } from './useMatchData'
import OddsAssistant from './OddsAssistant'

interface MatchCardProps {
    match: Match
}

interface Opponent {
    type?: 'Player' | 'Team'
    opponent: {
        id: number
        name: string
        image_url: string
    }
}

export default function MatchCard({ match }: MatchCardProps) {
    const [showDetails, setShowDetails] = useState(false)
    const [showOddsAssistant, setShowOddsAssistant] = useState(false)

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

    // Determine if streams should be enabled based on match status and timing
    const getStreamsAvailability = () => {
        // Always enable streams for LIVE and FINISHED matches
        if (match.status === 'running' || match.status === 'finished' || match.status === 'completed') {
            return {
                streams: videoStreams,
                enabled: true,
                reason: null
            };
        }

        // For UPCOMING matches, only enable streams 1 hour before scheduled_at
        if (match.status === 'not_started') {
            const now = new Date();
            const scheduledTime = new Date(match.scheduled_at || match.begin_at);
            const oneHourBefore = new Date(scheduledTime.getTime() - 60 * 60 * 1000); // 1 hour before

            // Enable streams if current time is within 1 hour of the scheduled time
            if (now >= oneHourBefore) {
                return {
                    streams: videoStreams,
                    enabled: true,
                    reason: null
                };
            } else {
                // Calculate time remaining until streams become available
                const timeUntilAvailable = oneHourBefore.getTime() - now.getTime();
                const hoursRemaining = Math.ceil(timeUntilAvailable / (1000 * 60 * 60));
                
                return {
                    streams: videoStreams,
                    enabled: false,
                    reason: `Streams available ${hoursRemaining}h before match`
                };
            }
        }

        // Default case
        return {
            streams: videoStreams,
            enabled: true,
            reason: null
        };
    };

    const streamsAvailability = getStreamsAvailability();

    // Check if both teams are TBD
    const areBothTeamsTBD = !match.opponents?.[0]?.opponent?.name && !match.opponents?.[1]?.opponent?.name;

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
            <div className="group bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 animate-slide-up shadow-lg hover:shadow-blue-500/10 relative overflow-hidden">
                {/* Glowing effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content Container with consistent spacing */}
                <div className="relative z-10 space-y-4">
                    {/* Header with status, game, and buttons */}
                    <MatchHeader
                        match={match}
                        videoStreams={streamsAvailability.streams}
                        streamsEnabled={streamsAvailability.enabled}
                        streamsDisabledReason={streamsAvailability.reason}
                        onShowDetails={() => setShowDetails(true)}
                        detailsDisabled={areBothTeamsTBD}
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

                    {/* AI Predictions Button */}
                    {!areBothTeamsTBD && (match.status === 'running' || match.status === 'not_started') && (
                        <div className="flex items-center justify-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowOddsAssistant(true)
                                }}
                                className="group/ai flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-400/40 hover:shadow-sm cursor-pointer"
                                title="AI Match Analysis & Predictions"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span>AI Predictions</span>
                            </button>
                        </div>
                    )}

                    {/* Match Information */}
                    <MatchInfo
                        region={region}
                        tournamentStage={tournamentStage}
                        stageColor={stageColor}
                        leagueTier={leagueTier}
                        leagueInfo={leagueInfo}
                        matchName={match.name}
                        gamesFormat={gamesFormat}
                        match={match}
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

            {/* AI Odds Assistant Modal */}
            {showOddsAssistant && (
                <OddsAssistant
                    match={match}
                    isOpen={showOddsAssistant}
                    onClose={() => setShowOddsAssistant(false)}
                />
            )}
        </>
    )
}
