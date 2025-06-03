import { UserCheck, Zap, Tv, Play, ExternalLink } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Match } from '@/types/esports'
import { getStatusColor, getStatusText } from '@/lib/utils'

interface MatchHeaderProps {
    match: Match
    gamesFormat: string | null
    videoStreams: { url: string; platform: string }[]
    onShowDetails: () => void
}

export default function MatchHeader({ match, gamesFormat, videoStreams, onShowDetails }: MatchHeaderProps) {
    const [showStreams, setShowStreams] = useState(false)
    const streamsRef = useRef<HTMLDivElement>(null)

    const handleStreamClick = (streamUrl: string, e: React.MouseEvent) => {
        e.preventDefault()
        window.open(streamUrl, '_blank', 'noopener,noreferrer')
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
        <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm rounded-full pl-1 pr-3 py-1 border border-gray-700/50">
                    {match.status === 'running' ? (
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse ml-2" />
                    ) : (
                        <div className={`w-2 h-2 rounded-full ml-2 ${getStatusColor(match.status)}`} />
                    )}
                    <span className="text-xs font-medium text-white">{getStatusText(match.status)}</span>
                </div>
                <span className="text-gray-400 text-xs sm:text-sm font-medium bg-gray-900/30 px-3 py-1 rounded-full">
                    {match.videogame.name}
                </span>
                {gamesFormat && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium border border-blue-500/20">
                        {gamesFormat}
                    </span>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                {/* Roster Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onShowDetails()
                    }}
                    className="group/roster relative overflow-hidden flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 text-xs rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
                >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover/roster:opacity-100 transition-opacity duration-300" />

                    {/* Lightning effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover/roster:translate-x-full transition-transform duration-700 ease-in-out" />

                    <UserCheck className="w-4 h-4 group-hover/roster:animate-pulse relative z-10" size={16} />
                    <span className="relative z-10 font-semibold">Rosters</span>
                    <Zap className="w-3 h-3 group-hover/roster:animate-bounce relative z-10" size={12} />
                </button>

                {/* Streams Button */}
                {videoStreams.length > 0 && (
                    <div className="relative" ref={streamsRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowStreams(!showStreams)
                            }}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/20 hover:border-purple-500/30 text-xs rounded-full font-medium transition-all duration-200 cursor-pointer group/stream whitespace-nowrap"
                        >
                            <Tv className="w-3 h-3 group-hover/stream:animate-pulse" size={12} />
                            <span>{videoStreams.length} Stream{videoStreams.length > 1 ? 's' : ''}</span>
                        </button>

                        {/* Video Streams Dropdown */}
                        {showStreams && (
                            <div className="absolute right-0 top-full mt-2 min-w-[200px] max-w-[300px] w-max bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl z-[9999] max-h-[300px] overflow-y-auto">
                                <div className="sticky top-0 p-3 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-white text-sm font-medium flex items-center whitespace-nowrap">
                                            <Tv className="w-4 h-4 mr-2 text-purple-400" size={16} />
                                            Available Streams
                                        </h4>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowStreams(false)
                                            }}
                                            className="text-gray-400 hover:text-gray-300 ml-3 cursor-pointer"
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
                                            className="flex items-center w-full px-4 py-3 hover:bg-gray-700/50 transition-colors duration-200 group/item cursor-pointer"
                                        >
                                            <div className="flex items-center min-w-0 flex-1">
                                                <div className="flex items-center space-x-2 text-purple-400">
                                                    <Play className="w-4 h-4 flex-shrink-0" size={16} />
                                                    {stream.platform === 'Twitch' && (
                                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                                                    )}
                                                </div>
                                                <span className="ml-3 text-gray-300 text-sm font-medium truncate">
                                                    {stream.platform}
                                                </span>
                                                <ExternalLink className="w-4 h-4 text-gray-500 ml-3 flex-shrink-0" size={16} />
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
