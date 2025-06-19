'use client'

/**
 * Global fetch interceptor to detect SECURITY_ERROR responses
 */

// Global reference to security alert function
let globalSecurityAlert: ((message: string, resetTime?: number) => void) | null = null
let isInterceptorInitialized = false

export function setGlobalSecurityHandler(handler: (message: string, resetTime?: number) => void) {
  globalSecurityAlert = handler
}

// Export a function to initialize the interceptor
export function initializeFetchInterceptor() {
  // Only initialize on client side and only once
  if (typeof window === 'undefined' || isInterceptorInitialized) {
    return
  }

  // Store the original fetch function
  const originalFetch = window.fetch

  // Override the global fetch function
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const response = await originalFetch(input, init)
      
      // Check if this is an API call to our own backend
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const isOwnAPI = url.includes('/api/') && (url.startsWith('/') || url.includes(window.location.origin))
      
      if (isOwnAPI && !response.ok && response.status === 403) {
        try {
          // Clone the response so we can read it without consuming the original
          const clonedResponse = response.clone()
          const errorBody = await clonedResponse.json()
          
          if (errorBody?.error === 'SECURITY_ERROR' && globalSecurityAlert) {
            const message = errorBody.message || 'A security issue was detected with your request'
            const resetTime = errorBody.resetTime ? Number(errorBody.resetTime) : undefined
            globalSecurityAlert(message, resetTime)
          }
        } catch {
          // Ignore JSON parse errors - response might not be JSON
        }
      }
      
      return response
    } catch (error) {
      // Re-throw the original error
      throw error
    }
  }

  isInterceptorInitialized = true
  console.log('🔒 [Security] Global fetch interceptor initialized')
} 
