// Centralized tier display utility to ensure consistency across all components
export interface TierDisplayInfo {
    label: string
    color: string
    bgColor: string
    borderColor: string
}

export const getTierDisplay = (tier: string): TierDisplayInfo => {
    const tierMap: { [key: string]: TierDisplayInfo } = {
        'S': { label: 'S-Tier', color: 'text-yellow-300', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/40' },
        'A': { label: 'A-Tier', color: 'text-orange-300', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/40' },
        'B': { label: 'B-Tier', color: 'text-blue-300', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/40' },
        'C': { label: 'C-Tier', color: 'text-green-300', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/40' },
        'D': { label: 'D-Tier', color: 'text-gray-300', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/40' },
    }
    
    const tierKey = tier?.toUpperCase()
    const tierInfo = tierMap[tierKey] || { label: tier, color: 'text-purple-300', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/40' }
    
    return tierInfo
} 
