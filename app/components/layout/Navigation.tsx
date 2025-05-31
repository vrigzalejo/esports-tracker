'use client'

import { Play, Trophy, Users, TrendingUp } from 'lucide-react'
import type { TabType } from '@/types/esports'

interface NavigationProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
}

const tabs = [
    { id: 'matches' as const, label: 'Live Matches', icon: Play },
    { id: 'tournaments' as const, label: 'Tournaments', icon: Trophy },
    { id: 'teams' as const, label: 'Teams', icon: Users },
    { id: 'stats' as const, label: 'Statistics', icon: TrendingUp }
]

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
    return (
        <nav className="bg-gray-800 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-8">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => onTabChange(id)}
                            className={`flex items-center space-x-2 px-3 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === id
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    )
}
