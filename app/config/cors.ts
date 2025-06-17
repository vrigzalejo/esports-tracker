/**
 * CORS Configuration for API Protection
 * 
 * This file centralizes all CORS settings and allowed origins.
 * Update the PRODUCTION_DOMAINS array with your actual domain(s).
 */

export const CORS_CONFIG = {
  // Development domains (automatically included in dev mode)
  DEVELOPMENT_DOMAINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ],

  // Production domains - REPLACE THESE WITH YOUR ACTUAL DOMAINS
  PRODUCTION_DOMAINS: [
    'https://your-domain.com',
    'https://www.your-domain.com',
    // Add your actual production domains here
    'https://esports-tracker-three.vercel.app',
    // 'https://esports-tracker-production.vercel.app',
  ],

  // Staging/preview domains (optional)
  STAGING_DOMAINS: [
    // Add staging domains here if needed
    // 'https://staging.your-domain.com',
    // 'https://preview-*.vercel.app',
  ],

  // Headers configuration
  ALLOWED_METHODS: 'GET, POST, PUT, DELETE, OPTIONS',
  ALLOWED_HEADERS: 'Content-Type, Authorization, X-Requested-With, X-API-Key',
  MAX_AGE: '86400', // 24 hours for preflight cache
} as const

/**
 * Get allowed origins based on current environment
 */
export function getAllowedOrigins(): string[] {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const origins: string[] = []
  
  if (isDevelopment) {
    origins.push(...CORS_CONFIG.DEVELOPMENT_DOMAINS)
  }
  
  // Always include production domains
  origins.push(...CORS_CONFIG.PRODUCTION_DOMAINS)
  
  // Include staging domains if specified
  if (process.env.VERCEL_ENV === 'preview') {
    origins.push(...CORS_CONFIG.STAGING_DOMAINS)
  }
  
  // Add environment variables if they exist
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL)
  }
  
  if (process.env.NEXT_PUBLIC_WWW_URL) {
    origins.push(process.env.NEXT_PUBLIC_WWW_URL)
  }
  
  // For Vercel deployments
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`)
  }
  
  // Remove duplicates and empty values
  return [...new Set(origins.filter(Boolean))]
}

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string): boolean {
  const allowedOrigins = getAllowedOrigins()
  
  return allowedOrigins.some(allowedOrigin => {
    // Exact match
    if (origin === allowedOrigin) return true
    
    // For development, allow any localhost/127.0.0.1 with any port
    if (process.env.NODE_ENV === 'development') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return true
      }
    }
    
    // For preview deployments, allow Vercel preview URLs
    if (process.env.VERCEL_ENV === 'preview') {
      if (origin.includes('vercel.app') && origin.startsWith('https://')) {
        return true
      }
    }
    
    return false
  })
}

/**
 * Security headers to add to all API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'off',
} as const 
