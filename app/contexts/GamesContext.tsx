'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getGames } from '@/lib/api'

interface Game {
  id: string | number
  slug: string
  name: string
}

interface GamesContextType {
  games: Game[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const GamesContext = createContext<GamesContextType | undefined>(undefined)

interface GamesProviderProps {
  children: ReactNode
}

export function GamesProvider({ children }: GamesProviderProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    fetchGames()
  }, [])

  const refetch = async () => {
    await fetchGames()
  }

  return (
    <GamesContext.Provider value={{ games, loading, error, refetch }}>
      {children}
    </GamesContext.Provider>
  )
}

export function useGamesContext() {
  const context = useContext(GamesContext)
  if (context === undefined) {
    throw new Error('useGamesContext must be used within a GamesProvider')
  }
  return context
} 