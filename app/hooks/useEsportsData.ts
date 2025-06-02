'use client'

import { useState, useEffect } from 'react'
import { getMatches, getTournaments, getTeams, getGames } from '@/lib/api'

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

        // Prepare API filters with date parameters
        const apiFilters = prepareApiFilters(filters)
        const result = await getMatches(token, apiFilters)
        
        // Process the real API data
        let processedData = [...result]
        
        // Apply additional client-side date filtering if needed
        processedData = applyDateFilters(processedData, filters)
        
        // Sort matches properly
        processedData = sortMatches(processedData, filters?.game)
        
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

// Helper function to prepare API filters with date parameters
function prepareApiFilters(filters: any) {
  if (!filters) return {}
  
  const apiFilters = { ...filters }
  
  // Handle range object
  if (filters.range) {
    if (filters.range.since) {
      apiFilters.since = formatDateForApi(filters.range.since)
    }
    if (filters.range.until) {
      apiFilters.until = formatDateForApi(filters.range.until)
    }
    // Remove the range object as it's not needed for API
    delete apiFilters.range
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

// Helper function to sort matches
function sortMatches(matches: any[], selectedGame?: string) {
  const now = new Date()
  
  return matches.sort((a, b) => {
    const dateA = new Date(a.scheduled_at || a.begin_at)
    const dateB = new Date(b.scheduled_at || b.begin_at)
    
    // If "All Games" is selected, prioritize by status and proximity to current time
    if (!selectedGame || selectedGame === 'all') {
      // Live matches first
      const isLiveA = a.status === 'running'
      const isLiveB = b.status === 'running'
      
      if (isLiveA && !isLiveB) return -1
      if (!isLiveA && isLiveB) return 1
      
      // If both are live, sort by most recent start time
      if (isLiveA && isLiveB) {
        return dateB.getTime() - dateA.getTime()
      }
      
      // For non-live matches, upcoming matches come first
      const isUpcomingA = dateA > now
      const isUpcomingB = dateB > now
      
      if (isUpcomingA && !isUpcomingB) return -1
      if (!isUpcomingA && isUpcomingB) return 1
      
      // If both upcoming, sort by soonest first
      if (isUpcomingA && isUpcomingB) {
        return dateA.getTime() - dateB.getTime()
      }
      
      // If both are past, sort by most recent first
      return dateB.getTime() - dateA.getTime()
    } 
    // If a specific game is selected, sort only by date and time (ascending - soonest first)
    else {
      // Live matches still come first even for specific games
      const isLiveA = a.status === 'running'
      const isLiveB = b.status === 'running'
      
      if (isLiveA && !isLiveB) return -1
      if (!isLiveA && isLiveB) return 1
      
      // For all other matches (live, upcoming, or past), sort by date ascending
      return dateA.getTime() - dateB.getTime()
    }
  })
}
