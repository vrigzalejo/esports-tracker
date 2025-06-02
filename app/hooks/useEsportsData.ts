'use client'

import { useState, useEffect } from 'react'
import { getMatches, getTournaments, getTeams, getGames } from '@/lib/api'
import type { Match, Tournament, Team } from '@/types/esports'

const token = process.env.NEXT_PUBLIC_PANDASCORE_TOKEN

export function useMatches(filters?: {
  game?: string
  page?: number,
  per_page?: number,
  sort?: string,
  // Date filtering options
  range?: {
    since?: string | Date,  // Start date (ISO string or Date object)
    until?: string | Date   // End date (ISO string or Date object)
  },
  // Alternative: specific date filters
  since?: string | Date,    // Matches after this date
  until?: string | Date,    // Matches before this date
}) {
  const [data, setData] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!token) {
          throw new Error('API token not found')
        }

        // Prepare API filters with date parameters
        const apiFilters = prepareApiFilters(filters)
        
        // Set default sorting to begin_at if not specified
        if (!apiFilters.sort) {
          apiFilters.sort = 'begin_at'
        }

        const result = await getMatches(token, apiFilters) as Match[]
        setData(result)
      } catch (err) {
        console.error('Error fetching matches:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [
    filters?.game, 
    filters?.page, 
    filters?.per_page, 
    filters?.sort,
    filters?.range?.since,
    filters?.range?.until, 
    filters?.since, 
    filters?.until
  ])

  return { data, loading, error }
}

export function useTournaments(filters?: TournamentFilters) {
  const [data, setData] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!token) {
          throw new Error('API token not found')
        }

        const apiFilters = prepareApiFilters(filters)
        const result = await getTournaments(token, apiFilters) as Tournament[]
        
        // Apply additional client-side date filtering
        const processedData = applyDateFilters<Tournament>(result, filters)
        setData(processedData)
      } catch (err) {
        console.error('Error fetching tournaments:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [
    filters?.game, 
    filters?.page,
    filters?.range?.since,
    filters?.range?.until,
    filters?.since,
    filters?.until,
    filters?.past,
    filters?.running,
    filters?.upcoming
  ])

  return { data, loading, error }
}

export function useTeams(filters?: TeamFilters) {
  const [data, setData] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!token) {
          throw new Error('API token not found')
        }

        const result = await getTeams(token, filters)
        setData(result)
      } catch (err) {
        console.error('Error fetching teams:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
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
                throw new Error('API token not found')
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
}

type MatchesFilters = Parameters<typeof useMatches>[0]

interface ApiFilters {
  game?: string
  page?: number
  per_page?: number
  sort?: string
  since?: string
  until?: string
  [key: string]: string | number | undefined
}

// Helper function to prepare API filters with date parameters
function prepareApiFilters(filters: MatchesFilters | undefined): ApiFilters {
  if (!filters) return {}
  
  const apiFilters: ApiFilters = { 
    game: filters.game,
    page: filters.page,
    per_page: filters.per_page,
    sort: filters.sort
  }
  
  // Handle range object
  if (filters.range) {
    if (filters.range.since) {
      apiFilters.since = formatDateForApi(filters.range.since)
    }
    if (filters.range.until) {
      apiFilters.until = formatDateForApi(filters.range.until)
    }
  }
  
  // Handle direct date filters
  if (filters.since) {
    apiFilters.since = formatDateForApi(filters.since)
  }
  if (filters.until) {
    apiFilters.until = formatDateForApi(filters.until)
  }
  
  return apiFilters
}

// Helper function to format dates for API (ISO string format)
function formatDateForApi(date: string | Date): string {
  if (typeof date === 'string') {
    return date
  }
  return date.toISOString()
}

// Add new type definitions at the top after imports
interface DateFilters {
  range?: {
    since?: string | Date
    until?: string | Date
  }
  since?: string | Date
  until?: string | Date
  past?: boolean
  running?: boolean
  upcoming?: boolean
}

interface TournamentFilters extends DateFilters {
  game?: string
  page?: number
}

interface TeamFilters {
  game?: string
  page?: number
}

function applyDateFilters<T extends Match | Tournament>(
  data: T[],
  filters: DateFilters | undefined
): T[] {
  if (!filters || (!filters.range && !filters.since && !filters.until && !filters.past && !filters.running && !filters.upcoming)) {
    return data;
  }

  return data.filter(item => {
    const itemDate = new Date(item.begin_at);
    const now = new Date();

    // Handle range filter
    if (filters.range) {
      if (filters.range.since && new Date(filters.range.since) > itemDate) return false;
      if (filters.range.until && new Date(filters.range.until) < itemDate) return false;
    }

    // Handle individual date filters
    if (filters.since && new Date(filters.since) > itemDate) return false;
    if (filters.until && new Date(filters.until) < itemDate) return false;

    // Handle time-based filters
    if (filters.past && itemDate > now) return false;
    if (filters.upcoming && itemDate < now) return false;
    if (filters.running) {
      if ('status' in item) {
        return item.status === 'running';
      }
      return false;
    }

    return true;
  });
}
