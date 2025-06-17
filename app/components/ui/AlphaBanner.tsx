'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function AlphaBanner() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-1 sm:py-1.5 flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mr-2 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-yellow-200 truncate">
                            <span className="font-semibold">Alpha Version:</span>
                            <span className="hidden sm:inline"> This website is in active development. Some features may be incomplete or change without notice.</span>
                            <span className="sm:hidden"> In development</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer ml-2 min-w-[36px] min-h-[36px] justify-center flex-shrink-0"
                        aria-label="Dismiss alpha notification"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>
            </div>
        </div>
    )
} 
