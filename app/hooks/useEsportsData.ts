'use client'

import { useState, useEffect } from 'react'
import { getMatches, getTournaments, getTeams, getGames } from '@/lib/api'
import type { Match, Tournament, Team } from '@/types/esports'

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
  ])

  return { data, loading, error }
}

export function useTournaments(filters?: {
  game?: string
  page?: number,
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
        setData(result)
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

export function useTeams(filters?: {
  game?: string
  page?: number
}) {
  const [data, setData] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getTeams(filters)
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
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getGames()
        setGames(result)
      } catch (err) {
        console.error('Error fetching games:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  return { games, loading, error }
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
    sort: filters.sort || 'begin_at'
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
