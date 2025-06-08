'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function AlphaBanner() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                        <p className="text-sm text-yellow-200">
                            <span className="font-semibold">Alpha Version:</span>
                            {' '}This website is in active development. Some features may be incomplete or change without notice.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
                        aria-label="Dismiss alpha notification"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    )
} 
