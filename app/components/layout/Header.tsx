'use client'

import { useState, useEffect } from 'react'
import { Gamepad2, Search } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
    searchTerm: string
    onSearch: (value: string) => void
}

export default function Header({ searchTerm, onSearch }: HeaderProps) {
    const [inputValue, setInputValue] = useState(searchTerm)

    // Sync input value with searchTerm prop when it changes
    useEffect(() => {
        setInputValue(searchTerm)
    }, [searchTerm])

    const handleSearch = () => {
        onSearch(inputValue)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <header className="bg-gray-800 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
                        <Gamepad2 className="w-8 h-8 text-blue-500" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            EsportsTracker
                        </span>
                    </Link>

                    <div className="flex-1 max-w-lg mx-8">
                        <div className="relative flex">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="block w-full px-4 py-2 border border-gray-600 rounded-l-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Search matches, tournaments, teams, players..."
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                    </div>


                </div>
            </div>
        </header>
    )
}
