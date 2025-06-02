import Image from 'next/image'
import { Star } from 'lucide-react'
import type { Team } from '@/types/esports'

interface TeamCardProps {
    team: Team
}

export default function TeamCard({ team }: TeamCardProps) {
    const getTeamImage = () => {
        const imageUrl = team.image_url;
        return imageUrl && imageUrl !== '' ? imageUrl : '/images/placeholder-team.svg';
    }

    const calculateRating = () => {
        // If we have a pre-calculated rating from the API, use it
        if (team.rating) return team.rating;

        // Calculate rating based on available performance metrics
        let rating = 5.0; // Base rating

        if (team.win_rate) {
            // Add up to 3 points based on win rate (0-100%)
            rating += (team.win_rate / 100) * 3;
        }

        if (team.matches_played) {
            // Add up to 1 point based on activity (more matches = more reliable rating)
            // Consider 50 matches as maximum for this bonus
            rating += Math.min(team.matches_played / 50, 1);
        }

        if (team.current_streak && team.current_streak > 0) {
            // Add up to 1 point based on current winning streak
            // Consider 10 matches as maximum streak bonus
            rating += Math.min(team.current_streak / 10, 1);
        }

        // Ensure rating stays within 0-10 range
        return Math.min(Math.max(rating, 0), 10);
    }

    const formatRating = (rating: number): string => {
        return rating.toFixed(1);
    }

    const getRatingColor = (rating: number): string => {
        if (rating >= 8.5) return 'text-yellow-400';
        if (rating >= 7.0) return 'text-green-400';
        if (rating >= 5.0) return 'text-blue-400';
        return 'text-gray-400';
    }

    const rating = calculateRating();
    const ratingColor = getRatingColor(rating);

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-200 cursor-pointer animate-slide-up">
            <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg">
                    <Image
                        src={getTeamImage()}
                        alt={team.name}
                        fill
                        className="rounded-lg object-cover"
                        priority={false}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder-team.svg';
                        }}
                    />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                    <p className="text-gray-400">{team.acronym}</p>
                    <p className="text-gray-500 text-sm">{team.location}</p>
                </div>
                <div className="text-right">
                    <div className={`flex items-center ${ratingColor} mb-1`}>
                        <Star className="w-4 h-4 mr-1" />
                        <span className="text-sm">{formatRating(rating)}</span>
                    </div>
                    <p className="text-gray-400 text-xs">Rating</p>
                    {team.win_rate && (
                        <p className="text-xs text-gray-500 mt-1">
                            {team.win_rate}% WR
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
