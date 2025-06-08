import { NextRequest, NextResponse } from 'next/server'
import { getTournaments } from '@/lib/pandaScore'

const PANDASCORE_TOKEN = process.env.PANDASCORE_TOKEN

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    if (!PANDASCORE_TOKEN) {
        return NextResponse.json(
            { error: 'API token not configured' },
            { status: 500 }
        )
    }

    try {
        const { teamId } = await params
        const teamIdNum = parseInt(teamId)
        console.log('Fetching team details for ID:', teamIdNum)

        // First try the direct PandaScore teams endpoint
        try {
            const apiUrl = `https://api.pandascore.co/teams/${teamIdNum}?token=${PANDASCORE_TOKEN}`
            console.log('Trying direct API URL:', apiUrl)
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 300 }
            })

            console.log('Direct API response status:', response.status)

            if (response.ok) {
                const team = await response.json()
                console.log('Team data fetched successfully from direct API:', team.name || 'Unknown team')
                return NextResponse.json(team)
            }
        } catch (directApiError) {
            console.log('Direct API failed, trying tournaments approach:', directApiError)
        }

        // Fallback: Get team data from tournaments
        console.log('Fetching team from tournaments data...')
        const tournamentsResponse = await getTournaments({})
        const tournaments = tournamentsResponse && typeof tournamentsResponse === 'object' && 'data' in tournamentsResponse 
            ? tournamentsResponse.data 
            : tournamentsResponse

        // Look for the team in tournament rosters
        let foundTeam = null
        
        for (const tournament of tournaments) {
            if (tournament.expected_roster && Array.isArray(tournament.expected_roster)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const roster = tournament.expected_roster.find((r: any) => r.team && r.team.id === teamIdNum)
                if (roster) {
                    foundTeam = {
                        id: roster.team.id,
                        name: roster.team.name,
                        image_url: roster.team.image_url,
                        acronym: roster.team.acronym,
                        location: roster.team.location,
                        players: roster.players || []
                    }
                    break
                }
            }
            
            // Also check the teams array
            if (tournament.teams && Array.isArray(tournament.teams)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const team = tournament.teams.find((t: any) => t.id === teamIdNum)
                if (team && !foundTeam) {
                    foundTeam = {
                        id: team.id,
                        name: team.name,
                        image_url: team.image_url,
                        acronym: team.acronym,
                        location: team.location,
                        players: []
                    }
                }
            }
        }

        if (!foundTeam) {
            console.log('Team not found in tournaments data')
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            )
        }

        console.log('Team found in tournaments:', foundTeam.name)
        return NextResponse.json(foundTeam)

    } catch (error) {
        console.error('Error fetching team details:', error)
        return NextResponse.json(
            { error: 'Failed to fetch team details' },
            { status: 500 }
        )
    }
} 