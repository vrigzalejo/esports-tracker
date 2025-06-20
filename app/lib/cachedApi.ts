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
 * Cached tournaments API
 */
export async function getCachedTournaments(
  status: string,
  page: number = 1,
  options: CacheOptions = {}
) {
  const cacheKey = cacheKeys.tournaments(status, page)
  
  return cachedFetch(
    cacheKey,
    async () => {
      // Use the existing PandaScore function
      const { getTournaments } = await import('./pandaScore')
      const tournamentFilters = {
        page,
        per_page: 50
      }
      const tournaments = await getTournaments(tournamentFilters)
      logger.info(`Fetched ${tournaments.length} ${status} tournaments from API (page ${page})`)
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
