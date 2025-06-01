'use client'

import { useState, useEffect } from 'react'
import { getMatches, getTournaments, getTeams, getGames } from '@/lib/api'
import { mockMatches, mockTournaments, mockTeams } from '@/lib/data'

const token = process.env.NEXT_PUBLIC_PANDASCORE_TOKEN

export function useMatches(filters?: {
  game?: string
  status?: string
  page?: number
}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use mock data if no API token is available
        if (!token) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500))
          setData(mockMatches)
          return
        }

        const result = await getMatches(token, filters)
        setData(result)
      } catch (err) {
        console.error('Error fetching matches:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        // Fallback to mock data on error
        setData(mockMatches)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters?.game, filters?.status, filters?.page, filters?.per_page])

  return { data, loading, error }
}

export function useTournaments(filters?: {
  game?: string
  page?: number
}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!token) {
          await new Promise(resolve => setTimeout(resolve, 500))
          setData(mockTournaments)
          return
        }

        const result = await getTournaments(token, filters)
        setData(result)
      } catch (err) {
        console.error('Error fetching tournaments:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData(mockTournaments)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters?.game, filters?.page])

  return { data, loading, error }
}

export function useTeams(filters?: {
  game?: string
  page?: number
}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!token) {
          await new Promise(resolve => setTimeout(resolve, 500))
          setData(mockTeams)
          return
        }

        const result = await getTeams(token, filters)
        setData(result)
      } catch (err) {
        console.error('Error fetching teams:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData(mockTeams)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters?.game, filters?.page])

  return { data, loading, error }
}

export function useGames() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)
  
    useEffect(() => {
      const fetchGames = async () => {
        try {
            setLoading(true)
            setError(null)

            if (!token) {
                await new Promise(resolve => setTimeout(resolve, 500))
                return
            }

            const result = await getGames(token);
            setGames(result);
        } catch (err) {
            console.error('Error fetching games:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false);
        }
      };
  
      fetchGames();
    }, []);
  
    return { games, loading, error };
};
  