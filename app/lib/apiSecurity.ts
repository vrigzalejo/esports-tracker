/**
 * API Security Utilities
 * 
 * Additional security features for API protection beyond CORS
 */

import { NextRequest } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Maximum requests per window
  message: 'Too many requests from this IP, please try again later.',
} as const

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Simple rate limiting implementation
 * For production, consider using a proper rate limiting service or Redis
 */
export function checkRateLimit(request: NextRequest): { allowed: boolean; error?: string } {
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
      error: RATE_LIMIT_CONFIG.message
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
 * Log security events for monitoring
 */
export function logSecurityEvent(event: string, details: Record<string, unknown>): void {
  const timestamp = new Date().toISOString()
  console.warn(`🔒 [SECURITY] ${event}`, {
    timestamp,
    ...details
  })
  
  // In production, you might want to send this to a logging service
  // or security monitoring system
}

/**
 * Generate a standardized error response for security violations
 */
export function createSecurityErrorResponse(error: string, status: number = 403): Response {
  return new Response(
    JSON.stringify({
      error: 'SECURITY_ERROR',
      message: error,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  )
} 
