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

    const handleClear = () => {
        setInputValue('')
        onSearch('')
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
                    <div className="flex-1 max-w-lg mx-4 sm:mx-8">
                        <div className="relative flex group">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 focus:bg-gray-800 hover:bg-gray-750 transition-all duration-300 ease-out shadow-lg focus:shadow-blue-500/20"
                                    placeholder="Search matches, tournaments, teams, players..."
                                />
                                
                                {/* Cool Clear Button with animations */}
                                {inputValue && (
                                    <button
                                        onClick={handleClear}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-4 h-4 hover:rotate-90 transition-transform duration-200" />
                                    </button>
                                )}
                            </div>
                            
                            <button
                                onClick={handleSearch}
                                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-r-xl border border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 transition-all duration-300 ease-out cursor-pointer hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 group-hover:shadow-xl"
                                aria-label="Search"
                            >
                                <Search className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
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
                        <div className="relative flex group">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-4 pr-14 py-4 bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 focus:bg-gray-800 hover:bg-gray-750 transition-all duration-300 ease-out shadow-lg focus:shadow-blue-500/20"
                                    placeholder="Search..."
                                    autoFocus
                                />
                                
                                {/* Cool Clear Button for Mobile with animations */}
                                {inputValue && (
                                    <button
                                        onClick={handleClear}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-5 h-5 hover:rotate-90 transition-transform duration-200" />
                                    </button>
                                )}
                            </div>
                            
                            <button
                                onClick={handleSearch}
                                className="px-5 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-r-xl border border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 transition-all duration-300 ease-out cursor-pointer hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 group-hover:shadow-xl"
                                aria-label="Search"
                            >
                                <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
