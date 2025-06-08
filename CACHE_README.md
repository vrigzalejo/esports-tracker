# Caching System Documentation

## Overview

The application now implements a comprehensive 1-hour caching system for all API responses to improve performance and reduce redundant API calls.

## Features

### 🚀 **1-Hour Cache Duration**
- All API responses are cached for 1 hour
- Automatic expiration and cleanup of old entries
- Consistent cache keys based on endpoint and parameters

### 📊 **Cached Data Types**
- **Games/Videogames**: Dropdown data used across all pages
- **Matches**: Match listings with filters
- **Match Details**: Individual match information and statistics
- **Tournaments**: Tournament data with filters  
- **Teams**: Team information with filters

### 🎯 **Smart Cache Management**
- Automatic cache hit/miss detection
- Parameter-based cache keys (same endpoint with different filters = different cache entries)
- Expired entry cleanup every 5 minutes
- Manual cache management tools

## Implementation Details

### Core Components

#### 1. **Cache Manager** (`app/lib/cache.ts`)
```typescript
// Singleton cache manager with 1-hour expiration
export const cacheManager = new CacheManager()
```

#### 2. **API Layer** (`app/lib/api.ts`)
```typescript
// All API calls now check cache first, then fetch if needed
const request = async (endpoint: string, params?: Record<string, string>) => {
  const cachedData = cacheManager.get(endpoint, params)
  if (cachedData) return cachedData
  
  // Fetch and cache response
  const data = await fetch(...)
  cacheManager.set(endpoint, data, params)
  return data
}
```

#### 3. **Context Providers**
- **GamesProvider**: Manages games data cache
- **DataProvider**: Provides cache management utilities

### Cache Key Strategy

Cache keys are generated using:
```
endpoint:sorted_parameters
```

Examples:
- `/api/games` → Simple key for games data
- `/api/matches:{"game":"valorant","page":"1"}` → Matches for Valorant, page 1
- `/api/matches/12345` → Individual match details for match ID 12345
- `/api/tournaments:{"game":"lol","since":"2024-01-01"}` → Tournaments with filters

## Usage

### Automatic Caching
All existing API calls automatically benefit from caching with no code changes required.

### Manual Cache Management
```typescript
import { useDataContext } from '@/contexts/DataContext'

const { clearAllCache, clearExpiredCache, getCacheStats } = useDataContext()

// Clear all cached data
clearAllCache()

// Clear only expired entries
clearExpiredCache()

// Get cache statistics
const stats = getCacheStats()
```

### Using Match Details with Caching
```typescript
import { useMatchDetails } from '@/hooks/useEsportsData'

// Fetch individual match details (automatically cached)
const { data: match, loading, error } = useMatchDetails(matchId)

// The match details will be cached for 1 hour
// Subsequent calls with the same matchId will return cached data
```

### Cache Status Monitoring
A debug component shows real-time cache status:
- Total cached entries
- Breakdown by data type (games, matches, match details, tournaments, teams)
- Expired entries count
- Manual cache clearing buttons

## Performance Benefits

### Before Caching
- Games data fetched on every page load (3+ requests)
- Match/tournament/team data refetched on every filter change
- Match details fetched every time a match is viewed
- Redundant API calls when navigating between pages

### After Caching
- Games data fetched once, reused for 1 hour
- Filtered results cached per unique filter combination
- Match details cached for 1 hour per individual match
- Instant page loads when data is cached
- Reduced API server load

## Console Logging

The system provides helpful console logs:
- `🎯 Cache HIT` - Data served from cache
- `🌐 Cache MISS` - Data fetched from API
- `💾 Cached response` - New data cached

## Cache Expiration

- **Duration**: 1 hour per entry
- **Cleanup**: Automatic cleanup every 5 minutes
- **Manual**: Clear cache anytime via debug component

## Development

### Debug Component
The `CacheStatus` component (bottom-right corner) shows:
- Real-time cache statistics
- Manual cache management
- Cache health monitoring

### Environment Considerations
- Cache is in-memory (resets on page refresh)
- Production-ready for client-side caching
- Consider server-side caching for additional performance

## Future Enhancements

Potential improvements:
- Persistent cache (localStorage/IndexedDB)
- Configurable cache durations per endpoint
- Cache warming strategies
- Background refresh for critical data
- Cache size limits and LRU eviction 
