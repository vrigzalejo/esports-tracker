'use client'

import React, { useState } from 'react'
import { useCacheStatus, useDataContext } from '@/contexts/DataContext'

export default function CacheStatus() {
  const [isVisible, setIsVisible] = useState(false)
  const stats = useCacheStatus()
  const { clearAllCache, clearExpiredCache } = useDataContext()

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors z-50"
        title="Show Cache Status"
      >
        Cache
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Cache Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>Total Entries:</div>
          <div className="font-mono">{stats.totalEntries}</div>
          
          <div>Games:</div>
          <div className="font-mono">{stats.gamesEntries}</div>
          
          <div>Matches:</div>
          <div className="font-mono">{stats.matchesEntries}</div>
          
          <div>Match Details:</div>
          <div className="font-mono">{stats.matchDetailsEntries}</div>
          
          <div>Tournaments:</div>
          <div className="font-mono">{stats.tournamentsEntries}</div>
          
          <div>Teams:</div>
          <div className="font-mono">{stats.teamsEntries}</div>
          
          <div>Expired:</div>
          <div className="font-mono text-red-400">{stats.expiredEntries}</div>
        </div>
        
        <div className="pt-2 border-t border-gray-600 space-y-1">
          <button
            onClick={clearExpiredCache}
            className="w-full bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs transition-colors"
          >
            Clear Expired
          </button>
          
          <button
            onClick={clearAllCache}
            className="w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-colors"
          >
            Clear All Cache
          </button>
        </div>
        
        <div className="text-xs text-gray-400 pt-1">
          Cache expires after 1 hour
        </div>
      </div>
    </div>
  )
} 
