'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Play, Trophy, Users, TrendingUp, ExternalLink, Clock, User } from 'lucide-react'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'

import { useMatches, useTournaments, useTeams } from '@/hooks/useEsportsData'
import { cleanMatchName, capitalizeWords } from '@/lib/textUtils'
import { getStatusColor, getStatusText, formatMatchDateSmart } from '@/lib/utils'
import { useCurrentTimezone } from '@/contexts/TimezoneContext'
import type { Match } from '@/types/esports'

// Note: Since this is a client component, metadata is handled in layout.tsx
// The root layout already has comprehensive metadata for the home page



// Custom hook for countdown functionality
function useCountdown(match: Match) {
  const [countdown, setCountdown] = useState('')
  const [isLive, setIsLive] = useState(false)
  const [isPast, setIsPast] = useState(false)
  const countdownInterval = useRef<NodeJS.Timeout | undefined>(undefined)

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

  useEffect(() => {
    calculateCountdown(match)
    countdownInterval.current = setInterval(() => calculateCountdown(match), 1000)

    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current)
      }
    }
  }, [match])

  return { countdown, isLive, isPast }
}

// Component for individual match row with countdown - Mobile Responsive
function MatchRow({ match, router }: { match: Match; router: ReturnType<typeof useRouter> }) {
  const { countdown, isLive, isPast } = useCountdown(match)
  const currentTimezone = useCurrentTimezone()

  return (
    <button
      key={match.id}
      onClick={() => router.push(`/matches?game=${encodeURIComponent(match.videogame.slug)}`)}
      className="w-full flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 border-b border-gray-700/50 hover:bg-gray-700/20 cursor-pointer rounded-lg px-3 sm:px-4 transition-all duration-200 text-left group min-h-[44px]"
    >
      {/* Mobile Layout */}
      <div className="flex items-start space-x-3 sm:space-x-4 w-full">
        <div className="relative flex-shrink-0 mt-1">
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
            match.status === 'running' ? 'bg-red-500' :
            match.status === 'finished' ? 'bg-blue-500' : 'bg-yellow-500'
          }`} />
          {match.status === 'running' && (
            <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-ping opacity-75" />
          )}
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          {cleanMatchName(match.name) && (
            <div className="mb-1 sm:mb-2">
              <span className="text-sm sm:text-base font-bold text-purple-300 group-hover:text-purple-200 transition-colors duration-200 line-clamp-1">
                {cleanMatchName(match.name)}
              </span>
            </div>
          )}
          
          {/* Team Images and Names - Responsive */}
          <div className="flex items-center space-x-2 mb-2 flex-wrap">
            {match.opponents?.slice(0, 2).map((opponent, index) => (
              <div key={opponent.opponent.id || index} className="flex items-center space-x-2 min-w-0">
                <div className={`relative w-6 h-6 sm:w-8 sm:h-8 ${
                  opponent.type === 'Player' 
                    ? 'bg-gradient-to-br from-gray-600/80 to-gray-700/80 rounded-lg' 
                    : 'bg-gray-600/60 rounded-xl'
                } border border-gray-700/40 hover:border-gray-600/60 transition-colors duration-200 overflow-hidden flex-shrink-0`}>
                  <Image
                    src={opponent.opponent.image_url || (opponent.type === 'Player' ? '/images/placeholder-player.svg' : '/images/placeholder-team.svg')}
                    alt={opponent.opponent.name}
                    fill
                    unoptimized
                    className={opponent.type === 'Player' ? 'object-cover' : 'object-contain rounded-xl p-0.5'}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = opponent.type === 'Player' ? '/images/placeholder-player.svg' : '/images/placeholder-team.svg'
                    }}
                  />
                </div>
                <span className="text-sm sm:text-base text-gray-300 font-medium truncate max-w-[120px] sm:max-w-none group-hover:text-white transition-colors duration-200">
                  {opponent.opponent.name}
                </span>
                {index === 0 && match.opponents.length > 1 && (
                  <span className="text-xs sm:text-sm text-gray-500 mx-1 flex-shrink-0">vs</span>
                )}
              </div>
            ))}
          </div>
          
                     {/* League, Serie, Tournament Info - Mobile Responsive */}
           <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
             {match.league?.name && (
               <span className="text-xs sm:text-sm text-blue-400 font-medium bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-500/20 truncate max-w-[100px] sm:max-w-none">
                 {match.league.name}
               </span>
             )}
             {match.serie?.full_name && (
               <span className="text-xs sm:text-sm text-green-400 font-medium bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-500/20 truncate max-w-[120px] sm:max-w-none">
                 {capitalizeWords(match.serie.full_name)}
               </span>
             )}
             {match.tournament?.name && (
               <span className="text-xs sm:text-sm text-yellow-400 font-medium bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 truncate max-w-[100px] sm:max-w-none">
                 {match.tournament.name}
               </span>
             )}
           </div>
          
          {/* Game and Date Info - Mobile Layout */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">{match.videogame.name}</span>
            <span className="text-xs sm:text-sm text-gray-500 hidden sm:block">•</span>
            <span className="text-xs sm:text-sm text-gray-500">
              {formatMatchDateSmart(match.scheduled_at || match.begin_at, currentTimezone, { includeYear: true })}
            </span>
          </div>
        </div>
      </div>
      
      {/* Status and Countdown - Mobile Responsive */}
      <div className="flex items-center justify-between sm:justify-end space-x-2 mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                 {/* Countdown Timer - MatchCard Style */}
         {!isPast && countdown && !isLive && match.status === 'not_started' && (
           <div className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
             <Clock className="w-3 h-3 mr-2" />
             <span>{countdown}</span>
           </div>
         )}
         
                   {/* Status Badge - MatchCard Style */}
          <div className="flex items-center space-x-2 bg-gray-800/60 rounded-lg px-3 py-1.5 border border-gray-700/40">
            {match.status === 'running' ? (
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            ) : (
              <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(match.status)}`} />
            )}
            <span className="text-xs font-medium text-gray-200">{getStatusText(match.status)}</span>
          </div>
      </div>
    </button>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch data for statistics
  const { data: matches, loading: matchesLoading } = useMatches({ per_page: 100 })
  const { data: tournaments, loading: tournamentsLoading } = useTournaments({ per_page: 50 })
  const { data: teams, loading: teamsLoading } = useTeams({ per_page: 50 })

  // Enhanced prize pool parsing utility
  const parsePrizePool = (prizePool: string | undefined | null): number => {
    if (!prizePool || prizePool.trim() === '') return 0;
    
    // Handle common "TBD" or "To be determined" cases
    const lowerPrizePool = prizePool.toLowerCase().trim();
    if (lowerPrizePool === 'tbd' || lowerPrizePool === 'to be determined' || lowerPrizePool === 'n/a' || lowerPrizePool === 'unknown') {
      return 0;
    }
    
    // Start with the original string
    let numericString = prizePool.trim();
    
    // Remove currency symbols first
    numericString = numericString.replace(/[$€£¥₹₽₩฿]/g, '');
    
    // Remove currency names and codes (case insensitive)
    const currencyNames = [
      'united states dollar', 'us dollar', 'dollar', 'dollars',
      'indonesian rupiah', 'rupiah',
      'euro', 'euros',
      'british pound', 'pound', 'pounds', 'sterling',
      'japanese yen', 'yen',
      'indian rupee', 'rupee', 'rupees',
      'russian ruble', 'ruble', 'rubles',
      'chinese yuan', 'yuan', 'renminbi',
      'korean won', 'won',
      'thai baht', 'baht',
      'singapore dollar', 'singapore dollars',
      'malaysian ringgit', 'ringgit',
      'philippine peso', 'peso', 'pesos',
      'vietnamese dong', 'dong',
      'brazilian real', 'real', 'reais',
      'mexican peso', 'mexican pesos',
      'canadian dollar', 'canadian dollars',
      'australian dollar', 'australian dollars',
      'new zealand dollar', 'new zealand dollars',
      'south african rand', 'rand',
      'turkish lira', 'lira',
      'polish zloty', 'zloty',
      'czech koruna', 'koruna',
      'hungarian forint', 'forint',
      'norwegian krone', 'krone',
      'swedish krona', 'krona',
      'danish krone',
      'swiss franc', 'franc'
    ];
    
    const currencyCodes = ['usd', 'eur', 'gbp', 'jpy', 'inr', 'rub', 'cny', 'krw', 'thb', 'sgd', 'myr', 'php', 'vnd', 'brl', 'mxn', 'cad', 'aud', 'nzd', 'zar', 'try', 'pln', 'czk', 'huf', 'nok', 'sek', 'dkk', 'chf', 'idr'];
    
    // Remove currency names
    currencyNames.forEach(name => {
      const regex = new RegExp(`\\b${name}\\b`, 'gi');
      numericString = numericString.replace(regex, '');
    });
    
    // Remove currency codes
    currencyCodes.forEach(code => {
      const regex = new RegExp(`\\b${code}\\b`, 'gi');
      numericString = numericString.replace(regex, '');
    });
    
    // Clean up extra spaces
    numericString = numericString.trim();
    
         // Check for multiplier suffixes BEFORE removing non-numeric characters
     const multipliers = {
       'b': 1000000000,    // billion
       'bil': 1000000000,  // billion
       'billion': 1000000000,
       'billions': 1000000000,
       'm': 1000000,       // million
       'mil': 1000000,     // million
       'million': 1000000,
       'millions': 1000000,
       'k': 1000,          // thousand
       'thousand': 1000,
       'thousands': 1000
     };
    
    let multiplier = 1;
    const lowerNumeric = numericString.toLowerCase();
    
    // Find the multiplier (check longer strings first to avoid conflicts)
    const sortedMultipliers = Object.entries(multipliers).sort((a, b) => b[0].length - a[0].length);
    
    for (const [suffix, mult] of sortedMultipliers) {
      if (lowerNumeric.endsWith(suffix)) {
        multiplier = mult;
        // Remove the suffix from the string
        numericString = numericString.substring(0, numericString.length - suffix.length).trim();
        break;
      }
    }
    
    // Handle different decimal separators and thousands separators
    // First, identify the pattern
    const commaCount = (numericString.match(/,/g) || []).length;
    const dotCount = (numericString.match(/\./g) || []).length;
    
    // Clean the numeric string based on common patterns
    if (commaCount > 0 && dotCount > 0) {
      // Pattern like 1,234,567.89 (US format) or 1.234.567,89 (European format)
      const lastCommaIndex = numericString.lastIndexOf(',');
      const lastDotIndex = numericString.lastIndexOf('.');
      
      if (lastDotIndex > lastCommaIndex) {
        // US format: 1,234,567.89
        numericString = numericString.replace(/,/g, ''); // Remove thousands separators
      } else {
        // European format: 1.234.567,89
        numericString = numericString.replace(/\./g, ''); // Remove thousands separators
        numericString = numericString.replace(',', '.'); // Convert decimal separator
      }
    } else if (commaCount > 0) {
      // Only commas - could be thousands separator or decimal separator
      const parts = numericString.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Likely decimal separator (e.g., "1000,50")
        numericString = numericString.replace(',', '.');
      } else {
        // Likely thousands separator (e.g., "1,000,000")
        numericString = numericString.replace(/,/g, '');
      }
    } else if (dotCount > 1) {
      // Multiple dots - likely thousands separator (e.g., "1.000.000")
      const parts = numericString.split('.');
      if (parts[parts.length - 1].length <= 2) {
        // Last part is likely decimals
        const decimals = parts.pop();
        numericString = parts.join('') + '.' + decimals;
      } else {
        // All dots are thousands separators
        numericString = numericString.replace(/\./g, '');
      }
    }
    
    // Remove any remaining non-numeric characters except decimal point
    numericString = numericString.replace(/[^0-9.]/g, '');
    
    // Parse the final number
    let value = parseFloat(numericString);
    
    if (isNaN(value) || value <= 0) return 0;
    
    // Apply the multiplier
    value = value * multiplier;
    
    return Math.round(value); // Round to avoid floating point precision issues
  }

  // Prize pool analysis by currency
  const analyzePrizepoolsByCurrency = (tournaments: Array<{ id: number; name: string; prizepool?: string; league: { name: string }; videogame: { name: string } }>) => {
    const currencyGroups: { [key: string]: Array<{ tournament: string; league: string; game: string; originalPrizepool: string; parsedValue: number }> } = {}
    
    tournaments?.forEach(tournament => {
      if (!tournament.prizepool) return
      
      const prizePool = tournament.prizepool
      const parsedValue = parsePrizePool(prizePool)
      
      if (parsedValue === 0) return
      
      // Detect currency with comprehensive global coverage
      let currency = 'USD ($)' // Default
      
      // Check for currency symbols first (most reliable)
      if (/€/.test(prizePool)) currency = 'EUR (€)'
      else if (/£/.test(prizePool)) currency = 'GBP (£)'
      else if (/¥/.test(prizePool)) currency = 'JPY (¥)'
      else if (/₹/.test(prizePool)) currency = 'INR (₹)'
      else if (/₽/.test(prizePool)) currency = 'RUB (₽)'
      else if (/₩/.test(prizePool)) currency = 'KRW (₩)'
      else if (/฿/.test(prizePool)) currency = 'THB (฿)'
      else if (/₱/.test(prizePool)) currency = 'PHP (₱)'
      else if (/₫/.test(prizePool)) currency = 'VND (₫)'
      else if (/₪/.test(prizePool)) currency = 'ILS (₪)'
      else if (/₺/.test(prizePool)) currency = 'TRY (₺)'
      else if (/₡/.test(prizePool)) currency = 'CRC (₡)'
      else if (/₦/.test(prizePool)) currency = 'NGN (₦)'
      else if (/₵/.test(prizePool)) currency = 'GHS (₵)'
      else if (/₴/.test(prizePool)) currency = 'UAH (₴)'
      else if (/₸/.test(prizePool)) currency = 'KZT (₸)'
      else if (/₼/.test(prizePool)) currency = 'AZN (₼)'
      else if (/₾/.test(prizePool)) currency = 'GEL (₾)'
      else if (/﷼/.test(prizePool)) currency = 'SAR (﷼)'
      else if (/R\$/.test(prizePool)) currency = 'BRL (R$)'
      else if (/S\$/.test(prizePool)) currency = 'SGD (S$)'
      else if (/C\$/.test(prizePool)) currency = 'CAD (C$)'
      else if (/A\$/.test(prizePool)) currency = 'AUD (A$)'
      else if (/NZ\$/.test(prizePool)) currency = 'NZD (NZ$)'
      else if (/HK\$/.test(prizePool)) currency = 'HKD (HK$)'
      else if (/Rp/.test(prizePool)) currency = 'IDR (Rp)'
      else if (/RM/.test(prizePool)) currency = 'MYR (RM)'
      else if (/R\b/.test(prizePool)) currency = 'ZAR (R)'
      else if (/kr/.test(prizePool)) currency = 'NOK (kr)' // Default Nordic currency
      else if (/zł/.test(prizePool)) currency = 'PLN (zł)'
      else if (/Kč/.test(prizePool)) currency = 'CZK (Kč)'
      else if (/Ft/.test(prizePool)) currency = 'HUF (Ft)'
      else if (/lei/.test(prizePool)) currency = 'RON (lei)'
      else if (/лв/.test(prizePool)) currency = 'BGN (лв)'
      else if (/kn/.test(prizePool)) currency = 'HRK (kn)'
      else if (/din/.test(prizePool)) currency = 'RSD (din)'
      
      // Check for currency names and codes (comprehensive global coverage)
      else if (/euro|eur\b/gi.test(prizePool)) currency = 'EUR (€)'
      else if (/british pound|pound sterling|gbp\b/gi.test(prizePool)) currency = 'GBP (£)'
      else if (/japanese yen|yen|jpy\b/gi.test(prizePool)) currency = 'JPY (¥)'
      else if (/chinese yuan|yuan|cny\b/gi.test(prizePool)) currency = 'CNY (¥)'
      else if (/indian rupee|rupee|inr\b/gi.test(prizePool)) currency = 'INR (₹)'
      else if (/russian ruble|ruble|rub\b/gi.test(prizePool)) currency = 'RUB (₽)'
      else if (/korean won|won|krw\b/gi.test(prizePool)) currency = 'KRW (₩)'
      else if (/thai baht|baht|thb\b/gi.test(prizePool)) currency = 'THB (฿)'
      else if (/indonesian rupiah|rupiah|idr\b/gi.test(prizePool)) currency = 'IDR (Rp)'
      else if (/singapore dollar|sgd\b/gi.test(prizePool)) currency = 'SGD (S$)'
      else if (/malaysian ringgit|ringgit|myr\b/gi.test(prizePool)) currency = 'MYR (RM)'
      else if (/philippine peso|peso|php\b/gi.test(prizePool)) currency = 'PHP (₱)'
      else if (/vietnamese dong|dong|vnd\b/gi.test(prizePool)) currency = 'VND (₫)'
      else if (/brazilian real|real|brl\b/gi.test(prizePool)) currency = 'BRL (R$)'
      else if (/mexican peso|mxn\b/gi.test(prizePool)) currency = 'MXN ($)'
      else if (/canadian dollar|cad\b/gi.test(prizePool)) currency = 'CAD (C$)'
      else if (/australian dollar|aud\b/gi.test(prizePool)) currency = 'AUD (A$)'
      else if (/new zealand dollar|nzd\b/gi.test(prizePool)) currency = 'NZD (NZ$)'
      else if (/hong kong dollar|hkd\b/gi.test(prizePool)) currency = 'HKD (HK$)'
      else if (/swiss franc|chf\b/gi.test(prizePool)) currency = 'CHF (CHF)'
      else if (/south african rand|rand|zar\b/gi.test(prizePool)) currency = 'ZAR (R)'
      else if (/turkish lira|lira|try\b/gi.test(prizePool)) currency = 'TRY (₺)'
      else if (/norwegian krone|krone|nok\b/gi.test(prizePool)) currency = 'NOK (kr)'
      else if (/swedish krona|krona|sek\b/gi.test(prizePool)) currency = 'SEK (kr)'
      else if (/danish krone|dkk\b/gi.test(prizePool)) currency = 'DKK (kr)'
      else if (/israeli shekel|shekel|ils\b/gi.test(prizePool)) currency = 'ILS (₪)'
      else if (/polish zloty|zloty|pln\b/gi.test(prizePool)) currency = 'PLN (zł)'
      else if (/czech koruna|koruna|czk\b/gi.test(prizePool)) currency = 'CZK (Kč)'
      else if (/hungarian forint|forint|huf\b/gi.test(prizePool)) currency = 'HUF (Ft)'
      else if (/romanian leu|leu|ron\b/gi.test(prizePool)) currency = 'RON (lei)'
      else if (/bulgarian lev|lev|bgn\b/gi.test(prizePool)) currency = 'BGN (лв)'
      else if (/croatian kuna|kuna|hrk\b/gi.test(prizePool)) currency = 'HRK (kn)'
      else if (/serbian dinar|dinar|rsd\b/gi.test(prizePool)) currency = 'RSD (din)'
      else if (/ukrainian hryvnia|hryvnia|uah\b/gi.test(prizePool)) currency = 'UAH (₴)'
      else if (/kazakhstani tenge|tenge|kzt\b/gi.test(prizePool)) currency = 'KZT (₸)'
      else if (/azerbaijani manat|manat|azn\b/gi.test(prizePool)) currency = 'AZN (₼)'
      else if (/georgian lari|lari|gel\b/gi.test(prizePool)) currency = 'GEL (₾)'
      else if (/saudi riyal|riyal|sar\b/gi.test(prizePool)) currency = 'SAR (﷼)'
      else if (/uae dirham|dirham|aed\b/gi.test(prizePool)) currency = 'AED (د.إ)'
      else if (/egyptian pound|egp\b/gi.test(prizePool)) currency = 'EGP (£)'
      else if (/nigerian naira|naira|ngn\b/gi.test(prizePool)) currency = 'NGN (₦)'
      else if (/ghanaian cedi|cedi|ghs\b/gi.test(prizePool)) currency = 'GHS (₵)'
      else if (/kenyan shilling|shilling|kes\b/gi.test(prizePool)) currency = 'KES (KSh)'
      else if (/moroccan dirham|mad\b/gi.test(prizePool)) currency = 'MAD (DH)'
      else if (/tunisian dinar|tnd\b/gi.test(prizePool)) currency = 'TND (د.ت)'
      else if (/argentine peso|ars\b/gi.test(prizePool)) currency = 'ARS ($)'
      else if (/chilean peso|clp\b/gi.test(prizePool)) currency = 'CLP ($)'
      else if (/colombian peso|cop\b/gi.test(prizePool)) currency = 'COP ($)'
      else if (/peruvian sol|pen\b/gi.test(prizePool)) currency = 'PEN (S/)'
      else if (/uruguayan peso|uyu\b/gi.test(prizePool)) currency = 'UYU ($)'
      else if (/venezuelan bolívar|vef\b/gi.test(prizePool)) currency = 'VEF (Bs)'
      else if (/costa rican colón|colón|crc\b/gi.test(prizePool)) currency = 'CRC (₡)'
      else if (/guatemalan quetzal|quetzal|gtq\b/gi.test(prizePool)) currency = 'GTQ (Q)'
      else if (/honduran lempira|lempira|hnl\b/gi.test(prizePool)) currency = 'HNL (L)'
      else if (/nicaraguan córdoba|córdoba|nio\b/gi.test(prizePool)) currency = 'NIO (C$)'
      else if (/panamanian balboa|balboa|pab\b/gi.test(prizePool)) currency = 'PAB (B/.)'
      else if (/jamaican dollar|jmd\b/gi.test(prizePool)) currency = 'JMD (J$)'
      else if (/trinidad dollar|ttd\b/gi.test(prizePool)) currency = 'TTD (TT$)'
      else if (/barbadian dollar|bbd\b/gi.test(prizePool)) currency = 'BBD (Bds$)'
      else if (/icelandic króna|króna|isk\b/gi.test(prizePool)) currency = 'ISK (kr)'
      else if (/finnish markka|fim\b/gi.test(prizePool)) currency = 'EUR (€)' // Finland uses Euro now
      else if (/estonian kroon|eek\b/gi.test(prizePool)) currency = 'EUR (€)' // Estonia uses Euro now
      else if (/latvian lats|lvl\b/gi.test(prizePool)) currency = 'EUR (€)' // Latvia uses Euro now
      else if (/lithuanian litas|ltl\b/gi.test(prizePool)) currency = 'EUR (€)' // Lithuania uses Euro now
      else if (/maltese lira|mtl\b/gi.test(prizePool)) currency = 'EUR (€)' // Malta uses Euro now
      else if (/cypriot pound|cyp\b/gi.test(prizePool)) currency = 'EUR (€)' // Cyprus uses Euro now
      else if (/slovak koruna|skk\b/gi.test(prizePool)) currency = 'EUR (€)' // Slovakia uses Euro now
      else if (/slovenian tolar|sit\b/gi.test(prizePool)) currency = 'EUR (€)' // Slovenia uses Euro now
      
      if (!currencyGroups[currency]) {
        currencyGroups[currency] = []
      }
      
      currencyGroups[currency].push({
        tournament: tournament.name,
        league: tournament.league.name,
        game: tournament.videogame.name,
        originalPrizepool: prizePool,
        parsedValue
      })
    })
    
    // Sort each currency group by parsed value (descending)
    Object.keys(currencyGroups).forEach(currency => {
      currencyGroups[currency].sort((a, b) => b.parsedValue - a.parsedValue)
    })
    
    return currencyGroups
  }

  // Calculate realistic statistics based on limited sample data
  const stats = {
    liveMatches: matches?.filter(match => match.status === 'running').length || 0,
    upcomingMatches: matches?.filter(match => match.status === 'not_started').length || 0,
    totalActiveMatches: (matches?.filter(match => match.status === 'running' || match.status === 'not_started').length || 0),
    activeTournaments: tournaments?.filter(tournament => tournament.status !== 'finished').length || 0,
    featuredTeams: teams?.length || 0,
    samplePrizePool: tournaments?.reduce((total, tournament) => {
      if (!tournament.prizepool) return total
      
      const parsedValue = parsePrizePool(tournament.prizepool)
      return total + parsedValue
    }, 0) || 0
  }

  // Get prizepool analysis
  const prizepoolsByCurrency = analyzePrizepoolsByCurrency(tournaments || [])
  
  // Debug: Log prizepool analysis (can be removed in production)
  React.useEffect(() => {
    if (Object.keys(prizepoolsByCurrency).length > 0) {
      console.log('Prize Pools by Currency:', prizepoolsByCurrency)
      console.log('Currency Summary:', Object.entries(prizepoolsByCurrency).map(([currency, tournaments]) => ({
        currency,
        count: tournaments.length,
        totalValue: tournaments.reduce((sum, item) => sum + item.parsedValue, 0),
        tournaments: tournaments.map(t => ({ name: t.tournament, prizepool: t.originalPrizepool, parsed: t.parsedValue }))
      })))
      
      // Test parsing with various formats
      console.log('=== PARSING TESTS ===')
      const testCases = [
        '$1,000,000',
        '€2.5M',
        '£500K',
        '¥100,000,000',
        '₹50,00,000',
        '$2.5 million',
        '1.000.000 EUR',
        '1,234,567.89 USD',
        '2.500.000,50 €',
        '$500k',
        'TBD',
        '1.5B USD',
        '750 thousand dollars'
      ]
      
      testCases.forEach(testCase => {
        const parsed = parsePrizePool(testCase)
        console.log(`"${testCase}" → ${parsed.toLocaleString()}`)
      })
    }
  }, [prizepoolsByCurrency])

  // Format prize pool display with multi-currency support
  const formatPrizePool = (totalAmount: number, prizepoolsByCurrency: { [key: string]: Array<{ tournament: string; league: string; game: string; originalPrizepool: string; parsedValue: number }> }): string => {
    if (totalAmount === 0) return 'TBD'
    
    const currencies = Object.keys(prizepoolsByCurrency)
    
    // If only one currency, use that currency's symbol
    if (currencies.length === 1) {
      const currency = currencies[0]
      let currencySymbol = '$' // Default fallback
      
      if (currency.includes('(') && currency.includes(')')) {
        // Extract symbol from parentheses: "USD ($)" -> "$"
        currencySymbol = currency.split('(')[1].replace(')', '')
      } else {
        // For currencies without symbols, use appropriate symbols or codes
        const currencyMap: { [key: string]: string } = {
          'IDR': 'Rp',
          'SGD': 'S$',
          'MYR': 'RM',
          'PHP': '₱',
          'VND': '₫',
          'BRL': 'R$',
          'MXN': '$',
          'CAD': 'C$',
          'AUD': 'A$',
          'NZD': 'NZ$',
          'HKD': 'HK$',
          'CHF': 'CHF',
          'ZAR': 'R',
          'TRY': '₺',
          'NOK': 'kr',
          'SEK': 'kr',
          'DKK': 'kr',
          'CNY': '¥',
          'ILS': '₪',
          'PLN': 'zł',
          'CZK': 'Kč',
          'HUF': 'Ft',
          'RON': 'lei',
          'BGN': 'лв',
          'HRK': 'kn',
          'RSD': 'din',
          'UAH': '₴',
          'KZT': '₸',
          'AZN': '₼',
          'GEL': '₾',
          'SAR': '﷼',
          'AED': 'د.إ',
          'EGP': '£',
          'NGN': '₦',
          'GHS': '₵',
          'KES': 'KSh',
          'MAD': 'DH',
          'TND': 'د.ت',
          'ARS': '$',
          'CLP': '$',
          'COP': '$',
          'PEN': 'S/',
          'UYU': '$',
          'VEF': 'Bs',
          'CRC': '₡',
          'GTQ': 'Q',
          'HNL': 'L',
          'NIO': 'C$',
          'PAB': 'B/.',
          'JMD': 'J$',
          'TTD': 'TT$',
          'BBD': 'Bds$',
          'ISK': 'kr'
        }
        currencySymbol = currencyMap[currency] || currency
      }
      
      // Format with single currency
      if (totalAmount >= 1000000000) {
        return `${currencySymbol}${(totalAmount / 1000000000).toFixed(1)}B`
      } else if (totalAmount >= 1000000) {
        return `${currencySymbol}${(totalAmount / 1000000).toFixed(1)}M`
      } else if (totalAmount >= 1000) {
        return `${currencySymbol}${(totalAmount / 1000).toFixed(1)}K`
      } else {
        return `${currencySymbol}${Math.round(totalAmount).toLocaleString()}`
      }
    }
    
    // Multiple currencies - show top currencies
    const currencyTotals = Object.entries(prizepoolsByCurrency)
      .map(([currency, tournaments]) => ({
        currency,
        total: tournaments.reduce((sum, item) => sum + item.parsedValue, 0)
      }))
      .sort((a, b) => b.total - a.total)
    
    // Get top 2 currencies
    const topCurrencies = currencyTotals.slice(0, 2)
    
    const formatCurrencyAmount = (amount: number, currency: string) => {
      let currencySymbol = '$'
      
      if (currency.includes('(') && currency.includes(')')) {
        currencySymbol = currency.split('(')[1].replace(')', '')
      } else {
        const currencyMap: { [key: string]: string } = {
          'IDR': 'Rp',
          'SGD': 'S$',
          'MYR': 'RM',
          'PHP': '₱',
          'VND': '₫',
          'BRL': 'R$',
          'MXN': '$',
          'CAD': 'C$',
          'AUD': 'A$',
          'NZD': 'NZ$',
          'HKD': 'HK$',
          'CHF': 'CHF',
          'ZAR': 'R',
          'TRY': '₺',
          'NOK': 'kr',
          'SEK': 'kr',
          'DKK': 'kr',
          'CNY': '¥',
          'ILS': '₪',
          'PLN': 'zł',
          'CZK': 'Kč',
          'HUF': 'Ft',
          'RON': 'lei',
          'BGN': 'лв',
          'HRK': 'kn',
          'RSD': 'din',
          'UAH': '₴',
          'KZT': '₸',
          'AZN': '₼',
          'GEL': '₾',
          'SAR': '﷼',
          'AED': 'د.إ',
          'EGP': '£',
          'NGN': '₦',
          'GHS': '₵',
          'KES': 'KSh',
          'MAD': 'DH',
          'TND': 'د.ت',
          'ARS': '$',
          'CLP': '$',
          'COP': '$',
          'PEN': 'S/',
          'UYU': '$',
          'VEF': 'Bs',
          'CRC': '₡',
          'GTQ': 'Q',
          'HNL': 'L',
          'NIO': 'C$',
          'PAB': 'B/.',
          'JMD': 'J$',
          'TTD': 'TT$',
          'BBD': 'Bds$',
          'ISK': 'kr'
        }
        currencySymbol = currencyMap[currency] || currency
      }
      
      if (amount >= 1000000000) {
        return `${currencySymbol}${(amount / 1000000000).toFixed(1)}B`
      } else if (amount >= 1000000) {
        return `${currencySymbol}${(amount / 1000000).toFixed(1)}M`
      } else if (amount >= 1000) {
        return `${currencySymbol}${(amount / 1000).toFixed(1)}K`
      } else {
        return `${currencySymbol}${Math.round(amount).toLocaleString()}`
      }
    }
    
    if (topCurrencies.length >= 2) {
      return `${formatCurrencyAmount(topCurrencies[0].total, topCurrencies[0].currency)} + ${formatCurrencyAmount(topCurrencies[1].total, topCurrencies[1].currency)}`
    } else if (topCurrencies.length === 1) {
      return formatCurrencyAmount(topCurrencies[0].total, topCurrencies[0].currency)
    }
    
    return 'TBD'
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'matches':
        router.push('/matches')
        break
      case 'tournaments':
        router.push('/tournaments')
        break
      case 'teams':
        router.push('/teams')
        break
      case 'players':
        router.push('/players')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header searchTerm={searchTerm} onSearch={setSearchTerm} />
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 main-content">
        {/* Hero Section - Mobile Responsive */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3 sm:mb-4 px-2 animate-gradient-x bg-300% hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 transition-all duration-500 hover:animate-neon-glow animate-glitch cursor-default">
            EsportsTracker
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-2xl mx-auto px-3 sm:px-4 leading-relaxed">
            Your ultimate destination for live matches, tournaments, and esports statistics
          </p>
        </div>

        {/* Statistics Overview - Fully Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-blue-500/20 min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-blue-300 font-medium">Live & Upcoming</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.totalActiveMatches}</p>
              </div>
              <div className="bg-blue-500/20 p-1.5 sm:p-2 rounded-lg">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-blue-300/70 mt-1">
              {stats.liveMatches > 0 ? `${stats.liveMatches} live now` : 'Ready to start'}
            </p>
          </div>

          {tournamentsLoading ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-700/50 animate-pulse">
              <div className="h-12 sm:h-16 lg:h-20 bg-gray-700/50 rounded-lg" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-purple-500/20 min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-300 font-medium">Active Events</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.activeTournaments}</p>
                </div>
                <div className="bg-purple-500/20 p-1.5 sm:p-2 rounded-lg">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-purple-300/70 mt-1">
                {stats.activeTournaments > 5 ? `${stats.activeTournaments} active` : 'Running tournaments'}
              </p>
            </div>
          )}

          {teamsLoading ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-700/50 animate-pulse">
              <div className="h-12 sm:h-16 lg:h-20 bg-gray-700/50 rounded-lg" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-green-500/20 min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-300 font-medium">Featured Teams</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.featuredTeams}</p>
                </div>
                <div className="bg-green-500/20 p-1.5 sm:p-2 rounded-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </div>
              </div>
              <p className="text-xs text-green-300/70 mt-1">
                {stats.featuredTeams >= 50 ? '50+ teams' : 'Top performers'}
              </p>
            </div>
          )}

          {tournamentsLoading ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-700/50 animate-pulse">
              <div className="h-12 sm:h-16 lg:h-20 bg-gray-700/50 rounded-lg" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-orange-500/20 min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-orange-300 font-medium">Prize Pool</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{formatPrizePool(stats.samplePrizePool, prizepoolsByCurrency)}</p>
                </div>
                <div className="bg-orange-500/20 p-1.5 sm:p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                </div>
              </div>
              <p className="text-xs text-orange-300/70 mt-1">
                {Object.keys(prizepoolsByCurrency).length > 1 
                  ? `${Object.keys(prizepoolsByCurrency).length} currencies` 
                  : stats.samplePrizePool > 1000000 
                    ? "Multi-million" 
                    : stats.samplePrizePool > 0 
                      ? "Active" 
                      : "Current events"
                }
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions - Mobile Responsive - Made Smaller */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
          <button
            onClick={() => handleQuickAction('matches')}
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 text-left group cursor-pointer min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white/0 group-hover:text-white/100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-blue-100 transition-colors duration-200">Live Matches</h3>
            <p className="text-blue-100 text-xs sm:text-sm leading-tight opacity-90 group-hover:opacity-100 transition-opacity duration-200">Watch live matches</p>
          </button>

          <button
            onClick={() => handleQuickAction('tournaments')}
            className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 text-left group cursor-pointer min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white/0 group-hover:text-white/100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-purple-100 transition-colors duration-200">Tournaments</h3>
            <p className="text-purple-100 text-xs sm:text-sm leading-tight opacity-90 group-hover:opacity-100 transition-opacity duration-200">Explore tournaments</p>
          </button>

          <button
            onClick={() => handleQuickAction('teams')}
            className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:from-pink-500 hover:to-pink-700 transition-all duration-200 text-left group cursor-pointer min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white/0 group-hover:text-white/100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-pink-100 transition-colors duration-200">Teams</h3>
            <p className="text-pink-100 text-xs sm:text-sm leading-tight opacity-90 group-hover:opacity-100 transition-opacity duration-200">Browse teams</p>
          </button>

          <button
            onClick={() => handleQuickAction('players')}
            className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:from-green-500 hover:to-green-700 transition-all duration-200 text-left group cursor-pointer min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white/0 group-hover:text-white/100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-green-100 transition-colors duration-200">Players</h3>
            <p className="text-green-100 text-xs sm:text-sm leading-tight opacity-90 group-hover:opacity-100 transition-opacity duration-200">Discover players</p>
          </button>
        </div>



        {/* Latest Activity - Mobile Responsive - Emphasized */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border-2 border-blue-500/30 shadow-2xl shadow-blue-500/10">
          <div className="flex items-center justify-between mb-6 sm:mb-7 lg:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400 mr-3 flex-shrink-0 animate-pulse" />
              <span className="truncate">
                {searchTerm ? (
                  <>
                    <span className="hidden sm:inline">Search Results for &ldquo;</span>
                    <span className="sm:hidden">Results for &ldquo;</span>
                    {searchTerm}&rdquo;
                  </>
                ) : (
                  'Latest Matches'
                )}
              </span>
            </h2>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          </div>
          
          {/* Scrollable Match List - Mobile Optimized - Increased Height */}
          <div className="max-h-80 sm:max-h-96 lg:max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 rounded-lg">
            <div className="space-y-2 sm:space-y-3 lg:space-y-4 pr-2">
              {matchesLoading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="w-full flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 border-b border-gray-700/50 hover:bg-gray-700/20 rounded-lg px-3 sm:px-4 transition-all duration-200 animate-pulse min-h-[44px]">
                    <div className="flex items-start space-x-3 sm:space-x-4 w-full">
                      {/* Status indicator */}
                      <div className="relative flex-shrink-0 mt-1">
                        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                          i % 3 === 0 ? 'bg-red-500/50' :
                          i % 3 === 1 ? 'bg-blue-500/50' : 'bg-yellow-500/50'
                        }`} />
                      </div>
                      
                      <div className="flex flex-col flex-1 min-w-0">
                        {/* Match name skeleton */}
                        {i % 2 === 0 && (
                          <div className="mb-1 sm:mb-2">
                            <div className="h-4 sm:h-5 w-24 sm:w-32 bg-purple-300/20 rounded" />
                          </div>
                        )}
                        
                        {/* Team Images and Names */}
                        <div className="flex items-center space-x-2 mb-2 flex-wrap">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 ${
                              i % 2 === 0 ? 'bg-gray-600/50 rounded-xl' : 'bg-gradient-to-br from-gray-600/50 to-gray-700/50 rounded-lg'
                            } border border-gray-700/40 flex-shrink-0`} />
                            <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-300/30 rounded" />
                            <span className="text-xs sm:text-sm text-gray-500 mx-1 flex-shrink-0">vs</span>
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 ${
                              i % 2 === 1 ? 'bg-gray-600/50 rounded-xl' : 'bg-gradient-to-br from-gray-600/50 to-gray-700/50 rounded-lg'
                            } border border-gray-700/40 flex-shrink-0`} />
                            <div className="h-3 sm:h-4 w-10 sm:w-14 bg-gray-300/30 rounded" />
                          </div>
                        </div>
                        
                                                 {/* League, Serie, Tournament Info */}
                         <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
                           <div className="h-6 w-16 sm:w-20 bg-blue-400/20 rounded-lg border border-blue-500/20" />
                           <div className="h-6 w-18 sm:w-24 bg-green-400/20 rounded-lg border border-green-500/20" />
                           <div className="h-6 w-14 sm:w-18 bg-yellow-400/20 rounded-lg border border-yellow-500/20" />
                         </div>
                        
                        {/* Game and date info */}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <div className="h-3 w-12 sm:w-16 bg-gray-500/30 rounded" />
                          <div className="h-3 w-16 sm:w-20 bg-gray-500/30 rounded" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Status badge */}
                    <div className="flex items-center justify-between sm:justify-end space-x-2 mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                      <div className={`flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full border backdrop-blur-sm ${
                        i % 3 === 0 ? 'bg-red-500/20 border-red-500/30' :
                        i % 3 === 1 ? 'bg-blue-500/20 border-blue-500/30' : 'bg-yellow-500/20 border-yellow-500/30'
                      }`}>
                        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                          i % 3 === 0 ? 'bg-red-500/50' :
                          i % 3 === 1 ? 'bg-blue-500/50' : 'bg-yellow-500/50'
                        }`} />
                        <div className={`h-3 sm:h-4 w-12 sm:w-16 rounded ${
                          i % 3 === 0 ? 'bg-red-400/30' :
                          i % 3 === 1 ? 'bg-blue-400/30' : 'bg-yellow-400/30'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Filter and process matches
                (() => {
                  const filteredMatches = matches
                    .filter((match: Match) => {
                      if (!searchTerm || searchTerm.trim() === '') return true;
                      
                      const searchTermLower = searchTerm.toLowerCase().trim();
                      
                      // Search in match name
                      const matchName = match.name?.toLowerCase() || '';
                      
                      // Search in league name
                      const leagueName = match.league?.name?.toLowerCase() || '';
                      
                      // Search in serie name
                      const serieName = match.serie?.name?.toLowerCase() || '';
                      
                      // Search in tournament name
                      const tournamentName = match.tournament?.name?.toLowerCase() || '';
                      
                      // Search in videogame name
                      const videogameName = match.videogame?.name?.toLowerCase() || '';
                      
                      // Search in opponents
                      const opponentNames = match.opponents?.map(opp => opp.opponent.name.toLowerCase()).join(' ') || '';
                      
                      // Check if search term matches any of these fields
                      return matchName.includes(searchTermLower) ||
                             leagueName.includes(searchTermLower) ||
                             serieName.includes(searchTermLower) ||
                             tournamentName.includes(searchTermLower) ||
                             videogameName.includes(searchTermLower) ||
                             opponentNames.includes(searchTermLower);
                    })
                    .sort((a: Match, b: Match) => {
                      // First priority: live matches
                      if (a.status === 'running' && b.status !== 'running') return -1;
                      if (b.status === 'running' && a.status !== 'running') return 1;
                      
                      // Second priority: upcoming matches (ascending order - soonest first)
                      if (a.status === 'not_started' && b.status === 'not_started') {
                        const dateA = new Date(a.scheduled_at || a.begin_at).getTime();
                        const dateB = new Date(b.scheduled_at || b.begin_at).getTime();
                        return dateA - dateB; // Ascending order for upcoming matches
                      }
                      
                      // Third priority: upcoming matches before finished matches
                      if (a.status === 'not_started' && b.status === 'finished') return -1;
                      if (b.status === 'not_started' && a.status === 'finished') return 1;
                      
                      // Fourth priority: finished matches (most recent first)
                      const dateA = new Date(a.begin_at).getTime();
                      const dateB = new Date(b.begin_at).getTime();
                      return dateB - dateA;
                    })
                    .slice(0, 50);

                  // Show no results message if search term exists but no matches found
                  if (searchTerm && searchTerm.trim() !== '' && filteredMatches.length === 0) {
                    return (
                      <div className="text-center py-6 sm:py-8">
                        <div className="text-gray-400 mb-2 text-sm sm:text-base">
                          No matches found for &ldquo;{searchTerm}&rdquo;
                        </div>
                        <div className="text-gray-500 text-xs sm:text-sm">
                          Try searching for a different term or check your spelling
                        </div>
                      </div>
                    );
                  }

                  return filteredMatches.map((match: Match) => (
                    <MatchRow key={match.id} match={match} router={router} />
                  ));
                })()
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
