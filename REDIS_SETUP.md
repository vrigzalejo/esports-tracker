# Redis Cache Setup Guide

This application supports Redis caching **for Games only** to improve performance and reduce API calls. Redis is **optional** - the application will automatically fall back to direct API calls if Redis is not configured or unavailable.

**Note**: Only Games endpoints use Redis caching. All other endpoints (Matches, Tournaments, Teams, Players, Home) fetch directly from the API for real-time data.

## 🚀 Quick Start

### Option 1: Using Redis URL (Recommended)

Add to your `.env.local` file:

```bash
# Redis connection string (for cloud services like Upstash, Redis Cloud, etc.)
REDIS_URL=redis://localhost:6379

# Or for Redis with authentication:
REDIS_URL=redis://username:password@localhost:6379

# Or for Redis with SSL (common for cloud services):
REDIS_URL=rediss://username:password@your-redis-host:6380
```

### Option 2: Using Individual Configuration

Add to your `.env.local` file:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password    # Optional
REDIS_USERNAME=your_username    # Optional
REDIS_DATABASE=0               # Optional, defaults to 0
```

## 🐳 Local Redis with Docker

### Quick Start with Docker Compose

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    environment:
      - REDIS_PASSWORD=your_secure_password
    command: redis-server --appendonly yes --requirepass your_secure_password

volumes:
  redis_data:
```

Then run:

```bash
docker-compose up -d redis
```

### Simple Redis without password:

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

Add to `.env.local`:
```bash
REDIS_URL=redis://localhost:6379
```

## ☁️ Cloud Redis Services

### Upstash (Recommended for Vercel)

1. Sign up at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the Redis URL from the dashboard
4. Add to your `.env.local`:

```bash
REDIS_URL=rediss://your-upstash-url
```

### Redis Cloud

1. Sign up at [redis.com](https://redis.com)
2. Create a new database
3. Get connection details from the dashboard
4. Add to your `.env.local`:

```bash
REDIS_URL=rediss://username:password@your-endpoint:port
```

### AWS ElastiCache

```bash
REDIS_HOST=your-elasticache-endpoint.cache.amazonaws.com
REDIS_PORT=6379
```

## 🔧 Cache Configuration

### Cache TTL (Time To Live)

**Only Games are cached with Redis:**

- **Games**: 24 hours (games don't change often) ✅ **CACHED**

**Direct API calls (no Redis caching):**

- **Matches**: Direct API calls ❌ **NOT CACHED**
- **Tournaments**: Direct API calls ❌ **NOT CACHED**
- **Teams**: Direct API calls ❌ **NOT CACHED**
- **Players**: Direct API calls ❌ **NOT CACHED**
- **Home Page**: Direct API calls ❌ **NOT CACHED**

### Cache Keys

**Only Games cache keys are used:**

- Games: `esports:games:all` ✅ **ACTIVE**

**Unused cache keys (endpoints bypass Redis):**

- Matches: `esports:matches:page:1` ❌ **DISABLED**
- Tournaments: 
  - All: `esports:tournaments:all:page:1` ❌ **DISABLED**
  - Running: `esports:tournaments:running:page:1` ❌ **DISABLED**
  - Upcoming: `esports:tournaments:upcoming:page:1` ❌ **DISABLED**
  - Past: `esports:tournaments:past:page:1` ❌ **DISABLED**
- Teams: `esports:teams:page:1` ❌ **DISABLED**
- Players: `esports:players:page:1` ❌ **DISABLED**
- Home Page: `esports:home:data` ❌ **DISABLED**

## 🛠️ Development Tools

### Cache Status Panel

In development mode, you'll see a Redis cache status panel in the bottom-left corner showing:

- ✅ **Connected**: Redis is working
- ❌ **Failed**: Redis connection failed
- ⚠️ **Not configured**: No Redis configuration found

### Cache Management API

#### Check Cache Status
```bash
GET /api/cache
```

#### Clear Cache
```bash
# Clear games cache (only active cache)
DELETE /api/cache?type=games

# Other cache types return "disabled" message
DELETE /api/cache?type=matches      # Returns: "Redis caching disabled"
DELETE /api/cache?type=tournaments  # Returns: "Redis caching disabled"
DELETE /api/cache?type=teams        # Returns: "Redis caching disabled"
DELETE /api/cache?type=players      # Returns: "Redis caching disabled"
DELETE /api/cache?type=home         # Returns: "Redis caching disabled"

# Clear all cache (only clears games)
DELETE /api/cache?type=all
```

#### Force Refresh Data
```bash
# Force refresh games cache (only endpoint with caching)
GET /api/games?force_refresh=true

# Other endpoints always fetch fresh data (no caching to bypass)
GET /api/teams                       # Always fresh
GET /api/players                     # Always fresh
GET /api/tournaments                 # Always fresh
GET /api/tournaments/running         # Always fresh
GET /api/tournaments/upcoming        # Always fresh
GET /api/tournaments/past           # Always fresh
GET /api/home                       # Always fresh
```



## 🔍 Troubleshooting

### Cache Not Working

1. **Check Environment Variables**: Ensure `REDIS_URL` or individual Redis config is set
2. **Check Redis Connection**: Look at the cache status panel in development
3. **Check Logs**: Look for Redis connection errors in the console
4. **Test Redis**: Use `redis-cli ping` to test your Redis instance

### Common Issues

#### Connection Timeout
```
Error: Redis connection timeout
```
**Solution**: Check if Redis is running and accessible

#### Authentication Failed
```
Error: WRONGPASS invalid username-password pair
```
**Solution**: Check your Redis password in the connection string

#### Connection Refused
```
Error: connect ECONNREFUSED
```
**Solution**: Check if Redis is running on the specified host/port

### Fallback Behavior

If Redis is not available, the application will:

1. ✅ Continue working normally
2. ✅ Fetch data directly from APIs
3. ✅ Log warnings about cache unavailability
4. ✅ Show "Not configured" in the cache status panel

## 📊 Performance Benefits

With Redis caching enabled (Games only):

- **Games Dropdown**: Loads instantly after first request (24h cache) ✅
- **Matches**: Always fresh data (no cache) ⚡
- **Tournaments**: Always fresh data (no cache) ⚡
- **Teams/Players**: Always fresh data (no cache) ⚡

**Benefits of this approach:**
- Games are static and benefit from long-term caching
- Dynamic data (matches, tournaments) is always up-to-date
- Reduced complexity and cache invalidation issues

## 🔐 Security Notes

- Use strong passwords for Redis in production
- Use SSL/TLS connections (`rediss://`) for cloud services
- Consider Redis AUTH for additional security
- Firewall Redis ports appropriately

## 🚀 Production Deployment

### Vercel + Upstash (Recommended)

1. Deploy to Vercel
2. Add Upstash Redis integration
3. Environment variables are automatically configured

### Other Platforms

Ensure these environment variables are set:

```bash
REDIS_URL=your_redis_connection_string
```

Or individual config:

```bash
REDIS_HOST=your_host
REDIS_PORT=6379
REDIS_PASSWORD=your_password
``` 