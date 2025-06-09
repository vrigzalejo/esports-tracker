// Test file for capitalizeWords function
function capitalizeWords(text) {
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

// Test the function
const testInput = "Latin America North ACE Masters Stage season 2 2025";
const result = capitalizeWords(testInput);

console.log('Input:', testInput);
console.log('Output:', result);
console.log('Expected: Latin America North ACE Masters Stage Season 2 2025');
console.log('Match:', result === 'Latin America North ACE Masters Stage Season 2 2025'); 
