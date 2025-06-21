# Esports Tracker - Caching & Request Optimization

This document outlines the caching and request optimization strategies implemented in the Esports Tracker application.

## Request Deduplication

### Frontend API Client (`app/lib/api.ts`)
- **Request deduplication**: Prevents duplicate API calls by storing ongoing requests in a Map
- **Cache integration**: Checks cache before making new requests
- **Request key generation**: Creates unique keys based on endpoint and parameters
- **Automatic cleanup**: Removes completed requests from the ongoing requests map

### Custom Hooks Optimization (`app/hooks/useEsportsData.ts`)
- **Memoized filters**: Uses `useMemo` to prevent unnecessary re-renders when filter objects change
- **Optimized dependencies**: Reduced useEffect dependency arrays to use memoized values
- **Request cancellation**: Implements proper cleanup to cancel requests when components unmount
- **Batched requests**: New `useBatchedRequests` hook for components that need multiple API calls

### Component-Level Optimizations

#### Detail Components
- **TeamDetailsContent**: Uses `useCallback` for fetch functions to prevent unnecessary re-renders
- **TournamentDetailsContent**: Optimized parallel API calls with proper memoization
- **PlayerDetailsContent**: Implemented memoized fetch functions

#### Tournament Status Hooks
- **Conditional fetching**: Only fetches data for the active tournament status (upcoming/running/past)
- **Proper cleanup**: Cancels requests when switching between statuses
- **Memoized filters**: Prevents unnecessary API calls when filter objects haven't changed

## Cache Management

### Redis Cache (`app/lib/redis.ts` & `app/lib/cachedApi.ts`)
- **Games-only caching**: Redis caching is enabled only for Games endpoints
- **TTL-based expiration**: 24-hour cache for games (static data)
- **Fallback handling**: Graceful fallback to direct API calls when Redis is unavailable
- **Connection management**: Automatic connection handling with retry logic

### Disabled Caching for Dynamic Data
- **Matches**: No Redis caching (data changes frequently)
- **Tournaments**: No Redis caching (status changes often)
- **Teams**: No Redis caching (roster changes)
- **Players**: No Redis caching (profile updates)
- **Home data**: No Redis caching (composite data)

## Performance Benefits

### Reduced API Calls
- **Deduplication**: Prevents identical simultaneous requests
- **Conditional fetching**: Only fetches data when needed (e.g., active tournament status)
- **Memoized dependencies**: Reduces unnecessary useEffect triggers

### Improved User Experience
- **Faster navigation**: Cached data loads instantly
- **Reduced loading states**: Less flickering between states
- **Better responsiveness**: Fewer network requests mean faster interactions

### Server Load Reduction
- **Request batching**: Multiple related requests are handled efficiently
- **Cache hits**: Reduces load on external APIs (PandaScore)
- **Smart invalidation**: Only refetches when data might have changed

## Implementation Details

### Request Deduplication Flow
1. Generate unique request key from endpoint + parameters
2. Check if request is already in progress
3. If yes, return the existing promise
4. If no, create new request and store promise
5. Clean up completed requests automatically

### Memoization Strategy
- Filter objects are memoized to prevent object reference changes
- useCallback is used for fetch functions in detail components
- useMemo is used for expensive computations and filtering

### Cache Strategy
- **Games only**: Redis caching with 24-hour TTL for games (most static data)
- **No caching**: All other endpoints bypass Redis for real-time data
- **Direct API calls**: Matches, tournaments, teams, players fetch directly from PandaScore
- **Fallback handling**: Graceful degradation when Redis is unavailable

## Monitoring

### Debug Components
- **CacheStatus**: Shows cache hit/miss rates and memory usage
- **Request logging**: Tracks API calls and response times
- **Performance metrics**: Monitors cache effectiveness

### Metrics Tracked
- Cache hit/miss ratios
- Request deduplication effectiveness
- Memory usage patterns
- API response times

## Best Practices

1. **Always use memoized filters** in custom hooks
2. **Implement request cancellation** for long-running operations
3. **Use conditional fetching** for inactive UI states
4. **Batch related API calls** when possible
5. **Monitor cache performance** regularly

## Future Improvements

- Implement service worker for offline caching
- Add request retry logic with exponential backoff
- Implement more sophisticated cache invalidation strategies
- Add request prioritization for critical data
