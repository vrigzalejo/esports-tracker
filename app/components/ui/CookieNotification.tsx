'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, Shield } from 'lucide-react'
import { hasConsentDecision, setCookieConsent } from '@/lib/cookieConsent'

export default function CookieNotification() {
    const [isVisible, setIsVisible] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        // Check if user has already made a consent decision
        if (!hasConsentDecision()) {
            // Small delay to ensure page is loaded
            setTimeout(() => {
                setIsVisible(true)
                setIsAnimating(true)
            }, 1000)
        }
    }, [])

    const handleAccept = () => {
        setCookieConsent('accepted')
        setIsAnimating(false)
        setTimeout(() => setIsVisible(false), 300)
        
        // Reload page to initialize analytics if needed
        if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
            window.location.reload()
        }
    }

    const handleDecline = () => {
        setCookieConsent('declined')
        setIsAnimating(false)
        setTimeout(() => setIsVisible(false), 300)
    }

    if (!isVisible) return null

    return (
        <div 
            className={`fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900/95 to-purple-900/95 backdrop-blur-sm border-t border-blue-500/20 shadow-2xl transition-all duration-300 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        {/* Icon and message */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm sm:text-base text-white leading-relaxed">
                                    <span className="font-semibold">We use cookies</span> to enhance your experience and analyze site usage. 
                                    <span className="hidden sm:inline"> This helps us improve our esports tracking features and provide better analytics.</span>
                                </p>
                                <p className="text-xs sm:text-sm text-blue-200 mt-1">
                                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                                    Your privacy is important to us. No personal data is collected.{' '}
                                    <a 
                                        href="/privacy" 
                                        className="text-blue-300 hover:text-blue-200 underline"
                                    >
                                        Learn more
                                    </a>
                                </p>
                            </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleDecline}
                                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors duration-200 border border-gray-600/50 hover:border-gray-500/50 min-h-[44px] flex items-center justify-center"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-blue-500/25 min-h-[44px] flex items-center justify-center"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={handleDecline}
                                className="text-gray-400 hover:text-gray-300 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 sm:hidden"
                                aria-label="Close cookie notification"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 
