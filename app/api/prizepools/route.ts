import { NextResponse } from 'next/server'
import { getTournaments } from '@/lib/pandaScore'
import { logger } from '@/lib/logger'

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

// Currency detection function
const detectCurrency = (prizePool: string): string => {
  if (/€/.test(prizePool)) return 'EUR (€)'
  else if (/£/.test(prizePool)) return 'GBP (£)'
  else if (/¥/.test(prizePool)) return 'JPY (¥)'
  else if (/₹/.test(prizePool)) return 'INR (₹)'
  else if (/₽/.test(prizePool)) return 'RUB (₽)'
  else if (/₩/.test(prizePool)) return 'KRW (₩)'
  else if (/฿/.test(prizePool)) return 'THB (฿)'
  else if (/indonesian rupiah|idr/gi.test(prizePool)) return 'IDR'
  else if (/euro|eur/gi.test(prizePool)) return 'EUR (€)'
  else if (/british pound|gbp/gi.test(prizePool)) return 'GBP (£)'
  else if (/japanese yen|jpy/gi.test(prizePool)) return 'JPY (¥)'
  else if (/indian rupee|inr/gi.test(prizePool)) return 'INR (₹)'
  else if (/russian ruble|rub/gi.test(prizePool)) return 'RUB (₽)'
  else if (/chinese yuan|cny/gi.test(prizePool)) return 'JPY (¥)'
  else if (/korean won|krw/gi.test(prizePool)) return 'KRW (₩)'
  else if (/thai baht|thb/gi.test(prizePool)) return 'THB (฿)'
  else if (/singapore dollar|sgd/gi.test(prizePool)) return 'SGD'
  else if (/malaysian ringgit|myr/gi.test(prizePool)) return 'MYR'
  else if (/philippine peso|php/gi.test(prizePool)) return 'PHP'
  else if (/vietnamese dong|vnd/gi.test(prizePool)) return 'VND'
  else if (/brazilian real|brl/gi.test(prizePool)) return 'BRL'
  else if (/mexican peso|mxn/gi.test(prizePool)) return 'MXN'
  else if (/canadian dollar|cad/gi.test(prizePool)) return 'CAD'
  else if (/australian dollar|aud/gi.test(prizePool)) return 'AUD'
  else if (/new zealand dollar|nzd/gi.test(prizePool)) return 'NZD'
  else if (/south african rand|zar/gi.test(prizePool)) return 'ZAR'
  else if (/turkish lira|try/gi.test(prizePool)) return 'TRY'
  else if (/polish zloty|pln/gi.test(prizePool)) return 'PLN'
  else if (/czech koruna|czk/gi.test(prizePool)) return 'CZK'
  else if (/hungarian forint|huf/gi.test(prizePool)) return 'HUF'
  else if (/norwegian krone|nok/gi.test(prizePool)) return 'NOK'
  else if (/swedish krona|sek/gi.test(prizePool)) return 'SEK'
  else if (/danish krone|dkk/gi.test(prizePool)) return 'DKK'
  else if (/swiss franc|chf/gi.test(prizePool)) return 'CHF'
  else return 'USD ($)' // Default
}

export async function GET() {
  try {
    logger.debug('Fetching tournament prizepools by currency')
    
    // Fetch tournaments with larger limit to get more prizepool data
    const tournaments = await getTournaments({ per_page: 100 })
    
    if (!tournaments) {
      return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 })
    }

    // Analyze prizepools by currency
    const currencyGroups: { [key: string]: Array<{ 
      id: number;
      tournament: string; 
      league: string; 
      game: string; 
      originalPrizepool: string; 
      parsedValue: number;
      status: string;
      begin_at: string;
      end_at: string;
    }> } = {}
    
    tournaments.forEach((tournament: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!tournament.prizepool) return
      
      const prizePool = tournament.prizepool
      const parsedValue = parsePrizePool(prizePool)
      
      if (parsedValue === 0) return
      
      const currency = detectCurrency(prizePool)
      
      if (!currencyGroups[currency]) {
        currencyGroups[currency] = []
      }
      
      currencyGroups[currency].push({
        id: tournament.id,
        tournament: tournament.name,
        league: tournament.league.name,
        game: tournament.videogame.name,
        originalPrizepool: prizePool,
        parsedValue,
        status: tournament.status,
        begin_at: tournament.begin_at,
        end_at: tournament.end_at
      })
    })
    
    // Sort each currency group by parsed value (descending)
    Object.keys(currencyGroups).forEach(currency => {
      currencyGroups[currency].sort((a, b) => b.parsedValue - a.parsedValue)
    })

    // Calculate summary statistics
    const summary = Object.entries(currencyGroups).map(([currency, tournaments]) => ({
      currency,
      count: tournaments.length,
      totalValue: tournaments.reduce((sum, item) => sum + item.parsedValue, 0),
      averageValue: tournaments.reduce((sum, item) => sum + item.parsedValue, 0) / tournaments.length,
      maxValue: Math.max(...tournaments.map(t => t.parsedValue)),
      minValue: Math.min(...tournaments.map(t => t.parsedValue))
    })).sort((a, b) => b.totalValue - a.totalValue)

    const responseData = {
      summary,
      currencyGroups,
      metadata: {
        totalTournaments: tournaments.length,
        tournamentsWithPrizepools: Object.values(currencyGroups).flat().length,
        currenciesFound: Object.keys(currencyGroups).length,
        timestamp: new Date().toISOString()
      }
    }

    logger.debug('Prizepool analysis completed', {
      currenciesFound: Object.keys(currencyGroups).length,
      totalTournaments: tournaments.length,
      tournamentsWithPrizepools: Object.values(currencyGroups).flat().length
    })

    return NextResponse.json(responseData)

  } catch (error) {
    logger.error('Error fetching prizepool data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
