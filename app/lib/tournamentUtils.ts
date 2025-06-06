import type { Tournament } from '@/types/esports'
import { parseLeagueInfo } from './textUtils'

// Get region information with proper parsing
export const parseRegion = (tournament: Tournament): string | null => {
    const region = tournament.region || tournament.league?.region

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

// Get country information from tournament data or infer from region
export const parseCountry = (tournament: Tournament): string | null => {
    // First check if country is directly available
    if (tournament.country) {
        return tournament.country
    }

    const region = tournament.region || tournament.league?.region
    
    if (!region) return null

    // Map regions to countries where applicable
    const regionToCountryMap: { [key: string]: string } = {
        'kr': 'South Korea',
        'cn': 'China',
        'jp': 'Japan',
        'us': 'United States',
        'ca': 'Canada',
        'br': 'Brazil',
        'mx': 'Mexico',
        'de': 'Germany',
        'fr': 'France',
        'uk': 'United Kingdom',
        'se': 'Sweden',
        'dk': 'Denmark',
        'no': 'Norway',
        'fi': 'Finland',
        'ru': 'Russia',
        'au': 'Australia',
        'nz': 'New Zealand'
    }

    const normalizedRegion = region.toString().toLowerCase().replace(/[-_\s]/g, '')
    return regionToCountryMap[normalizedRegion] || null
}

// Get league tier information with proper parsing
export const parseLeagueTier = (tournament: Tournament): string | null => {
    const tier = tournament.tier

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

// Get complete league information with parsing
export const parseLeagueInformation = (tournament: Tournament): string => {
    const league = tournament.league?.name || ''
    const serie = tournament.serie?.full_name || tournament.serie?.name || ''

    const leagueInfo = league && serie ? `${league} - ${serie}` : league || serie
    return parseLeagueInfo(leagueInfo)
}

// Get tournament type information
export const parseTournamentType = (tournament: Tournament): string | null => {
    // Tournament type can be inferred from the tournament name or serie information
    const tournamentName = tournament.name.toLowerCase()
    const serieName = tournament.serie?.name?.toLowerCase() || ''
    
    if (tournamentName.includes('playoff') || serieName.includes('playoff')) return 'Playoffs'
    if (tournamentName.includes('group') || serieName.includes('group')) return 'Group Stage'
    if (tournamentName.includes('qualifier') || serieName.includes('qualifier')) return 'Qualifier'
    if (tournamentName.includes('final') || serieName.includes('final')) return 'Finals'
    if (tournamentName.includes('semifinal') || serieName.includes('semifinal')) return 'Semifinals'
    if (tournamentName.includes('quarterfinal') || serieName.includes('quarterfinal')) return 'Quarterfinals'
    if (tournamentName.includes('swiss') || serieName.includes('swiss')) return 'Swiss Stage'
    if (tournamentName.includes('regular') || serieName.includes('regular')) return 'Regular Season'
    
    return null
} 
