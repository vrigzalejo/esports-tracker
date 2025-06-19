'use client'

import { useState, useEffect } from 'react'
import { Shield, X, AlertTriangle, Clock } from 'lucide-react'

interface SecurityNotificationProps {
  message?: string
  resetTime?: number
  onClose?: () => void
}

export default function SecurityNotification({ message, resetTime, onClose }: SecurityNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      // Small delay for animation
      setTimeout(() => setIsAnimating(true), 100)
    }
  }, [message])

  // Countdown timer effect
  useEffect(() => {
    if (!resetTime) return

    const updateTimer = () => {
      const now = Date.now()
      const remaining = resetTime - now

      if (remaining <= 0) {
        setTimeLeft('')
        // Auto-close when timer expires
        handleClose()
        return
      }

      const minutes = Math.floor(remaining / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [resetTime])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!isVisible || !message) return null

  return (
    <div 
      className={`bg-gradient-to-r from-red-600/95 to-orange-600/95 border-b border-red-500/30 transition-all duration-300 ${
        isAnimating ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-1 sm:py-1.5 flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-200 flex-shrink-0" />
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 flex-shrink-0" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-red-100 truncate">
                <span className="font-semibold">Security Alert:</span>
                <span className="hidden sm:inline"> {message}</span>
                <span className="sm:hidden"> Security issue detected</span>
                {timeLeft && (
                  <span className="ml-2 inline-flex items-center gap-1 text-yellow-300">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono text-xs">{timeLeft}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center text-red-200 hover:text-white transition-colors cursor-pointer ml-2 min-w-[36px] min-h-[36px] justify-center flex-shrink-0"
            aria-label="Dismiss security notification"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 
