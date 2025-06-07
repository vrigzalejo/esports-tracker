interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

  private generateKey(endpoint: string, params?: Record<string, unknown>): string {
    if (!params) return endpoint
    
    // Sort params to ensure consistent keys
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {} as Record<string, unknown>)
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`
  }

  get<T>(endpoint: string, params?: Record<string, unknown>): T | null {
    const key = this.generateKey(endpoint, params)
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if cache entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  set<T>(endpoint: string, data: T, params?: Record<string, unknown>): void {
    const key = this.generateKey(endpoint, params)
    const now = Date.now()
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    })
  }

  clear(): void {
    this.cache.clear()
  }

  clearExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache info for debugging
  getCacheInfo(): { size: number; entries: Array<{ key: string; expiresIn: number }> } {
    const now = Date.now()
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expiresIn: Math.max(0, entry.expiresAt - now)
    }))
    
    return {
      size: this.cache.size,
      entries
    }
  }
}

// Create a singleton instance
export const cacheManager = new CacheManager()

// Auto-cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.clearExpired()
  }, 5 * 60 * 1000)
} 
