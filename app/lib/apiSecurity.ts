/**
 * API Security Utilities
 * 
 * Additional security features for API protection beyond CORS
 */

import { NextRequest } from 'next/server'
import { serverLogger } from './logger'

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 3 * 60 * 1000, // 3 minutes
  maxRequests: 100, // Maximum requests per window (reduced for testing)
  message: 'Too many requests from this IP, please try again later after',
} as const

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Validate Origin header to prevent unauthorized API access
 */
export function validateOriginHeader(request: NextRequest): { valid: boolean; error?: string } {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Allow requests with no origin for non-browser clients (like Postman, curl, etc.)
  // But only in development mode
  if (!origin && !referer) {
    if (process.env.NODE_ENV === 'development') {
      serverLogger.log('🔒 [Security] No origin header - allowing in development mode')
      return { valid: true }
    }
    
    return {
      valid: false,
      error: 'Origin header is required'
    }
  }
  
  // Get allowed origins from environment or use defaults
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://esports-tracker-three.vercel.app',
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ]
  
  // Check origin against allowed list
  if (origin) {
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard domains
        const pattern = allowedOrigin.replace('*', '.*')
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(origin)
      }
      return origin === allowedOrigin
    })
    
    if (!isAllowed) {
      return {
        valid: false,
        error: `Origin '${origin}' is not allowed`
      }
    }
  }
  
  // If we have referer but no origin, validate referer
  if (!origin && referer) {
    const refererUrl = new URL(referer)
    const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*')
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(refererOrigin)
      }
      return refererOrigin === allowedOrigin
    })
    
    if (!isAllowed) {
      return {
        valid: false,
        error: `Referer origin '${refererOrigin}' is not allowed`
      }
    }
  }
  
  return { valid: true }
}

/**
 * Simple rate limiting implementation
 * For production, consider using a proper rate limiting service or Redis
 */
export function checkRateLimit(request: NextRequest): { allowed: boolean; error?: string; resetTime?: number } {
  const ip = getClientIP(request)
  const now = Date.now()
  
  // Clean up old entries
  for (const [key, value] of rateLimitStore) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
  
  const current = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_CONFIG.windowMs }
  
  if (current.resetTime < now) {
    // Reset window
    current.count = 1
    current.resetTime = now + RATE_LIMIT_CONFIG.windowMs
  } else {
    current.count++
  }
  
  rateLimitStore.set(ip, current)
  
  if (current.count > RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      error: RATE_LIMIT_CONFIG.message,
      resetTime: current.resetTime
    }
  }
  
  return { allowed: true }
}

/**
 * Extract client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for real IP (useful behind proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback - NextRequest doesn't have ip property in some versions
  return 'unknown'
}

/**
 * Validate API key if provided in headers
 * This is optional and can be used for additional protection
 */
export function validateApiKey(request: NextRequest): { valid: boolean; error?: string } {
  const apiKey = request.headers.get('x-api-key')
  
  // If no API key is provided, allow (CORS is the primary protection)
  if (!apiKey) {
    return { valid: true }
  }
  
  // If API key is provided, validate it
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || []
  
  if (validApiKeys.length === 0) {
    // No API keys configured, so ignore the header
    return { valid: true }
  }
  
  if (!validApiKeys.includes(apiKey)) {
    return {
      valid: false,
      error: 'Invalid API key provided'
    }
  }
  
  return { valid: true }
}

/**
 * Check if request looks suspicious (basic heuristics)
 */
export function detectSuspiciousActivity(request: NextRequest): { suspicious: boolean; reason?: string } {
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  
  // Check for common bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /axios/i // Be careful with this one as legitimate clients use axios
  ]
  
  // Allow common legitimate user agents
  const legitimatePatterns = [
    /mozilla/i,
    /chrome/i,
    /safari/i,
    /firefox/i,
    /edge/i,
    /opera/i
  ]
  
  const isSuspiciousUserAgent = botPatterns.some(pattern => pattern.test(userAgent)) &&
                                !legitimatePatterns.some(pattern => pattern.test(userAgent))
  
  if (isSuspiciousUserAgent) {
    return {
      suspicious: true,
      reason: 'Suspicious user agent detected'
    }
  }
  
  // Check for missing or suspicious referer for browser requests
  if (userAgent.includes('Mozilla') && !referer && request.method === 'GET') {
    return {
      suspicious: true,
      reason: 'Browser request missing referer header'
    }
  }
  
  return { suspicious: false }
}

/**
 * Comprehensive security check that combines all validations
 */
export function performSecurityCheck(request: NextRequest): { 
  allowed: boolean; 
  error?: string; 
  details?: Record<string, unknown>;
  resetTime?: number;
} {
  // 1. Validate origin header
  const originCheck = validateOriginHeader(request)
  if (!originCheck.valid) {
    logSecurityEvent('ORIGIN_VALIDATION_FAILED', {
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
      url: request.url,
      error: originCheck.error
    })
    return {
      allowed: false,
      error: originCheck.error,
      details: { check: 'origin_validation' }
    }
  }
  
  // 2. Check rate limiting
  const rateLimitCheck = checkRateLimit(request)
  if (!rateLimitCheck.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip: getClientIP(request),
      url: request.url,
      error: rateLimitCheck.error,
      resetTime: rateLimitCheck.resetTime
    })
    return {
      allowed: false,
      error: rateLimitCheck.error,
      details: { check: 'rate_limit' },
      resetTime: rateLimitCheck.resetTime
    }
  }
  
  // 3. Validate API key if provided
  const apiKeyCheck = validateApiKey(request)
  if (!apiKeyCheck.valid) {
    logSecurityEvent('API_KEY_VALIDATION_FAILED', {
      ip: getClientIP(request),
      url: request.url,
      error: apiKeyCheck.error
    })
    return {
      allowed: false,
      error: apiKeyCheck.error,
      details: { check: 'api_key_validation' }
    }
  }
  
  // 4. Check for suspicious activity
  const suspiciousCheck = detectSuspiciousActivity(request)
  if (suspiciousCheck.suspicious) {
    logSecurityEvent('SUSPICIOUS_ACTIVITY_DETECTED', {
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      url: request.url,
      reason: suspiciousCheck.reason
    })
    // Log but don't block for suspicious activity (adjust as needed)
  }
  
  return { allowed: true }
}

/**
 * Log security events for monitoring
 */
export function logSecurityEvent(event: string, details: Record<string, unknown>): void {
  // Only log security events in development mode
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString()
    serverLogger.warn(`🔒 [SECURITY] ${event}`, {
      timestamp,
      ...details
    })
  }
  
  // In production, you might want to send this to a logging service
  // or security monitoring system instead of console logging
  // Example: sendToLoggingService(event, details)
}

/**
 * Generate a standardized error response for security violations
 */
export function createSecurityErrorResponse(error: string, status: number = 403, resetTime?: number): Response {
  const responseBody: Record<string, unknown> = {
    error: 'SECURITY_ERROR',
    message: error,
    timestamp: new Date().toISOString()
  }
  
  if (resetTime) {
    responseBody.resetTime = resetTime
  }
  
  return new Response(
    JSON.stringify(responseBody),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  )
} 
