import { Suspense } from 'react'
import type { Metadata } from 'next'
import TournamentDetailsContent from '@/components/tournaments/TournamentDetailsContent'
import { getTournament } from '@/lib/pandaScore'

interface TournamentPageProps {
    params: Promise<{ tournamentId: string }>
}

export async function generateMetadata({ params }: TournamentPageProps): Promise<Metadata> {
    const { tournamentId } = await params
    
    try {
        const tournament = await getTournament(tournamentId)
        
        return {
            title: `${tournament.name} - Tournament Details | EsportsTracker`,
            description: `Follow ${tournament.name} tournament - view matches, standings, teams, and live updates. ${tournament.prizepool ? `Prize pool: ${tournament.prizepool}` : ''}`,
            keywords: ['tournament', tournament.name, tournament.videogame?.name, 'esports', 'matches', 'standings'].filter(Boolean),
            openGraph: {
                title: `${tournament.name} - Tournament Details`,
                description: `Follow ${tournament.name} tournament - view matches, standings, teams, and live updates.`,
                type: 'website',
                images: tournament.league?.image_url ? [{ url: tournament.league.image_url, alt: tournament.name }] : undefined,
            }
        }
    } catch (error) {
        console.error('Error generating tournament metadata:', error)
        // Fallback metadata if tournament fetch fails
        return {
            title: 'Tournament Details - EsportsTracker',
            description: 'View tournament details, matches, standings, and live updates on EsportsTracker.',
            keywords: ['tournament', 'esports', 'matches', 'standings'],
        }
    }
}

export default async function TournamentPage({ params }: TournamentPageProps) {
    const { tournamentId } = await params

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TournamentDetailsContent tournamentId={tournamentId} />
        </Suspense>
    )
} 
