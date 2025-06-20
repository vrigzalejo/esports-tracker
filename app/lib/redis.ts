import { createClient, RedisClientType } from 'redis'
import { logger } from './logger'

interface RedisConfig {
  url?: string
  host?: string
  port?: number
  password?: string
  username?: string
  database?: number
}

class RedisCache {
  private client: RedisClientType | null = null
  private isConnected = false
  private connectionAttempted = false
  private isConnecting = false

  constructor() {
    // Don't auto-connect, wait for first usage
  }

  private async connect(): Promise<boolean> {
    if (this.isConnected || this.isConnecting) {
      return this.isConnected
    }

    if (this.connectionAttempted && !this.isConnected) {
      // Already tried and failed, don't retry immediately
      return false
    }

    this.isConnecting = true
    this.connectionAttempted = true

    try {
      const config = this.getRedisConfig()
      
      if (!config) {
        logger.info('Redis configuration not found, falling back to API only')
        this.isConnecting = false
        return false
      }

      this.client = createClient(config)

      // Handle connection events
      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err)
        this.isConnected = false
      })

      this.client.on('connect', () => {
        logger.info('Redis client connected')
        this.isConnected = true
      })

      this.client.on('disconnect', () => {
        logger.warn('Redis client disconnected')
        this.isConnected = false
      })

      // Connect with timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        )
      ])

      this.isConnecting = false
      return this.isConnected

    } catch (error) {
      logger.warn('Failed to connect to Redis:', error)
      this.isConnected = false
      this.isConnecting = false
      this.client = null
      return false
    }
  }

  private getRedisConfig(): RedisConfig | null {
    // Try different environment variable patterns
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING
    
    if (redisUrl) {
      return { url: redisUrl }
    }

    // Try individual config values
    const host = process.env.REDIS_HOST
    const port = process.env.REDIS_PORT
    const password = process.env.REDIS_PASSWORD
    const username = process.env.REDIS_USERNAME
    const database = process.env.REDIS_DATABASE

    if (host) {
      return {
        host,
        port: port ? parseInt(port, 10) : 6379,
        password,
        username,
        database: database ? parseInt(database, 10) : 0
      }
    }

    // No Redis configuration found
    return null
  }

  async get(key: string): Promise<string | null> {
    try {
      const connected = await this.connect()
      if (!connected || !this.client) {
        return null
      }

      const value = await this.client.get(key)
      logger.debug(`Redis GET ${key}:`, value ? 'HIT' : 'MISS')
      return value

    } catch (error) {
      logger.error('Redis GET error:', error)
      return null
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      const connected = await this.connect()
      if (!connected || !this.client) {
        return false
      }

      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value)
      } else {
        await this.client.set(key, value)
      }

      logger.debug(`Redis SET ${key} (TTL: ${ttlSeconds || 'none'})`)
      return true

    } catch (error) {
      logger.error('Redis SET error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const connected = await this.connect()
      if (!connected || !this.client) {
        return false
      }

      const result = await this.client.del(key)
      logger.debug(`Redis DEL ${key}:`, result > 0 ? 'SUCCESS' : 'NOT_FOUND')
      return result > 0

    } catch (error) {
      logger.error('Redis DEL error:', error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const connected = await this.connect()
      if (!connected || !this.client) {
        return false
      }

      const result = await this.client.exists(key)
      return result > 0

    } catch (error) {
      logger.error('Redis EXISTS error:', error)
      return false
    }
  }

  async flushPattern(pattern: string): Promise<number> {
    try {
      const connected = await this.connect()
      if (!connected || !this.client) {
        return 0
      }

      const keys = await this.client.keys(pattern)
      if (keys.length === 0) {
        return 0
      }

      const result = await this.client.del(keys)
      logger.info(`Redis flushed ${result} keys matching pattern: ${pattern}`)
      return result

    } catch (error) {
      logger.error('Redis flush pattern error:', error)
      return 0
    }
  }

  getConnectionStatus(): { connected: boolean; attempted: boolean } {
    return {
      connected: this.isConnected,
      attempted: this.connectionAttempted
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.disconnect()
        logger.info('Redis client disconnected')
      } catch (error) {
        logger.error('Error disconnecting Redis client:', error)
      }
    }
    this.client = null
    this.isConnected = false
  }
}

// Singleton instance
export const redisCache = new RedisCache()

// Cache key generators
export const cacheKeys = {
  games: () => 'esports:games:all',
  gameById: (id: number) => `esports:games:${id}`,
  matches: (page: number, filters?: Record<string, unknown>) => {
    const filterStr = filters ? `:${Buffer.from(JSON.stringify(filters)).toString('base64')}` : ''
    return `esports:matches:page:${page}${filterStr}`
  },
  tournaments: (status: string, page: number) => `esports:tournaments:${status}:page:${page}`,
  teams: (page: number) => `esports:teams:page:${page}`,
  players: (page: number) => `esports:players:page:${page}`
}

// Cache TTL constants (in seconds)
export const cacheTTL = {
  games: 24 * 60 * 60, // 24 hours - games don't change often
  matches: 5 * 60, // 5 minutes - matches change frequently
  tournaments: 15 * 60, // 15 minutes
  teams: 60 * 60, // 1 hour
  players: 60 * 60, // 1 hour
  default: 10 * 60 // 10 minutes
} 