'use client'

import { useState, useEffect } from 'react'
import { getMatches, getTournaments, getTeams, getGames } from '@/lib/api'
import type { Match } from '@/types/esports'

const token = process.env.NEXT_PUBLIC_PANDASCORE_TOKEN

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
        
        // Only apply client-side filtering for running/past/upcoming
        // since these are not supported by the API
        const processedData = applyTimeBasedFilters(result, filters)
        
        setData(processedData)
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
  const [data, setData] = useState([])
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
        const result = await getTournaments(token, apiFilters)
        
        // Apply additional client-side date filtering
        let processedData = applyDateFilters(result, filters, 'begin_at')
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
  status?: string
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
    status: filters.status,
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

// Helper function to apply time-based filters client-side
function applyTimeBasedFilters(data: Match[], filters: MatchesFilters | undefined): Match[] {
  if (!filters || !data) return data
  
  const now = new Date()
  
  return data.filter(item => {
    const itemDate = new Date(item.scheduled_at || item.begin_at)
    
    // Handle time-based filters
    if (filters.past && itemDate >= now) return false
    if (filters.upcoming && itemDate <= now) return false
    if (filters.running) {
      if (item.status !== 'running') return false
    }
    
    return true
  })
}

// Helper function to format dates for API (ISO string format)
function formatDateForApi(date: string | Date): string {
  if (typeof date === 'string') {
    return date
  }
  return date.toISOString()
}

// Helper function to apply date filters client-side
function applyDateFilters(data: any[], filters: any, dateField: string = 'scheduled_at') {
  if (!filters || !data) return data
  
  const now = new Date()
  
  return data.filter(item => {
    const itemDate = new Date(item[dateField] || item.begin_at || item.end_at)
    
    // Handle range filters
    if (filters.range) {
      if (filters.range.since) {
        const sinceDate = new Date(filters.range.since)
        if (itemDate < sinceDate) return false
      }
      if (filters.range.until) {
        const untilDate = new Date(filters.range.until)
        if (itemDate > untilDate) return false
      }
    }
    
    // Handle direct date filters
    if (filters.since) {
      const sinceDate = new Date(filters.since)
      if (itemDate < sinceDate) return false
    }
    if (filters.until) {
      const untilDate = new Date(filters.until)
      if (itemDate > untilDate) return false
    }
    
    // Handle time-based filters
    if (filters.past && itemDate >= now) return false
    if (filters.upcoming && itemDate <= now) return false
    if (filters.running) {
      // For running filter, check if item has a status field
      if (item.status && item.status !== 'running') return false
    }
    
    return true
  })
}
