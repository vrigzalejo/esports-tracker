import { NextRequest, NextResponse } from 'next/server'
import { isOriginAllowed, CORS_CONFIG, SECURITY_HEADERS } from './app/config/cors'

export function middleware(request: NextRequest) {
  // Only apply CORS protection to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    // Check if request has an origin (CORS request)
    if (origin) {
      if (!isOriginAllowed(origin)) {
        console.warn(`🚫 Blocked API request from unauthorized origin: ${origin}`)
        return new NextResponse(
          JSON.stringify({ 
            error: 'CORS_ERROR',
            message: 'Cross-origin requests not allowed from this domain' 
          }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }
    
    // Check referer as additional protection (for direct requests)
    if (!origin && referer) {
      const refererUrl = new URL(referer)
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`
      
      if (!isOriginAllowed(refererOrigin)) {
        console.warn(`🚫 Blocked API request from unauthorized referer: ${refererOrigin}`)
        return new NextResponse(
          JSON.stringify({ 
            error: 'UNAUTHORIZED_REFERER',
            message: 'Requests from this domain are not allowed' 
          }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }
    
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin && isOriginAllowed(origin) ? origin : 'null',
          'Access-Control-Allow-Methods': CORS_CONFIG.ALLOWED_METHODS,
          'Access-Control-Allow-Headers': CORS_CONFIG.ALLOWED_HEADERS,
          'Access-Control-Max-Age': CORS_CONFIG.MAX_AGE,
        },
      })
    }
    
    // Add CORS headers for allowed origins
    const response = NextResponse.next()
    
    if (origin && isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', CORS_CONFIG.ALLOWED_METHODS)
      response.headers.set('Access-Control-Allow-Headers', CORS_CONFIG.ALLOWED_HEADERS)
    }
    
    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
  
  // For non-API routes, just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // Optionally apply to specific paths that need protection
    // '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
} 
