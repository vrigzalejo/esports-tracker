'use client'

import { Gamepad2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import SearchAutocomplete from './SearchAutocomplete'

interface HeaderProps {
    searchTerm: string
    onSearch: (value: string) => void
}

export default function Header({ searchTerm, onSearch }: HeaderProps) {

    return (
        <header className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-[98] overflow-visible">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
                <div className="flex items-center justify-between h-16 overflow-visible">
                    {/* Enhanced Logo */}
                    <Link href="/" className="flex items-center space-x-2 hover:scale-105 transition-all duration-300 cursor-pointer flex-shrink-0 group animate-glitch">
                        <div className="relative drop-shadow-lg hover:drop-shadow-xl transition-all duration-300">
                            <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-pulse-glow group-hover:animate-spin group-hover:text-purple-500 transition-colors duration-300 filter drop-shadow-sm" />
                            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300 drop-shadow-sm" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x bg-300% group-hover:from-pink-500 group-hover:via-purple-500 group-hover:to-blue-400 transition-all duration-500 group-hover:animate-neon-glow drop-shadow-sm">
                            <span className="hidden sm:inline">EsportsTracker</span>
                            <span className="sm:hidden">ET</span>
                        </span>
                    </Link>

                    {/* Desktop Search */}
                    <SearchAutocomplete 
                        searchTerm={searchTerm} 
                        onSearch={onSearch}
                        className="flex-1 max-w-lg mx-4 sm:mx-8"
                    />

                </div>
            </div>
        </header>
    )
}
