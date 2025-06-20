import { redisCache, cacheKeys, cacheTTL } from './redis'
import { logger } from './logger'

interface CacheOptions {
  ttl?: number
  forceRefresh?: boolean
}

/**
 * Generic cached fetch function that tries Redis first, then falls back to API
 */
async function cachedFetch<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = cacheTTL.default, forceRefresh = false } = options

  // If force refresh is requested, skip cache
  if (!forceRefresh) {
    try {
      // Try to get from Redis cache first
      const cachedData = await redisCache.get(cacheKey)
      
      if (cachedData) {
        logger.debug(`Cache HIT for key: ${cacheKey}`)
        return JSON.parse(cachedData) as T
      }
      
      logger.debug(`Cache MISS for key: ${cacheKey}`)
    } catch (error) {
      logger.error('Error reading from cache:', error)
      // Continue to API fetch on cache error
    }
  }

  // Fetch from API
  logger.debug(`Fetching from API for key: ${cacheKey}`)
  const data = await fetchFunction()

  // Try to cache the result (don't fail if caching fails)
  try {
    const serialized = JSON.stringify(data)
    const cached = await redisCache.set(cacheKey, serialized, ttl)
    
    if (cached) {
      logger.debug(`Cached data for key: ${cacheKey} (TTL: ${ttl}s)`)
    } else {
      logger.debug(`Failed to cache data for key: ${cacheKey}`)
    }
  } catch (error) {
    logger.error('Error caching data:', error)
    // Don't throw, just log the error
  }

  return data
}

/**
 * Cached games API - specifically for dropdown usage
 */
export async function getCachedGames(options: CacheOptions = {}) {
  const cacheKey = cacheKeys.games()
  
  return cachedFetch(
    cacheKey,
    async () => {
      // Use the existing PandaScore function to maintain consistency
      const { getGames } = await import('./pandaScore')
      const games = await getGames()
      logger.info(`Fetched ${games.length} games from API`)
      return games
    },
    {
      ttl: cacheTTL.games, // 24 hours cache for games
      ...options
    }
  )
}

/**
 * Cached matches API
 */
export async function getCachedMatches(
  page: number = 1,
  filters: Record<string, unknown> = {},
  options: CacheOptions = {}
) {
  const cacheKey = cacheKeys.matches(page, filters)
  
  return cachedFetch(
    cacheKey,
    async () => {
      // Use the existing PandaScore function
      const { getMatches } = await import('./pandaScore')
      const matchFilters = {
        page,
        per_page: 50,
        ...filters
      }
      const matches = await getMatches(matchFilters)
      logger.info(`Fetched ${matches.length} matches from API (page ${page})`)
      return matches
    },
    {
      ttl: cacheTTL.matches, // 5 minutes cache for matches
      ...options
    }
  )
}

/**
 * Cached tournaments API - generic
 */
export async function getCachedTournaments(
  filters: Record<string, unknown> = {},
  options: CacheOptions = {}
) {
  const page = (filters.page as number) || 1
  const cacheKey = cacheKeys.tournaments('all', page)
  
  return cachedFetch(
    cacheKey,
    async () => {
      // Use the existing PandaScore function
      const { getTournaments } = await import('./pandaScore')
      const tournaments = await getTournaments(filters)
      logger.info(`Fetched ${tournaments.length} tournaments from API (page ${page})`)
      return tournaments
    },
    {
      ttl: cacheTTL.tournaments, // 15 minutes cache for tournaments
      ...options
    }
  )
}

/**
 * Cached running tournaments API
 */
export async function getCachedRunningTournaments(
  page: number = 1,
  per_page: number = 20,
  options: CacheOptions = {}
) {
  const cacheKey = cacheKeys.tournaments('running', page)
  
  return cachedFetch(
    cacheKey,
    async () => {
      // Direct API call since there's no PandaScore function for this
      const token = process.env.PANDASCORE_TOKEN
      if (!token) {
        throw new Error('PandaScore API token not configured')
      }

      const params = new URLSearchParams({
        token,
        page: page.toString(),
        per_page: per_page.toString(),
        include: 'teams',
        sort: '-begin_at'
      })

      const response = await fetch(`https://api.pandascore.co/tournaments/running?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch running tournaments: ${response.status}`)
      }

      const tournaments = await response.json()
      logger.info(`Fetched ${tournaments.length} running tournaments from API (page ${page})`)
      return tournaments
    },
    {
      ttl: cacheTTL.tournaments, // 15 minutes cache for tournaments
      ...options
    }
  )
}

/**
 * Cached upcoming tournaments API
 */
