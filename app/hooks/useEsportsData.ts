'use client'

import { useState, useEffect } from 'react'
import type { Match, Tournament, Team } from '@/types/esports'
import { mockMatches, mockTournaments, mockTeams } from '@/lib/data'

interface UseEsportsDataReturn {
  matches: Match[]
  tournaments: Tournament[]
  teams: Team[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useEsportsData(): UseEsportsDataReturn {
  const [matches, setMatches] = useState<Match[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // In production, replace with actual API calls:
      /*
      const [matchesRes, tournamentsRes, teamsRes] = await Promise.all([
        fetch('https://api.pandascore.co/matches?token=YOUR_TOKEN'),
        fetch('https://api.pandascore.co/tournaments?token=YOUR_TOKEN'),
        fetch('https://api.pandascore.co/teams?token=YOUR_TOKEN')
      ])
      
      if (!matchesRes.ok || !tournamentsRes.ok || !teamsRes.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const [matchesData, tournamentsData, teamsData] = await Promise.all([
        matchesRes.json(),
        tournamentsRes.json(),
        teamsRes.json()
      ])
      
      setMatches(matchesData)
      setTournaments(tournamentsData)
      setTeams(teamsData)
      */
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMatches(mockMatches)
      setTournaments(mockTournaments)
      setTeams(mockTeams)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    matches,
    tournaments,
    teams,
    loading,
    error,
    refetch: fetchData
  }
}
