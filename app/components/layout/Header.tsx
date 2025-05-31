'use client'

import { useState } from 'react'
import { Gamepad2, Search } from 'lucide-react'

interface HeaderProps {
    searchTerm: string
    onSearchChange: (term: string) => void
}

export default function Header({ searchTerm, onSearchChange }: HeaderProps) {
    return (
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Gamepad2 className="w-8 h-8 text-blue-500" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                EsportsTracker
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search matches, teams..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
