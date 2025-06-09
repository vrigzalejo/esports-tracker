import { useState, useRef, useEffect } from 'react'
import type { Match } from '@/types/esports'
import { parseLeagueInfo } from '@/lib/textUtils'

interface MatchResults {
    team1Score: number
    team2Score: number
    winnerIndex: number
    isDraw: boolean
    isLive: boolean
}

export function useMatchData(match: Match) {
    const [countdown, setCountdown] = useState('')
    const [isLive, setIsLive] = useState(false)
    const [isPast, setIsPast] = useState(false)
    const countdownInterval = useRef<NodeJS.Timeout | undefined>(undefined)

    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Calculate countdown
    const calculateCountdown = (matchData: Match) => {
        const now = new Date()
        const matchDate = new Date(matchData.scheduled_at || matchData.begin_at)
        const diff = matchDate.getTime() - now.getTime()

        // Check if match is in the past
        if (diff < 0) {
            if (matchData.status === 'running') {
                setIsLive(true)
                setIsPast(false)
                setCountdown('LIVE')
            } else {
                setIsLive(false)
                setIsPast(true)
                setCountdown('Completed')
            }
            return
        }

        setIsLive(false)
        setIsPast(false)

        // Calculate time units
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        // Format countdown string
        if (days > 0) {
            setCountdown(`${days}d ${hours}h ${minutes}m`)
        } else if (hours > 0) {
            setCountdown(`${hours}h ${minutes}m ${seconds}s`)
        } else {
            setCountdown(`${minutes}m ${seconds}s`)
        }
    }

    // Set up countdown timer
    useEffect(() => {
        calculateCountdown(match)
        countdownInterval.current = setInterval(() => calculateCountdown(match), 1000)

        return () => {
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current)
            }
        }
    }, [match])

    // Format date and time in user's current timezone
    const formatDateTime = (dateString: string) => {
        if (!dateString) return { date: 'TBD', time: 'TBD' }

        // Always use user's current timezone
        const date = new Date(dateString)
        const dateOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: userTimezone
        }
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: userTimezone,
            timeZoneName: 'short'
        }

        const formattedDate = date.toLocaleDateString('en-US', dateOptions)
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions)

        return { date: formattedDate, time: formattedTime }
    }

    // Get tournament stage information
    const getTournamentStage = () => {
        const stageName = match.tournament?.name || match.serie?.name || match.league?.name

        if (!stageName) return null

        const stageMap: { [key: string]: string } = {
            'group': 'Group Stage',
            'groups': 'Group Stage',
            'group_stage': 'Group Stage',
            'swiss': 'Swiss Stage',
            'swiss_stage': 'Swiss Stage',
            'playoff': 'Playoffs',
            'playoffs': 'Playoffs',
            'elimination': 'Playoffs',
            'bracket': 'Playoffs',
            'final': 'Finals',
            'finals': 'Finals',
            'semifinal': 'Semifinals',
            'semifinals': 'Semifinals',
            'quarterfinal': 'Quarterfinals',
            'quarterfinals': 'Quarterfinals'
        }

        const normalizedStage = stageName.toLowerCase().replace(/[-_\s]/g, '')
        return stageMap[normalizedStage] || stageName
    }

    // Get tournament stage color based on stage type
    const getStageColor = (stage: string | null) => {
        if (!stage) return 'text-purple-400'

        const lowerStage = stage.toLowerCase()
        if (lowerStage.includes('group')) return 'text-blue-400'
        if (lowerStage.includes('swiss')) return 'text-green-400'
        if (lowerStage.includes('playoff')) return 'text-orange-400'
        if (lowerStage.includes('final')) return 'text-red-400'

        return 'text-purple-400'
    }

    // Get number of games format
    const getGamesFormat = () => {
        if (match.number_of_games) {
            const games = match.number_of_games
            if (games === 1) return 'BO1'
            if (games === 3) return 'BO3'
            if (games === 5) return 'BO5'
            if (games === 7) return 'BO7'
            return `BO${games}`
        }
        return null
    }

    // Get league tier information
    const getLeagueTier = () => {
        const tier = match.tournament?.tier || match.league?.tier || match.serie?.tier

        if (!tier) return null

        const tierMap: { [key: string]: string } = {
            's': 'S-Tier',
            'a': 'A-Tier',
            'b': 'B-Tier',
            'c': 'C-Tier',
            'd': 'D-Tier',
            'tier_1': 'Tier 1',
            'tier_2': 'Tier 2',
            'tier_3': 'Tier 3',
            'major': 'Major',
            'premier': 'Premier',
            'pro': 'Professional',
            'regional': 'Regional',
            'local': 'Local'
        }

        const normalizedTier = tier.toString().toLowerCase().replace(/[-_\s]/g, '')
        return tierMap[normalizedTier] || `Tier ${tier}`
    }

    // Get complete league information
    const getLeagueInfo = () => {
        const league = match.league?.name || ''
        const serie = match.serie?.full_name || match.serie?.name || ''

        if (league && serie) {
            return `${league} - ${parseLeagueInfo(serie)}`
        }
        return league || parseLeagueInfo(serie)
    }

    // Get region information
    const getRegion = () => {
        const region = match.tournament?.region ||
            match.league?.region ||
            match.serie?.region ||
            match.region

        if (!region) return null

        const regionMap: { [key: string]: string } = {
            'na': 'North America',
            'eu': 'Europe',
            'asia': 'Asia',
            'apac': 'Asia-Pacific',
            'emea': 'EMEA',
            'americas': 'Americas',
            'international': 'International',
            'global': 'Global',
            'world': 'World',
            'oceania': 'Oceania',
            'mena': 'MENA',
            'latam': 'Latin America',
            'kr': 'Korea',
            'cn': 'China',
            'jp': 'Japan',
            'sea': 'Southeast Asia'
        }

        const normalizedRegion = region.toString().toLowerCase().replace(/[-_\s]/g, '')
        return regionMap[normalizedRegion] || region
    }

    // Get match results and winner information
    const getMatchResults = (): MatchResults | null => {
        const isFinished = match.status === 'finished' || match.status === 'completed'
        const isLive = match.status === 'running'

        if ((!isFinished && !isLive) || !match.results || match.results.length === 0) {
            return null
        }

        const team1Score = match.results[0]?.score || 0
        const team2Score = match.results[1]?.score || 0

        let winnerIndex = -1
        if (isFinished) {
            if (team1Score > team2Score) {
                winnerIndex = 0
            } else if (team2Score > team1Score) {
                winnerIndex = 1
            }
        }

        return {
            team1Score,
            team2Score,
            winnerIndex,
            isDraw: isFinished && team1Score === team2Score && team1Score > 0,
            isLive
        }
    }

    // Get winner from match winner field (alternative method)
    const getWinnerFromMatch = () => {
        if (match.winner_id && match.opponents) {
            const winnerOpponent = match.opponents.find(
                opponent => opponent.opponent?.id === match.winner_id
            )
            if (winnerOpponent) {
                const winnerIndex = match.opponents.indexOf(winnerOpponent)
                return winnerIndex
            }
        }
        return -1
    }

    // Get video streams from match data
    const getVideoStreams = () => {
        const streams: { url: string; platform: string }[] = []

        if (match.streams_list && Array.isArray(match.streams_list)) {
            streams.push(...match.streams_list.map(stream => ({
                url: stream.raw_url || stream.url || '',
                platform: getPlatformFromUrl(stream.raw_url || stream.url || '')
            })))
        }

        if (match.tournament?.streams && Array.isArray(match.tournament.streams)) {
            streams.push(...match.tournament.streams.map(stream => ({
                url: stream.raw_url || stream.url || '',
                platform: getPlatformFromUrl(stream.raw_url || stream.url || '')
            })))
        }

        return streams
            .filter(stream => !!stream.url)
            .filter((stream, index, self) =>
                index === self.findIndex((s) => s.url === stream.url)
            );
    }

    const getPlatformFromUrl = (url: string) => {
        if (!url) return 'External'
        if (url.includes('twitch.tv')) return 'Twitch'
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
        if (url.includes('facebook.com') || url.includes('fb.gg')) return 'Facebook'
        if (url.includes('afreecatv.com')) return 'AfreecaTV'
        if (url.includes('huya.com')) return 'Huya'
        if (url.includes('douyu.com')) return 'Douyu'
        return 'External'
    }

    const videoStreams = getVideoStreams()
    const dateTime = formatDateTime(match.scheduled_at || match.begin_at)
    const endDateTime = match.end_at ? formatDateTime(match.end_at) : null
    const tournamentStage = getTournamentStage()
    const gamesFormat = getGamesFormat()
    const leagueInfo = getLeagueInfo()
    const leagueTier = getLeagueTier()
    const region = getRegion()
    const stageColor = getStageColor(tournamentStage)
    const matchResults = getMatchResults()
    const winnerFromMatch = getWinnerFromMatch()

    // Determine final winner (prefer results over winner_id, only for finished matches)
    const finalWinner = matchResults?.isLive ? -1 : (matchResults?.winnerIndex ?? winnerFromMatch)
    const isMatchFinished = match.status === 'finished' || match.status === 'completed'
    const isMatchLive = match.status === 'running'

    return {
        countdown,
        isLive,
        isPast,
        videoStreams,
        dateTime,
        endDateTime,
        tournamentStage,
        gamesFormat,
        leagueInfo,
        leagueTier,
        region,
        stageColor,
        matchResults,
        finalWinner,
        isMatchFinished,
        isMatchLive
    }
} 
