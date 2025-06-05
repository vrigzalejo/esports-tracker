// Helper function to capitalize first letter of words
export function capitalizeWords(text: string): string {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
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