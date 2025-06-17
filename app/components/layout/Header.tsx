'use client'

import { useState, useEffect } from 'react'
import { Gamepad2, Search, X, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
    searchTerm: string
    onSearch: (value: string) => void
}

export default function Header({ searchTerm, onSearch }: HeaderProps) {
    const [inputValue, setInputValue] = useState(searchTerm)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Sync input value with searchTerm prop when it changes
    useEffect(() => {
        setInputValue(searchTerm)
    }, [searchTerm])

    const handleSearch = () => {
        onSearch(inputValue)
        setIsSearchOpen(false)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
        if (e.key === 'Escape') {
            setIsSearchOpen(false)
        }
    }

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen)
    }

    return (
        <header className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-[100]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
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
                    <div className="flex-1 max-w-lg mx-4 sm:mx-8 flex">
                        <div className="relative flex w-full">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="block w-full px-4 py-2 border border-gray-600 rounded-l-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                placeholder="Search matches, tournaments, teams, players..."
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 text-white rounded-r-lg border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 min-w-[44px] min-h-[44px] flex items-center justify-center animate-gradient-x bg-300% group cursor-pointer"
                                aria-label="Search"
                            >
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Toggle - Hidden for now since desktop search is always visible */}
                    <div className="hidden">
                        <button
                            onClick={toggleSearch}
                            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Toggle search"
                        >
                            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar - Hidden since desktop search is always visible */}
                {false && isSearchOpen && (
                    <div className="md:hidden pb-4 animate-slide-down">
                        <div className="relative flex">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="block w-full px-4 py-3 border border-gray-600 rounded-l-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                placeholder="Search..."
                                autoFocus
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 text-white rounded-r-lg border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 min-w-[44px] flex items-center justify-center animate-gradient-x bg-300% group"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
