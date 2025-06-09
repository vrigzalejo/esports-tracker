import { Suspense } from 'react'
import TournamentDetailsContent from '@/components/tournaments/TournamentDetailsContent'

interface TournamentPageProps {
    params: Promise<{ tournamentId: string }>
}

export default async function TournamentPage({ params }: TournamentPageProps) {
    const { tournamentId } = await params

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TournamentDetailsContent tournamentId={tournamentId} />
        </Suspense>
    )
} 