export async function getCachedUpcomingTournaments(
  page: number = 1,
  per_page: number = 20,
  options: CacheOptions = {}
) {
  const cacheKey = cacheKeys.tournaments('upcoming', page)
  
  return cachedFetch(
    cacheKey,
    async () => {
      // Direct API call since there's no PandaScore function for this
      const token = process.env.PANDASCORE_TOKEN
      if (!token) {
        throw new Error('PandaScore API token not configured')
      }

      const params = new URLSearchParams({
        token,
        page: page.toString(),
        per_page: per_page.toString(),
        include: 'teams',
        sort: 'begin_at'
      })

      const response = await fetch(`https://api.pandascore.co/tournaments/upcoming?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch upcoming tournaments: ${response.status}`)
      }

      const tournaments = await response.json()
      logger.info(`Fetched ${tournaments.length} upcoming tournaments from API (page ${page})`)
      return tournaments
    },
    {
      ttl: cacheTTL.tournaments, // 15 minutes cache for tournaments
      ...options
    }
  )
}

/**
 * Cached past tournaments API
 */
export async function getCachedPastTournaments(
  page: number = 1,
  per_page: number = 20,
  options: CacheOptions = {}
) {
  const cacheKey = cacheKeys.tournaments('past', page)
  
  return cachedFetch(
    cacheKey,
    async () => {
      // Direct API call since there's no PandaScore function for this
      const token = process.env.PANDASCORE_TOKEN
      if (!token) {
        throw new Error('PandaScore API token not configured')
      }

      const params = new URLSearchParams({
        token,
        page: page.toString(),
        per_page: per_page.toString(),
        include: 'teams',
        sort: '-begin_at'
      })

      const response = await fetch(`https://api.pandascore.co/tournaments/past?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch past tournaments: ${response.status}`)
      }

      const tournaments = await response.json()
      logger.info(`Fetched ${tournaments.length} past tournaments from API (page ${page})`)
      return tournaments
    },
    {
      ttl: cacheTTL.tournaments, // 15 minutes cache for tournaments
      ...options
    }
  )
}

/**
 * Cached teams API
 */
export async function getCachedTeams(page: number = 1, options: CacheOptions = {}) {
  const cacheKey = cacheKeys.teams(page)
  
  return cachedFetch(
    cacheKey,
    async () => {
      // Use the existing PandaScore function
      const { getTeams } = await import('./pandaScore')
      const teamFilters = {
        page,
        per_page: 50
      }
      const teams = await getTeams(teamFilters)
      logger.info(`Fetched ${teams.length} teams from API (page ${page})`)
      return teams
    },
    {
      ttl: cacheTTL.teams, // 1 hour cache for teams
      ...options
    }
  )
}

/**
 * Cached players API
 */
export async function getCachedPlayers(page: number = 1, options: CacheOptions = {}) {
  const cacheKey = cacheKeys.players(page)
  
  return cachedFetch(
    cacheKey,
    async () => {
      // Use the existing PandaScore function
      const { getPlayers } = await import('./pandaScore')
      const playerFilters = {
        page,
        per_page: 50
      }
      const players = await getPlayers(playerFilters)
      logger.info(`Fetched ${players.length} players from API (page ${page})`)
      return players
    },
    {
      ttl: cacheTTL.players, // 1 hour cache for players
      ...options
    }
  )
}

/**
 * Cached home page API - combines matches, tournaments, and teams data
 */
export async function getCachedHomeData(options: CacheOptions = {}) {
  const cacheKey = 'esports:home:data'
  
  return cachedFetch(
    cacheKey,
    async () => {
      // Fetch all data in parallel for better performance
      const [matches, tournaments, teams] = await Promise.all([
        getCachedMatches(1, { per_page: 100 }),
        getCachedTournaments({ page: 1, per_page: 50 }),
        getCachedTeams(1)
      ])

      logger.info(`Fetched home page data: ${matches.length} matches, ${tournaments.length} tournaments, ${teams.length} teams`)
      
      return {
        matches,
        tournaments,
        teams,
        fetchedAt: new Date().toISOString()
      }
    },
    {
      ttl: 5 * 60, // 5 minutes cache for home page data
      ...options
    }
  )
}

/**
 * Cache management utilities
 */
export const cacheUtils = {
  /**
   * Clear all cached games
   */
  async clearGamesCache(): Promise<boolean> {
    return await redisCache.del(cacheKeys.games())
  },

  /**
   * Clear all cached matches
   */
  async clearMatchesCache(): Promise<number> {
    return await redisCache.flushPattern('esports:matches:*')
  },

  /**
   * Clear all cached tournaments
   */
  async clearTournamentsCache(): Promise<number> {
    return await redisCache.flushPattern('esports:tournaments:*')
  },

  /**
   * Clear all cached teams
   */
  async clearTeamsCache(): Promise<number> {
    return await redisCache.flushPattern('esports:teams:*')
  },

  /**
   * Clear all cached players
   */
  async clearPlayersCache(): Promise<number> {
    return await redisCache.flushPattern('esports:players:*')
  },

  /**
   * Clear home page cache
   */
  async clearHomeCache(): Promise<boolean> {
    return await redisCache.del(cacheKeys.home())
  },

  /**
   * Clear all esports cache
   */
  async clearAllCache(): Promise<number> {
    return await redisCache.flushPattern('esports:*')
  },

  /**
   * Get cache connection status
   */
  getCacheStatus() {
    return redisCache.getConnectionStatus()
  }
} 
