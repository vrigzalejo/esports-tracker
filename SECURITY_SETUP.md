# Security and Analytics Configuration

## Overview

This document explains the security and analytics features implemented in the Esports Tracker application.

## Analytics Configuration

### Development vs Production

The Google Analytics implementation now behaves differently based on the environment:

- **Development Mode**: Only console logs are shown, no actual GA requests are made
- **Production Mode**: Full Google Analytics tracking is enabled

### Console Logs in Development

When `NODE_ENV=development`, you'll see console logs like:
```
📊 [Analytics] Development mode - Google Analytics scripts disabled
📊 [Analytics] Page view: { measurementId: 'G-...', page_path: '/teams', timestamp: '...' }
📊 [Analytics] Event: { action: 'view_team', category: 'engagement', label: '...', timestamp: '...' }
```

## API Security

### Origin Header Validation

All API routes now validate the `Origin` header to prevent unauthorized access:

- **Development**: Requests without origin headers are allowed (for testing with tools like Postman)
- **Production**: Origin header is required and must match allowed origins

### Allowed Origins

Configure allowed origins via the `ALLOWED_ORIGINS` environment variable:

```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com,https://*.vercel.app
```

Default allowed origins:
- `http://localhost:3000` (development)
- `https://esports-tracker-three.vercel.app` (production)
- `https://*.vercel.app` (Vercel preview deployments)

### Security Features

The API security system includes:

1. **Origin Header Validation**: Blocks requests from unauthorized domains
2. **Rate Limiting**: Prevents abuse (100 requests per 15 minutes per IP)
3. **API Key Validation**: Optional additional security layer
4. **Suspicious Activity Detection**: Logs potential bot/scraper activity

### Security Logs

Security events are logged to the console **only in development mode** with the format:
```
🔒 [SECURITY] ORIGIN_VALIDATION_FAILED { timestamp: '...', origin: '...', error: '...' }
🔒 [SECURITY] RATE_LIMIT_EXCEEDED { timestamp: '...', ip: '...', error: '...' }
```

In production, security events are not logged to the browser console for security reasons. You can implement custom logging to external services if needed.

### Error Responses

Blocked requests receive a standardized error response:
```json
{
  "error": "SECURITY_ERROR",
  "message": "Origin header is required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Environment Variables

Add these to your `.env.local` file:

```env
# Required
PANDASCORE_API_KEY=your_pandascore_api_key
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional Security Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
VALID_API_KEYS=optional_key1,optional_key2

# Development
NODE_ENV=development
```

## Testing

### Development Testing

1. Start the development server: `npm run dev`
2. Check browser console for analytics logs
3. API requests from the same origin will work normally

### Production Testing

1. Deploy to production
2. Test API access from unauthorized domains (should be blocked)
3. Verify Google Analytics is working in production

### Manual API Testing

In development, you can test APIs with tools like:
- Postman (will work without origin header)
- curl (will work without origin header)
- Browser fetch from different domains (will be blocked in production)

## Security Best Practices

1. **Always set ALLOWED_ORIGINS** in production
2. **Monitor security logs** for suspicious activity
3. **Use HTTPS** in production
4. **Consider additional API keys** for sensitive endpoints
5. **Regularly review rate limiting settings**

## Troubleshooting

### Common Issues

1. **"Origin header is required"**: Add your domain to ALLOWED_ORIGINS
2. **"Rate limit exceeded"**: Wait 15 minutes or increase limits
3. **Analytics not working**: Check NODE_ENV and GA_MEASUREMENT_ID
4. **CORS errors**: Verify origin configuration

### Debug Mode

Enable debug logging by checking the browser console in development mode. 
