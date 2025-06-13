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
        <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center text-gray-400 text-xs bg-gray-800/40 px-3 py-1.5 rounded-lg border border-gray-700/30">
                <Calendar className="w-3 h-3 mr-2" />
                <span>{dateTime.date}</span>
            </div>
            <div className="flex items-center text-gray-400 text-xs bg-gray-800/40 px-3 py-1.5 rounded-lg border border-gray-700/30">
                <Clock className="w-3 h-3 mr-2" />
                <span>
                    {isMatchFinished && endDateTime ? (
                        `${dateTime.time} - ${endDateTime.time}`
                    ) : (
                        dateTime.time
                    )}
                </span>
            </div>
            {!isPast && countdown && !isLive && (
                <div className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                    <Clock className="w-3 h-3 mr-2" />
                    <span>{countdown}</span>
                </div>
            )}
        </div>
    )
} 
