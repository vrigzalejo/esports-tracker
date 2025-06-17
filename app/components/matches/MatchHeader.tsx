import { UserCheck, Tv, Play, ExternalLink } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Match } from '@/types/esports'
import { getStatusColor, getStatusText } from '@/lib/utils'

interface MatchHeaderProps {
    match: Match
    videoStreams: { url: string; platform: string }[]
    streamsEnabled?: boolean
    streamsDisabledReason?: string | null
    onShowDetails: () => void
    detailsDisabled?: boolean
}

export default function MatchHeader({ 
    match, 
    videoStreams, 
    streamsEnabled = true,
    streamsDisabledReason,
    onShowDetails,
    detailsDisabled = false
}: MatchHeaderProps) {
    const [showStreams, setShowStreams] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const streamsRef = useRef<HTMLDivElement>(null)

    const handleStreamClick = (streamUrl: string, e: React.MouseEvent) => {
        e.preventDefault()
        if (streamsEnabled) {
            window.open(streamUrl, '_blank', 'noopener,noreferrer')
        }
    }

    // Handle click outside to close streams dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (streamsRef.current && !streamsRef.current.contains(event.target as Node)) {
                setShowStreams(false)
            }
        }

        if (showStreams) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showStreams])

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
                {/* Status Badge */}
                <div className="flex items-center space-x-2 bg-gray-800/60 rounded-lg px-3 py-1.5 border border-gray-700/40">
                    {match.status === 'running' ? (
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                    ) : (
                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(match.status)}`} />
                    )}
                    <span className="text-xs font-medium text-gray-200">{getStatusText(match.status)}</span>
                </div>
                
                {/* Game Badge */}
                <span className="text-gray-400 text-xs font-medium bg-gray-800/40 px-3 py-1.5 rounded-lg border border-gray-700/30">
                    {match.videogame.name}
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                {/* Details Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        if (!detailsDisabled) {
                            onShowDetails()
                        }
                    }}
                    disabled={detailsDisabled}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors duration-200 ${
                        detailsDisabled
                            ? 'bg-gray-700/30 text-gray-500 border border-gray-700/30 cursor-not-allowed'
                            : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-400/40 cursor-pointer'
                    }`}
                >
                    <UserCheck className="w-3 h-3" />
                    <span className="hidden sm:inline">Details</span>
                </button>

                {/* Streams Button */}
                {videoStreams.length > 0 && (
                    <div className="relative" ref={streamsRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (streamsEnabled) {
                                    setShowStreams(!showStreams)
                                }
                            }}
                            onMouseEnter={() => {
                                if (!streamsEnabled && streamsDisabledReason) {
                                    setShowTooltip(true)
                                }
                            }}
                            onMouseLeave={() => setShowTooltip(false)}
                            disabled={!streamsEnabled}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors duration-200 ${
                                streamsEnabled
                                    ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 hover:border-purple-400/40 cursor-pointer'
                                    : 'bg-gray-700/30 text-gray-500 border border-gray-700/30 cursor-not-allowed'
                            }`}
                        >
                            <Tv className="w-3 h-3" />
                            <span>{videoStreams.length}</span>
                        </button>

                        {/* Tooltip for disabled streams */}
                        {showTooltip && !streamsEnabled && streamsDisabledReason && (
                            <div className="absolute right-0 top-full mt-2 min-w-[200px] max-w-[300px] w-max bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-600 shadow-xl z-[200] p-3">
                                <div className="text-gray-300 text-xs text-center">
                                    {streamsDisabledReason}
                                </div>
                            </div>
                        )}

                        {/* Video Streams Dropdown */}
                        {showStreams && streamsEnabled && (
                            <div className="absolute right-0 top-full mt-2 min-w-[200px] max-w-[300px] w-max bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl z-[200] max-h-[300px] overflow-y-auto">
                                <div className="sticky top-0 p-3 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-white text-sm font-medium flex items-center">
                                            <Tv className="w-4 h-4 mr-2 text-purple-400" />
                                            Streams
                                        </h4>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowStreams(false)
                                            }}
                                            className="text-gray-400 hover:text-gray-300 cursor-pointer"
                                            aria-label="Close streams menu"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-y-auto">
                                    {videoStreams.map((stream, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => handleStreamClick(stream.url, e)}
                                            className="flex items-center w-full px-4 py-3 hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                                        >
                                            <div className="flex items-center min-w-0 flex-1">
                                                <div className="flex items-center space-x-2 text-purple-400">
                                                    <Play className="w-4 h-4 flex-shrink-0" />
                                                    {stream.platform === 'Twitch' && (
                                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                                                    )}
                                                </div>
                                                <span className="ml-3 text-gray-300 text-sm font-medium truncate">
                                                    {stream.platform}
                                                </span>
                                                <ExternalLink className="w-4 h-4 text-gray-500 ml-3 flex-shrink-0" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
} 
