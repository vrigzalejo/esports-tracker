'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Play, Trophy, Users } from 'lucide-react'

export default function Navigation() {
    const pathname = usePathname()

    const navigationItems = [
        { id: 'home', label: 'Home', icon: Home, path: '/' },
        { id: 'matches', label: 'Matches', icon: Play, path: '/matches' },
        { id: 'tournaments', label: 'Tournaments', icon: Trophy, path: '/tournaments' },
        { id: 'teams', label: 'Teams', icon: Users, path: '/teams' },
    ]

    return (
        <nav className="bg-gray-800 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-8 overflow-x-auto">
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.path

                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
