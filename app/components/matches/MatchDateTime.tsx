import { Calendar, Clock } from 'lucide-react'

interface MatchDateTimeProps {
    dateTime: { date: string; time: string }
    endDateTime?: { date: string; time: string } | null
    countdown: string
    isLive: boolean
    isPast: boolean
    isMatchFinished?: boolean
}

export default function MatchDateTime({ dateTime, endDateTime, countdown, isLive, isPast, isMatchFinished }: MatchDateTimeProps) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mb-4">
            <div className="flex items-center text-gray-400 text-xs sm:text-sm bg-gray-900/30 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" size={16} />
                <span>{dateTime.date}</span>
            </div>
            <div className="flex items-center text-gray-400 text-xs sm:text-sm bg-gray-900/30 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 mr-2 text-gray-500" size={16} />
                <span>
                    {isMatchFinished && endDateTime ? (
                        `${dateTime.time} - ${endDateTime.time}`
                    ) : (
                        dateTime.time
                    )}
                </span>
            </div>
            {!isPast && countdown && (
                <div className={`flex items-center text-xs sm:text-sm px-3 py-1 rounded-full ${
                    isLive
                        ? 'bg-red-500/20 text-red-400 border border-red-500/20 animate-pulse'
                        : 'bg-green-500/20 text-green-400 border border-green-500/20'
                }`}>
                    <Clock className={`w-4 h-4 mr-2 ${isLive ? 'text-red-400' : 'text-green-400'}`} size={16} />
                    <span>{countdown}</span>
                </div>
            )}
        </div>
    )
} 
