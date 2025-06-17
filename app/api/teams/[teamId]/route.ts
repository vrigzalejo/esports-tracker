import { NextRequest, NextResponse } from 'next/server'
import { getTournaments } from '@/lib/pandaScore'
import { logApiError } from '@/lib/utils'

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

        // First try the direct PandaScore teams endpoint
        try {
            const apiUrl = `https://api.pandascore.co/teams/${teamIdNum}?token=${PANDASCORE_TOKEN}`
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 300 }
            })

            if (response.ok) {
                const team = await response.json()
                return NextResponse.json(team)
            }
        } catch {
            // Continue to fallback approach
        }

        // Fallback: Get team data from tournaments
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
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(foundTeam)

    } catch (error) {
        logApiError(`/teams/${(await params).teamId}`, error)
        return NextResponse.json(
            { error: 'Failed to fetch team details' },
            { status: 500 }
        )
    }
} 
