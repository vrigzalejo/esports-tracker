# CORS Protection Setup

This document explains how to configure and use the CORS (Cross-Origin Resource Sharing) protection system to block direct API requests from unauthorized domains.

## 🛡️ What This Protects Against

- **Direct API access** from unauthorized domains
- **Cross-origin requests** from malicious websites
- **API scraping** from external services
- **Unauthorized data harvesting**

## 📁 Files Overview

### Core Files
- `middleware.ts` - Main CORS middleware that runs on every API request
- `app/config/cors.ts` - Centralized configuration for allowed domains
- `app/lib/apiSecurity.ts` - Additional security utilities (rate limiting, etc.)

## ⚙️ Configuration

### 1. Update Allowed Domains

Edit `app/config/cors.ts` and replace the placeholder domains with your actual domains:

```typescript
// Production domains - REPLACE THESE WITH YOUR ACTUAL DOMAINS
PRODUCTION_DOMAINS: [
  'https://your-actual-domain.com',
  'https://www.your-actual-domain.com',
  'https://esports-tracker.vercel.app', // Example for Vercel
],
```

### 2. Environment Variables (Optional)

You can also configure domains via environment variables:

```bash
# .env.local
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_WWW_URL=https://www.your-domain.com

# Optional: API keys for additional protection
VALID_API_KEYS=key1,key2,key3
```

### 3. Vercel Deployment

For Vercel deployments, the system automatically includes:
- `VERCEL_URL` environment variable
- Preview deployment URLs (in preview environment)

## 🔧 How It Works

### CORS Protection Flow

1. **Request arrives** at any `/api/*` endpoint
2. **Middleware checks** the `Origin` header
3. **If origin is allowed** → Request proceeds
4. **If origin is unauthorized** → Request blocked with 403 error
5. **Additional checks** for referer header and rate limiting

### Example Blocked Request

```javascript
// This request from unauthorized domain will be blocked
fetch('https://your-domain.com/api/matches', {
  headers: {
    'Origin': 'https://malicious-site.com'
  }
})
// Returns: 403 Forbidden with CORS_ERROR
```

### Example Allowed Request

```javascript
// This request from your own domain will succeed
fetch('https://your-domain.com/api/matches', {
  headers: {
    'Origin': 'https://your-domain.com'
  }
})
// Returns: API data with CORS headers
```

## 🚀 Testing

### Test CORS Protection

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test allowed origin** (should work):
   ```bash
   curl -H "Origin: http://localhost:3000" http://localhost:3000/api/matches
   ```

3. **Test blocked origin** (should return 403):
   ```bash
   curl -H "Origin: https://unauthorized-domain.com" http://localhost:3000/api/matches
   ```

### Development vs Production

- **Development**: Automatically allows all `localhost` and `127.0.0.1` origins
- **Production**: Only allows explicitly configured domains
- **Preview**: Allows Vercel preview URLs when `VERCEL_ENV=preview`

## 🔒 Additional Security Features

### Rate Limiting

The system includes basic rate limiting:
- **100 requests per 15 minutes** per IP address
- Automatically cleans up old entries
- For production, consider using Redis or a dedicated service

### API Key Protection (Optional)

You can add API key protection by:

1. **Set environment variable**:
   ```bash
   VALID_API_KEYS=your-secret-key-1,your-secret-key-2
   ```

2. **Include header in requests**:
   ```javascript
   fetch('/api/matches', {
     headers: {
       'X-API-Key': 'your-secret-key-1'
     }
   })
   ```

### Security Headers

All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📊 Monitoring

### Security Event Logging

The system logs security events to the console:

```
🚫 Blocked API request from unauthorized origin: https://malicious-site.com
🔒 [SECURITY] Rate limit exceeded: { ip: '192.168.1.1', requests: 101 }
```

### Production Monitoring

For production, consider:
- **Sending logs to monitoring service** (DataDog, New Relic, etc.)
- **Setting up alerts** for repeated violations
- **Using Redis** for distributed rate limiting

## 🛠️ Customization

### Adding New Allowed Domains

1. **Edit** `app/config/cors.ts`
2. **Add domain** to appropriate array:
   ```typescript
   PRODUCTION_DOMAINS: [
     'https://existing-domain.com',
     'https://new-domain.com', // Add here
   ],
   ```

### Adjusting Rate Limits

Edit `app/lib/apiSecurity.ts`:

```typescript
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // Time window
  maxRequests: 100,          // Max requests per window
  message: 'Custom rate limit message',
}
```

### Custom Security Rules

Add custom rules in `middleware.ts`:

```typescript
// Example: Block specific user agents
if (userAgent.includes('BadBot')) {
  return createSecurityErrorResponse('Bot blocked')
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"CORS_ERROR" in production**
   - Check that your domain is in `PRODUCTION_DOMAINS`
   - Verify the exact domain format (https vs http, www vs non-www)

2. **Requests blocked in development**
   - Ensure you're using `localhost:3000` or `127.0.0.1:3000`
   - Check browser dev tools for actual origin header

3. **Rate limiting too aggressive**
   - Adjust `RATE_LIMIT_CONFIG.maxRequests`
   - Consider implementing per-user limits instead of per-IP

### Debug Mode

Enable verbose logging by setting:
```bash
NODE_ENV=development
```

This will log all security checks and decisions.

## 📋 Checklist

Before deploying to production:

- [ ] Updated `PRODUCTION_DOMAINS` with actual domains
- [ ] Tested CORS protection with various origins
- [ ] Configured environment variables if needed
- [ ] Set up monitoring/alerting for security events
- [ ] Documented any custom security rules
- [ ] Tested rate limiting behavior

## 🔄 Updates

When adding new domains or changing security rules:

1. Update `app/config/cors.ts`
2. Test changes in development
3. Deploy and verify in production
4. Monitor logs for any issues

## 📚 Related Documentation

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Security Headers Best Practices](https://owasp.org/www-project-secure-headers/) 