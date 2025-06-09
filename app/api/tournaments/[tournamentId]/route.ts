import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tournamentId: string }> }
) {
    try {
        const { tournamentId } = await params
        
        if (!tournamentId) {
            return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 })
        }

        if (!process.env.PANDASCORE_TOKEN) {
            return NextResponse.json({ error: 'PandaScore API token not configured' }, { status: 500 })
        }

        const apiUrl = `https://api.pandascore.co/tournaments/${tournamentId}?token=${process.env.PANDASCORE_TOKEN}`
        
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
            const errorText = await response.text()
            
            if (response.status === 404) {
                return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
            }
            throw new Error(`API responded with status: ${response.status}, body: ${errorText}`)
        }

        const tournament = await response.json()

        // Transform the data to match our interface
        const transformedTournament = {
            id: tournament.id || 0,
            name: tournament.name || 'Unknown Tournament',
            begin_at: tournament.begin_at || new Date().toISOString(),
            end_at: tournament.end_at || new Date().toISOString(),
            prizepool: tournament.prizepool || null,
            tier: tournament.tier || null,
            status: tournament.status || 'unknown',
            league: tournament.league ? {
                id: tournament.league.id || 0,
                name: tournament.league.name || 'Unknown League',
                image_url: tournament.league.image_url || '',
                region: tournament.league.region || null
            } : {
                id: 0,
                name: 'Unknown League',
                image_url: '',
                region: null
            },
            serie: tournament.serie ? {
                id: tournament.serie.id || 0,
                name: tournament.serie.name || 'Unknown Serie',
                full_name: tournament.serie.full_name || tournament.serie.name || 'Unknown Serie',
                slug: tournament.serie.slug || '',
                year: tournament.serie.year || null
            } : null,
            videogame: tournament.videogame ? {
                name: tournament.videogame.name || 'Unknown Game',
                slug: tournament.videogame.slug || ''
            } : {
                name: 'Unknown Game',
                slug: ''
            },
            region: tournament.region || null,
            country: tournament.country || null,
            teams: tournament.teams || [],
            expected_roster: tournament.expected_roster || []
        }

        return NextResponse.json(transformedTournament)
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch tournament data' },
            { status: 500 }
        )
    }
} 