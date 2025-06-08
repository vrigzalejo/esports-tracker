// Helper function to capitalize first letter of words
export function capitalizeWords(text: string): string {
    if (!text) return text;
    
    // Words that should always be capitalized regardless of position
    const alwaysCapitalize = new Set([
        'season', 'stage', 'masters', 'championship', 'tournament', 'league', 
        'series', 'playoffs', 'finals', 'qualifier', 'qualifiers', 'group',
        'bracket', 'round', 'match', 'game', 'cup', 'open', 'pro', 'elite',
        'premier', 'major', 'minor', 'regional', 'national', 'international',
        'world', 'global', 'europe', 'america', 'asia', 'north', 'south',
        'east', 'west', 'central', 'latin', 'valorant', 'changers', 'ace'
    ]);
    
    // Words that should remain lowercase unless at the beginning
    const keepLowercase = new Set([
        'and', 'or', 'but', 'nor', 'for', 'yet', 'so', 'a', 'an', 'the',
        'in', 'on', 'at', 'by', 'to', 'of', 'vs', 'v'
    ]);
    
    return text.split(' ').map((word, index) => {
        if (!word) return word;
        
        const lowerWord = word.toLowerCase();
        
        // Always capitalize first word
        if (index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        
        // Always capitalize certain words
        if (alwaysCapitalize.has(lowerWord)) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        
        // Keep certain words lowercase unless they're the first word
        if (keepLowercase.has(lowerWord)) {
            return lowerWord;
        }
        
        // Handle numbers and mixed alphanumeric (like "2025", "3rd", etc.)
        if (/^\d/.test(word) || /\d/.test(word)) {
            return word;
        }
        
        // Default: capitalize first letter
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}

// Helper function to parse and format dates consistently
export function parseDateTime(dateString: string, options?: {
    includeDate?: boolean;
    includeTime?: boolean;
    timeOnly?: boolean;
    includeYear?: boolean;
}): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const { includeDate = true, includeTime = true, timeOnly = false, includeYear = true } = options || {};
    
    if (timeOnly) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    const formatOptions: Intl.DateTimeFormatOptions = {};
    
    if (includeDate) {
        formatOptions.month = 'short';
        formatOptions.day = 'numeric';
        if (includeYear) {
            formatOptions.year = 'numeric';
        }
    }
    
    if (includeTime) {
        formatOptions.hour = '2-digit';
        formatOptions.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', formatOptions);
}

// Helper function to get the best available date from match data
export function getMatchDateTime(match: { scheduled_at?: string; begin_at: string }): string {
    return match.scheduled_at || match.begin_at;
}

// Helper function to format date ranges for matches with clean formatting
export function formatMatchDateRange(match: {
    scheduled_at?: string;
    begin_at: string;
    end_at?: string;
    status: string;
}, options?: {
    includeWeekday?: boolean;
    includeYear?: boolean;
}): string {
    const { includeWeekday = false, includeYear = false } = options || {};
    const startDate = new Date(match.scheduled_at || match.begin_at);
    
    if ((match.status === 'finished' || match.status === 'completed') && match.end_at) {
        const endDate = new Date(match.end_at);
        
        // Format start date
        const dateOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric'
        };
        
        if (includeWeekday) dateOptions.weekday = 'short';
        if (includeYear) dateOptions.year = 'numeric';
        
        const dateStr = startDate.toLocaleDateString('en-US', dateOptions);
        
        // Format start time
        const startTime = startDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        // Format end time with timezone
        const endTime = endDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        });
        
        return `${dateStr}, ${startTime} - ${endTime}`;
    } else {
        // For live/upcoming matches, show full date and time
        const dateTimeOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        };
        
        if (includeWeekday) dateTimeOptions.weekday = 'short';
        if (includeYear) dateTimeOptions.year = 'numeric';
        
        return startDate.toLocaleDateString('en-US', dateTimeOptions);
    }
}

// Helper function to clean and parse league information text
export function parseLeagueInfo(leagueInfo: string): string {
    if (!leagueInfo) return leagueInfo;
    
    // Split by common separators including colons
    const parts = leagueInfo.split(/\s*[-–—•|:]\s*/).filter(part => part.trim());
    
    if (parts.length <= 1) return capitalizeWords(leagueInfo);
    
    // Remove duplicate or redundant parts with better logic
    const cleanedParts = parts.reduce((acc: string[], current: string) => {
        const currentTrimmed = current.trim();
        const currentLower = currentTrimmed.toLowerCase();
        
        // Skip empty parts
        if (!currentTrimmed) return acc;
        
        // Check for exact duplicates
        const isExactDuplicate = acc.some(existing => 
            existing.toLowerCase() === currentLower
        );
        
        if (isExactDuplicate) return acc;
        
        // Check for redundant containment (but be more selective)
        const isRedundant = acc.some(existing => {
            const existingLower = existing.toLowerCase();
            
            // Only consider it redundant if one completely contains the other
            // and they're not just sharing common words like "series" or "season"
            const currentContainsExisting = currentLower.includes(existingLower) && 
                currentLower.length > existingLower.length + 5; // significant difference
            const existingContainsCurrent = existingLower.includes(currentLower) && 
                existingLower.length > currentLower.length + 5; // significant difference
            
            return currentContainsExisting || existingContainsCurrent;
        });
        
        if (!isRedundant) {
            acc.push(currentTrimmed);
        }
        
        return acc;
    }, []);
    
    // If we reduced to one part, return it with capitalization
    if (cleanedParts.length === 1) {
        return capitalizeWords(cleanedParts[0]);
    }
    
    // Join with a cleaner separator and capitalize
    return capitalizeWords(cleanedParts.join(' • '));
}

// Helper function to clean match names by removing team names
export function cleanMatchName(matchName: string | undefined | null): string {
    if (!matchName || matchName.trim() === '') return '';
    
    // Split by colon to separate match type from teams
    const parts = matchName.split(':');
    if (parts.length < 2) {
        // If no colon, check if it's just a "Team vs Team" pattern
        const vsPattern = /^[^:]+\s+vs\s+[^:]+$/i;
        if (vsPattern.test(matchName.trim())) {
            return ''; // Return empty string for "Team vs Team" patterns
        }
        return matchName;
    }
    
    // Take only the first part (match type) and clean it up
    const matchType = parts[0].trim();
    
    // Check if the match type is just team names (contains "vs" or "v")
    const teamVsPattern = /^[^:]*\b(vs?|versus)\b[^:]*$/i;
    if (teamVsPattern.test(matchType)) {
        return ''; // Return empty string if match type is just team names
    }
    
    // Capitalize each word in the match type
    const capitalizedMatchType = matchType
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    return capitalizedMatchType;
} 
