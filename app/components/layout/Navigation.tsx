'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Play, Trophy, Users, User } from 'lucide-react'

export default function Navigation() {
    const pathname = usePathname()

    const navigationItems = [
        { id: 'home', label: 'Home', icon: Home, path: '/' },
        { id: 'matches', label: 'Matches', icon: Play, path: '/matches' },
        { id: 'tournaments', label: 'Tournaments', icon: Trophy, path: '/tournaments' },
        { id: 'teams', label: 'Teams', icon: Users, path: '/teams' },
        { id: 'players', label: 'Players', icon: User, path: '/players' },
    ]

    return (
        <nav className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-16 z-[100] shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Desktop Navigation */}
                <div className="hidden md:flex">
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.path

                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                                        ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                                        : 'border-transparent text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-700/30'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </div>

                {/* Mobile/Tablet Navigation */}
                <div className="md:hidden">
                    <div className="flex justify-between items-center py-3">
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.path

                            return (
                                <Link
                                    key={item.id}
                                    href={item.path}
                                    className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer flex-1 mx-1 ${isActive
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium leading-tight">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </nav>
    )
}
