'use client'

import { useState, useEffect } from 'react'
import { Database, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface CacheStatus {
  redis: {
    connected: boolean
    attempted: boolean
    available: boolean
  }
  timestamp: string
}

export default function RedisCacheStatus() {
  const [status, setStatus] = useState<CacheStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/cache')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cache status')
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async (type: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/cache?type=${type}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Cache cleared:', data.message)
      
      // Refresh status after clearing
      await fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const getStatusIcon = () => {
    if (!status) return <AlertCircle className="w-4 h-4 text-gray-400" />
    
    if (status.redis.connected) {
      return <CheckCircle className="w-4 h-4 text-green-400" />
    } else if (status.redis.attempted) {
      return <XCircle className="w-4 h-4 text-red-400" />
    } else {
      return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusText = () => {
    if (!status) return 'Unknown'
    
    if (status.redis.connected) {
      return 'Connected'
    } else if (status.redis.attempted) {
      return 'Failed'
    } else {
      return 'Not configured'
    }
  }

  const getStatusColor = () => {
    if (!status) return 'text-gray-400'
    
    if (status.redis.connected) {
      return 'text-green-400'
    } else if (status.redis.attempted) {
      return 'text-red-400'
    } else {
      return 'text-yellow-400'
    }
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-blue-400" />
        <span className="font-bold">Redis Cache</span>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="ml-auto p-1 hover:bg-gray-700 rounded transition-colors"
          title="Refresh status"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span>Status: <span className={getStatusColor()}>{getStatusText()}</span></span>
        </div>

        {error && (
          <div className="text-red-400 text-xs">
            Error: {error}
          </div>
        )}

        <div className="mt-3 pt-2 border-t border-gray-700">
          <div className="text-gray-400 mb-2">Cache Status (Only Games cached):</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => clearCache('games')}
              disabled={loading}
              className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded text-xs transition-colors flex items-center gap-1"
              title="Clear games cache (ACTIVE)"
            >
              <Trash2 className="w-3 h-3" />
              Games ✓
            </button>
            <button
              onClick={() => clearCache('matches')}
              disabled={loading}
              className="px-2 py-1 bg-gray-600/20 text-gray-500 rounded text-xs transition-colors flex items-center gap-1 cursor-not-allowed"
              title="Matches caching disabled"
            >
              <XCircle className="w-3 h-3" />
              Matches
            </button>
            <button
              onClick={() => clearCache('tournaments')}
              disabled={loading}
              className="px-2 py-1 bg-gray-600/20 text-gray-500 rounded text-xs transition-colors flex items-center gap-1 cursor-not-allowed"
              title="Tournaments caching disabled"
            >
              <XCircle className="w-3 h-3" />
              Tournaments
            </button>
            <button
              onClick={() => clearCache('teams')}
              disabled={loading}
              className="px-2 py-1 bg-gray-600/20 text-gray-500 rounded text-xs transition-colors flex items-center gap-1 cursor-not-allowed"
              title="Teams caching disabled"
            >
              <XCircle className="w-3 h-3" />
              Teams
            </button>
            <button
              onClick={() => clearCache('players')}
              disabled={loading}
              className="px-2 py-1 bg-gray-600/20 text-gray-500 rounded text-xs transition-colors flex items-center gap-1 cursor-not-allowed"
              title="Players caching disabled"
            >
              <XCircle className="w-3 h-3" />
              Players
            </button>
            <button
              onClick={() => clearCache('home')}
              disabled={loading}
              className="px-2 py-1 bg-gray-600/20 text-gray-500 rounded text-xs transition-colors flex items-center gap-1 cursor-not-allowed"
              title="Home caching disabled"
            >
              <XCircle className="w-3 h-3" />
              Home
            </button>
            <button
              onClick={() => clearCache('all')}
              disabled={loading}
              className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded text-xs transition-colors flex items-center gap-1"
              title="Clear all cache (only games)"
            >
              <Trash2 className="w-3 h-3" />
              All
            </button>
          </div>
        </div>

        {status && (
          <div className="text-gray-500 text-xs mt-2">
            Last updated: {new Date(status.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
} 
