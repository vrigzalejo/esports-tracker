import type { Match } from '@/types/esports';
import TeamRoster from './TeamRoster';

interface MatchDetailsProps {
    match: Match;
    onClose: () => void;
}

export default function MatchDetails({ match, onClose }: MatchDetailsProps) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 relative">
                {/* Header */}
                <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-white">Match Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                        aria-label="Close details"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="p-6 space-y-8">
                        {/* Team Rosters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {match.opponents.map((opponent, index) => (
                                <TeamRoster
                                    key={opponent.opponent?.id || index}
                                    teamId={opponent.opponent?.id}
                                    teamName={opponent.opponent?.name || 'TBD'}
                                    tournamentId={match.tournament?.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
