import type { Match } from '@/types/esports';
import TeamRoster from './TeamRoster';
import TeamMatches from './TeamMatches';
import TournamentStandings from '../tournaments/TournamentStandings';
import TournamentMatches from '../tournaments/TournamentMatches';
import { formatMatchDateRange, parseLeagueInfo } from '@/lib/textUtils';

interface MatchDetailsProps {
    match: Match;
    onClose: () => void;
}

export default function MatchDetails({ match, onClose }: MatchDetailsProps) {
    // Format the score display
    const getScoreCard = () => {
        if (match.status === 'not_started' || !match.results || match.results.length === 0) {
            return null;
        }

        // Helper function to create acronym from team name
        const createAcronym = (name: string) => {
            if (!name || name === 'TBD') return 'TBD';
            
            // Split by spaces and take first letter of each word, max 3 characters
            const words = name.split(' ').filter(word => word.length > 0);
            if (words.length === 1) {
                // If single word, take first 3 characters
                return words[0].slice(0, 3).toUpperCase();
            }
            // Multiple words, take first letter of each word, max 3
            return words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
        };

        // Get team names and scores
        const scoreInfo = match.opponents.map((opponent, index) => ({
            name: opponent.opponent?.name || 'TBD',
            acronym: createAcronym(opponent.opponent?.name || 'TBD'),
            image: opponent.opponent?.image_url,
            score: match.results[index]?.score ?? 0,
            isWinner: match.winner_id === opponent.opponent?.id
        }));

        // Ensure we have at least 2 teams
        if (scoreInfo.length < 2) {
            return null;
        }

        return (
            <div className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-xl p-6 border border-gray-600 shadow-lg">
                <div className="grid grid-cols-3 items-center gap-4">
                    {/* Team 1 */}
                    <div className={`flex items-center justify-end space-x-4 ${scoreInfo[0]?.isWinner ? 'text-green-400' : 'text-white'}`}>
                        {scoreInfo[0]?.image && (
                            <div className="relative w-12 h-12 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-600/40 shadow-xl overflow-hidden backdrop-blur-sm">
                                <img 
                                    src={scoreInfo[0].image} 
                                    alt={scoreInfo[0].name}
                                    className="w-full h-full object-contain p-1"
                                />
                            </div>
                        )}
                        <div className="text-right">
                            <div className="text-lg font-bold">{scoreInfo[0]?.name}</div>
                            <div className="text-sm text-gray-400">{scoreInfo[0]?.acronym}</div>
                        </div>
                        <div className={`text-4xl font-black ${scoreInfo[0]?.isWinner ? 'text-green-400' : 'text-white'}`}>
                            {scoreInfo[0]?.score}
                        </div>
                    </div>

                    {/* VS Separator - Always Centered */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="text-gray-400 text-sm font-medium">
                            {match.status === 'finished' ? 'FINAL' : match.status.toUpperCase()}
                        </div>
                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">VS</span>
                        </div>
                        <div className="text-gray-400 text-xs">
                            BO{match.number_of_games}
                        </div>
                    </div>

                    {/* Team 2 */}
                    <div className={`flex items-center justify-start space-x-4 ${scoreInfo[1]?.isWinner ? 'text-green-400' : 'text-white'}`}>
                        <div className={`text-4xl font-black ${scoreInfo[1]?.isWinner ? 'text-green-400' : 'text-white'}`}>
                            {scoreInfo[1]?.score}
                        </div>
                        <div className="text-left">
                            <div className="text-lg font-bold">{scoreInfo[1]?.name}</div>
                            <div className="text-sm text-gray-400">{scoreInfo[1]?.acronym}</div>
                        </div>
                        {scoreInfo[1]?.image && (
                            <div className="relative w-12 h-12 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-600/40 shadow-xl overflow-hidden backdrop-blur-sm">
                                <img 
                                    src={scoreInfo[1].image} 
                                    alt={scoreInfo[1].name}
                                    className="w-full h-full object-contain p-1"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Winner indicator */}
                {match.status === 'finished' && match.winner_id && (
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">
                                {scoreInfo.find(team => team.isWinner)?.name} Wins
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700 relative">
                {/* Header */}
                <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 z-10">
                    <div className="flex items-center justify-between mb-3">
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
                    
                    {/* Match Information */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="text-blue-400 font-medium">{match.league?.name || ''}</span>
                            {match.league?.name && match.serie?.full_name && (
                                <span className="text-gray-500">•</span>
                            )}
                            <span className="text-green-400 font-medium">{parseLeagueInfo(match.serie?.full_name || '')}</span>
                        </div>
                        <div className="text-sm text-yellow-400 font-medium">
                            {parseLeagueInfo(match.tournament?.name || '')}
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400">
                                {match.name}
                                • {match.videogame?.name}
                                {match.number_of_games && (
                                    <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                                        BO{match.number_of_games}
                                    </span>
                                )}
                            </div>
                            
                            <div className="text-xs text-gray-300">
                                {formatMatchDateRange(match, { includeWeekday: true, includeYear: true })}
                            </div>
                            
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="p-6 space-y-8">
                        {/* Match Score Card */}
                        {getScoreCard()}

                        {/* Team Rosters */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {match.opponents.map((opponent, index) => (
                                <TeamRoster
                                    key={opponent.opponent?.id || index}
                                    teamId={opponent.opponent?.id}
                                    teamName={opponent.opponent?.name || 'TBD'}
                                    tournamentId={match.tournament?.id}
                                />
                            ))}
                        </div>

                        {/* Team Recent Matches */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {match.opponents.map((opponent) => (
                                opponent.opponent?.id ? (
                                    <TeamMatches
                                        key={`matches-${opponent.opponent.id}`}
                                        teamId={opponent.opponent.id}
                                        teamName={opponent.opponent.name || 'TBD'}
                                        currentMatch={match}
                                    />
                                ) : null
                            ))}
                        </div>

                        {/* Tournament Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {match.tournament?.id && (
                                <>
                                    <TournamentStandings
                                        tournamentId={match.tournament.id}
                                        tournamentName={match.tournament.name || 'Tournament'}
                                        teamIds={match.opponents.map(opp => opp.opponent?.id).filter(Boolean) as number[]}
                                    />
                                    <TournamentMatches
                                        tournamentId={match.tournament.id}
                                        tournamentName={match.tournament.name || 'Tournament'}
                                        teamIds={match.opponents.map(opp => opp.opponent?.id).filter(Boolean) as number[]}
                                        teamNames={match.opponents.map(opp => opp.opponent?.name).filter(Boolean) as string[]}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
