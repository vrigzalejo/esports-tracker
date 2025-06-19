import { Suspense } from 'react'
import type { Metadata } from 'next'
import TeamDetailsContent from '../../components/teams/TeamDetailsContent'

interface TeamDetailsPageProps {
    params: Promise<{
        teamId: string
    }>
}

export async function generateMetadata({ params }: TeamDetailsPageProps): Promise<Metadata> {
    const { teamId } = await params
    
    try {
        // Fetch team data from our API route
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/teams/${teamId}`)
        if (!response.ok) throw new Error('Failed to fetch team')
        
        const team = await response.json()
        
        return {
            title: `${team.name} - Team Profile | EsportsTracker`,
            description: `Follow ${team.name} esports team - view roster, matches, tournaments, and performance statistics. ${team.current_videogame?.name ? `Currently competing in ${team.current_videogame.name}` : ''}`,
            keywords: ['team', team.name, team.current_videogame?.name, 'esports', 'roster', 'matches', 'tournaments'].filter(Boolean),
            openGraph: {
                title: `${team.name} - Team Profile`,
                description: `Follow ${team.name} esports team - view roster, matches, tournaments, and performance statistics.`,
                type: 'website',
                images: team.image_url ? [{ url: team.image_url, alt: team.name }] : undefined,
            }
        }
    } catch (error) {
        console.error('Error generating team metadata:', error)
        // Fallback metadata if team fetch fails
        return {
            title: 'Team Profile - EsportsTracker',
            description: 'View team profile, roster, matches, and tournament history on EsportsTracker.',
            keywords: ['team', 'esports', 'roster', 'matches', 'tournaments'],
        }
    }
}

// Loading component for the suspense boundary
function TeamDetailsLoading() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    {/* Header */}
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="w-24 h-24 bg-gray-700 rounded-xl" />
                        <div className="flex-1">
                            <div className="h-8 w-64 bg-gray-700 rounded mb-2" />
                            <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
                            <div className="h-4 w-48 bg-gray-700 rounded" />
                        </div>
                    </div>

                    {/* Content sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gray-800 rounded-xl p-6">
                                <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-16 bg-gray-700 rounded" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-gray-800 rounded-xl p-6">
                                <div className="h-6 w-24 bg-gray-700 rounded mb-4" />
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-700 rounded" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
    const { teamId } = await params
    
    return (
        <Suspense fallback={<TeamDetailsLoading />}>
            <TeamDetailsContent teamId={teamId} />
        </Suspense>
    )
} 
