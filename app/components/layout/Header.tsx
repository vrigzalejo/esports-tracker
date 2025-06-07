'use client'

import { Gamepad2, Search, Bell, User } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
    searchTerm: string
    onSearchChange: (value: string) => void
}

export default function Header({ searchTerm, onSearchChange }: HeaderProps) {
    return (
        <header className="bg-gray-800 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <Gamepad2 className="w-8 h-8 text-blue-500" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            EsportsTracker
                        </span>
                    </Link>

                    <div className="flex-1 max-w-lg mx-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Search matches, tournaments, teams..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button 
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                        </button>
                        <button 
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                            aria-label="User profile"
                        >
                            <User className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
