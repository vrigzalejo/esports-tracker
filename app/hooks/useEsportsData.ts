'use client'

import { useState, useEffect } from 'react'
import { getMatches, getTournaments, getTeams, getPlayers, getMatchDetails } from '@/lib/api'
import type { Match, Tournament, Team } from '@/types/esports'
import type { Player } from '@/types/roster'

export function useMatches(filters?: {
  game?: string
  status?: string
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
  // Time-based filters
  past?: boolean,           // Only past matches
  running?: boolean,        // Only currently running matches
  upcoming?: boolean        // Only upcoming matches
}) {
  const [data, setData] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiFilters = prepareApiFilters(filters)
        
        // Set default sorting to begin_at if not specified
        if (!apiFilters.sort) {
          apiFilters.sort = 'begin_at'
        }

        const result = await getMatches(apiFilters) as Match[]
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
    filters?.status,
    filters?.page, 
    filters?.per_page, 
    filters?.sort,
    filters?.range?.since,
    filters?.range?.until, 
    filters?.since, 
    filters?.until,
    filters?.past,
    filters?.running,
    filters?.upcoming
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

export function useTournaments(filters?: {
  game?: string
  page?: number,
  per_page?: number,
  // Date filtering options
  range?: {
    since?: string | Date,
    until?: string | Date
  },
  since?: string | Date,
  until?: string | Date,
  past?: boolean,
  running?: boolean,
  upcoming?: boolean
}) {
  const [data, setData] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiFilters = prepareApiFilters(filters)
        const result = await getTournaments(apiFilters)
        
        // Handle different response formats
        // When game filtering is applied, API returns { data: [], pagination: {} }
        // Otherwise, it returns the array directly
        if (result && typeof result === 'object' && 'data' in result) {
          setData(result.data)
        } else {
          setData(result)
        }
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
    filters?.per_page,
    filters?.range?.since,
    filters?.range?.until,
    filters?.since,
    filters?.until,
    filters?.past,
    filters?.running,
    filters?.upcoming
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

export function useTeams(filters?: {
  game?: string
  page?: number,
  per_page?: number,
  region?: string,
  // Date filtering options
  range?: {
    since?: string | Date,
    until?: string | Date
  },
  since?: string | Date,
  until?: string | Date,
  past?: boolean,
  running?: boolean,
  upcoming?: boolean
}) {
  const [data, setData] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiFilters = prepareApiFilters(filters)
        const result = await getTeams(apiFilters)
        
        // Handle different response formats
        // When game filtering is applied, API returns { data: [], pagination: {} }
        // Otherwise, it returns the array directly
        if (result && typeof result === 'object' && 'data' in result) {
          setData(result.data)
        } else {
          setData(result)
        }
      } catch (err) {
        console.error('Error fetching teams:', err)
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
    filters?.region,
    filters?.range?.since,
    filters?.range?.until,
    filters?.since,
    filters?.until,
    filters?.past,
    filters?.running,
    filters?.upcoming
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

// useGames hook has been moved to GamesContext for caching
// Use useGamesContext from '@/contexts/GamesContext' instead

export function useMatchDetails(matchId: string | number | null) {
  const [data, setData] = useState<Match | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!matchId) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getMatchDetails(matchId)
        setData(result)
      } catch (err) {
        console.error('Error fetching match details:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [matchId])

  return { data, loading, error }
}

export function usePlayers(filters?: {
  page?: number,
  per_page?: number,
  search?: string
}) {
  const [data, setData] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getPlayers(filters)
        
        // Handle different response formats
        if (result && typeof result === 'object' && 'data' in result) {
          setData(result.data)
        } else {
          setData(result || [])
        }
      } catch (err) {
        console.error('Error fetching players:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [
    filters?.page,
    filters?.per_page,
    filters?.search
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

interface ApiFilters {
  game?: string
  status?: string
  page?: number
  per_page?: number
  sort?: string
  since?: string
  until?: string
  [key: string]: string | number | undefined
}

interface FilterOptions {
  game?: string
  status?: string
  page?: number
  per_page?: number
  sort?: string
  region?: string
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

// Helper function to format date for API
const formatDateForApi = (date: string | Date): string => {
  if (typeof date === 'string') {
    return date
  }
  return date.toISOString().split('T')[0]
}

// Helper function to prepare API filters
function prepareApiFilters(filters?: FilterOptions): ApiFilters {
  if (!filters) return {}

  const apiFilters: ApiFilters = {
    game: filters.game !== 'all' ? filters.game : undefined,
    status: filters.status,
    page: filters.page ? parseInt(filters.page.toString()) : undefined,
    per_page: filters.per_page ? parseInt(filters.per_page.toString()) : undefined,
    sort: filters.sort || 'begin_at',
    region: filters.region !== 'all' ? filters.region : undefined
  }

  // Handle date filtering
  if (filters.range) {
    if (filters.range.since) {
      apiFilters.since = formatDateForApi(filters.range.since)
    }
    if (filters.range.until) {
      apiFilters.until = formatDateForApi(filters.range.until)
    }
  }

  // Direct date filters take precedence over range
  if (filters.since) {
    apiFilters.since = formatDateForApi(filters.since)
  }
  if (filters.until) {
    apiFilters.until = formatDateForApi(filters.until)
  }

  // Handle special time-based filters
  if (filters.running) {
    apiFilters.status = 'running'
  } else if (filters.past) {
    apiFilters.status = 'finished'
    if (!apiFilters.until) {
      apiFilters.until = formatDateForApi(new Date())
    }
  } else if (filters.upcoming) {
    apiFilters.status = 'not_started'
    if (!apiFilters.since) {
      apiFilters.since = formatDateForApi(new Date())
    }
  }

  return apiFilters
}
