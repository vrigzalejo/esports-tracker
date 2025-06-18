'use client'

import { useState, useEffect } from 'react'
import { Cookie, Shield, Check } from 'lucide-react'
import { getCookieConsent, setCookieConsent, getConsentDate, type CookieConsentStatus } from '@/lib/cookieConsent'

export default function CookieSettings() {
    const [currentConsent, setCurrentConsent] = useState<CookieConsentStatus>(null)
    const [consentDate, setConsentDate] = useState<Date | null>(null)
    const [isChanged, setIsChanged] = useState(false)

    useEffect(() => {
        const consent = getCookieConsent()
        const date = getConsentDate()
        setCurrentConsent(consent)
        setConsentDate(date)
    }, [])

    const handleConsentChange = (newConsent: CookieConsentStatus) => {
        if (newConsent !== currentConsent) {
            setCookieConsent(newConsent)
            setCurrentConsent(newConsent)
            setConsentDate(new Date())
            setIsChanged(true)
            
            // Reset the change indicator after 3 seconds
            setTimeout(() => setIsChanged(false), 3000)
            
            // Reload page if analytics consent changed to apply/remove tracking
            if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
                setTimeout(() => window.location.reload(), 1000)
            }
        }
    }

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
                <Cookie className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Cookie Preferences</h3>
                {isChanged && (
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                        <Check className="h-4 w-4" />
                        <span>Updated</span>
                    </div>
                )}
            </div>
            
            <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm text-gray-300">
                    <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p>
                        Manage your cookie preferences. These settings control whether we can use analytics cookies 
                        to understand how you use our esports tracker.
                    </p>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">Analytics Cookies</h4>
                            <p className="text-sm text-gray-400">
                                Help us understand site usage and improve your experience
                            </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                            <button
                                onClick={() => handleConsentChange('accepted')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors min-h-[36px] ${
                                    currentConsent === 'accepted'
                                        ? 'bg-green-600 text-white border-green-500'
                                        : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600 border-gray-500'
                                } border`}
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleConsentChange('declined')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors min-h-[36px] ${
                                    currentConsent === 'declined'
                                        ? 'bg-red-600 text-white border-red-500'
                                        : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600 border-gray-500'
                                } border`}
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">Essential Cookies</h4>
                            <p className="text-sm text-gray-400">
                                Required for the website to function properly (always enabled)
                            </p>
                        </div>
                        <div className="ml-4">
                            <div className="px-3 py-2 text-sm font-medium bg-gray-500 text-gray-300 rounded-md border border-gray-400 min-h-[36px] flex items-center">
                                Always On
                            </div>
                        </div>
                    </div>
                </div>
                
                {consentDate && (
                    <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-700/20 rounded border border-gray-600/30">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${
                                    currentConsent === 'accepted' ? 'bg-green-400' : 
                                    currentConsent === 'declined' ? 'bg-red-400' : 'bg-gray-400'
                                }`} />
                                <span>
                                    Current status: {
                                        currentConsent === 'accepted' ? 'Analytics Enabled' :
                                        currentConsent === 'declined' ? 'Analytics Disabled' : 'Not Set'
                                    }
                                </span>
                            </div>
                            <span className="text-gray-600">•</span>
                            <span>Last updated: {consentDate.toLocaleDateString()}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 
