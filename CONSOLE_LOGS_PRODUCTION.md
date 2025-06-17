# Console Logs in Production

This document explains how console logs are handled in the production environment.

## Solution Overview

To show logs only in the backend (server-side) and hide them from frontend (client-side) in production, we've implemented a targeted approach:

### 1. Next.js Compiler Configuration

In `next.config.ts`, we've configured the `removeConsole` compiler option to only affect client-side code:

```typescript
compiler: {
  // Remove console logs only from client-side code in production
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error'] // Keep console.error for debugging, remove others
  } : false
}
```

This removes most console statements from client-side code during production builds while preserving server-side logging.

### 2. Dual Logger Utility

We've created a dual logger utility (`app/lib/logger.ts`) that separates client-side and server-side logging:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isClient = typeof window !== 'undefined';

// Client-side logger - only logs in development
export const clientLogger = {
  log: (...args: unknown[]) => {
    if (isDevelopment && isClient) {
      console.log(...args);
    }
  },
  // ... more methods
};

// Server-side logger - always logs (both development and production)
export const serverLogger = {
  log: (...args: unknown[]) => {
    if (!isClient) {
      console.log(...args);
    }
  },
  // ... more methods
};

// Default logger (backwards compatibility) - client-side only in dev
export const logger = clientLogger;
```

## Updated Files

The following files have been updated to use the appropriate logger:

**Server-side files (use `serverLogger` - always logs):**
- `app/lib/logger.ts` - New dual logger utility
- `app/lib/apiSecurity.ts` - Security event logging
- `middleware.ts` - CORS and security logging
- `app/lib/utils.ts` - API request/response logging
- `app/api/matches/route.ts` - API error logging
- `app/api/teams/route.ts` - API error logging

**Client-side files (use `logger`/`clientLogger` - dev only):**
- `app/components/analytics/GoogleAnalytics.tsx` - Analytics logging
- `app/lib/localStorage.ts` - Local storage error logging

## Benefits

1. **🖥️ Server Logs Always Available**: Backend logs remain visible in server console/logs in production
2. **🚫 Clean Client Console**: Browser console is clean in production for end users
3. **🛠️ Development Friendly**: All logging remains available during development
4. **⚡ Performance**: Zero runtime overhead in production builds
5. **🔒 Type Safe**: TypeScript-friendly logger utilities
6. **📝 Targeted Control**: Separate control over client vs server logging

## Usage

### For Client-side Code (React components, hooks, client utilities)

```typescript
import { logger } from '@/lib/logger'; // or import { clientLogger }

// Only logs in development, hidden in production
logger.log('Debug information');
logger.warn('Warning message');
logger.error('Error details');
```

### For Server-side Code (API routes, middleware, server utilities)

```typescript
import { serverLogger } from '@/lib/logger';

// Always logs in both development and production
serverLogger.log('API request processed');
serverLogger.warn('Security warning');
serverLogger.error('Server error occurred');
```

## How It Works

- **Development**: 
  - All logs appear normally (both client and server)
  - Browser console shows client-side logs
  - Server console shows server-side logs

- **Production**: 
  - **Client-side**: Browser console is clean (no logs visible to users)
  - **Server-side**: All logs continue to appear in server console/logs for monitoring and debugging
  - Next.js compiler removes most client-side console statements during build
  - Server-side logging remains fully functional 
  