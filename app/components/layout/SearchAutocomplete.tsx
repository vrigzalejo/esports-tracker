'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, Trophy, Users, User, ChevronRight } from 'lucide-react'


import { Tournament, Team } from '@/types/esports'
import { Player } from '@/types/roster'

interface SearchResult {
  id: string
  type: 'tournament' | 'team' | 'player'
  title: string
  subtitle?: string
  image?: string
  url: string
  data: Tournament | Team | Player
}

interface SearchAutocompleteProps {
  searchTerm: string
  onSearch: (value: string) => void
  className?: string
}

export default function SearchAutocomplete({ searchTerm, onSearch, className = '' }: SearchAutocompleteProps) {
  // Search configuration
  const RESULTS_PER_CATEGORY = 12
  const MAX_TOTAL_RESULTS = 12
  const API_PER_PAGE = 12 // Fetch more from API than we display for better filtering
  
  const [inputValue, setInputValue] = useState(searchTerm)
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync input value with searchTerm prop
  useEffect(() => {
    setInputValue(searchTerm)
  }, [searchTerm])

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap - no scroll offset needed for fixed positioning
        left: rect.left,
        width: rect.width
      })
    }
  }, [])

  // Close dropdown when clicking outside and handle position updates
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // Don't close if clicking on search input or dropdown content
      if (searchRef.current && !searchRef.current.contains(target)) {
        // Check if click is on a dropdown item (which is rendered in portal)
        const clickedElement = target as Element
        if (clickedElement?.closest && !clickedElement.closest('[data-search-dropdown]')) {
          setIsOpen(false)
          setSelectedIndex(-1)
        }
      }
    }

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isOpen, updateDropdownPosition])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const searchResults = await performSearch(query)
        setResults(searchResults)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  // Perform search across all data types
  const performSearch = async (query: string): Promise<SearchResult[]> => {
    const searchPromises = [
      searchTournaments(query),
      searchTeams(query),
      searchPlayers(query)
    ]

    const [tournaments, teams, players] = await Promise.all(searchPromises)
    
    // Combine and limit results
    const allResults = [...tournaments, ...teams, ...players]
    return allResults.slice(0, MAX_TOTAL_RESULTS)
  }



  // Search tournaments
  const searchTournaments = async (query: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`/api/tournaments?per_page=${API_PER_PAGE}`)
      const rawData = await response.json()
      
      console.log('Tournament search - Query:', query)
      console.log('Tournament search - Raw response type:', typeof rawData)
      console.log('Tournament search - Raw response:', rawData)
      
      // Handle different response formats
      let tournaments: Tournament[]
      if (Array.isArray(rawData)) {
        tournaments = rawData
      } else if (rawData.data && Array.isArray(rawData.data)) {
        tournaments = rawData.data
      } else {
        console.error('Unexpected tournament API response format:', rawData)
        return []
      }
      
      console.log('Tournament search - Tournaments array length:', tournaments.length)
      console.log('Tournament search - First tournament:', tournaments[0])
      
      const filteredTournaments = tournaments.filter(tournament => {
        if (!tournament || !tournament.name) {
          console.log('Tournament missing name:', tournament)
          return false
        }
        
        const nameMatch = tournament.name?.toLowerCase().includes(query.toLowerCase())
        const leagueMatch = tournament.league?.name?.toLowerCase().includes(query.toLowerCase())
        const serieMatch = tournament.serie?.name?.toLowerCase().includes(query.toLowerCase())
        const serieFullMatch = tournament.serie?.full_name?.toLowerCase().includes(query.toLowerCase())
        const gameMatch = tournament.videogame?.name?.toLowerCase().includes(query.toLowerCase())
        
        const matches = nameMatch || leagueMatch || serieMatch || serieFullMatch || gameMatch
        
        if (matches) {
          console.log('Tournament match found:', {
            name: tournament.name,
            league: tournament.league?.name,
            serie: tournament.serie?.name,
            serieFullName: tournament.serie?.full_name,
            game: tournament.videogame?.name,
            matchedBy: { nameMatch, leagueMatch, serieMatch, serieFullMatch, gameMatch }
          })
        }
        
        return matches
      })
      
      console.log('Tournament search - Filtered count:', filteredTournaments.length)
      
      return filteredTournaments
        .slice(0, RESULTS_PER_CATEGORY)
        .map(tournament => ({
          id: `tournament-${tournament.id}`,
          type: 'tournament' as const,
          title: tournament.name,
          subtitle: `${tournament.videogame?.name || 'Multi-Game'} • ${tournament.league?.name || 'Unknown League'}`,
          image: tournament.league?.image_url,
          url: `/tournaments/${tournament.id}`,
          data: tournament
        }))
    } catch (error) {
      console.error('Error searching tournaments:', error)
      return []
    }
  }

  // Search teams
  const searchTeams = async (query: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`/api/teams?per_page=${API_PER_PAGE}&search=${encodeURIComponent(query)}`)
      const teams: Team[] = await response.json()
      
      return teams
        .filter(team => 
          team.name?.toLowerCase().includes(query.toLowerCase()) ||
          team.acronym?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, RESULTS_PER_CATEGORY)
        .map(team => ({
          id: `team-${team.id}`,
          type: 'team' as const,
          title: team.name,
          subtitle: `${team.current_videogame?.name || 'Multi-Game'} • ${team.acronym ? `${team.acronym} • ` : ''}${team.location || 'Unknown Location'}`,
          image: team.image_url,
          url: `/teams/${team.id}`,
          data: team
        }))
    } catch (error) {
      console.error('Error searching teams:', error)
      return []
    }
  }

  // Search players
  const searchPlayers = async (query: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`/api/players?per_page=${API_PER_PAGE}&search=${encodeURIComponent(query)}`)
      const players: Player[] = await response.json()
      
      return players
        .filter(player => 
          player.name?.toLowerCase().includes(query.toLowerCase()) ||
          player.first_name?.toLowerCase().includes(query.toLowerCase()) ||
          player.last_name?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, RESULTS_PER_CATEGORY)
        .map(player => ({
          id: `player-${player.id}`,
          type: 'player' as const,
          title: player.name,
          subtitle: `${player.current_videogame?.name || 'Multi-Game'} • ${player.current_team?.name || 'Free Agent'} • ${player.nationality || 'Unknown'}`,
          image: player.image_url || undefined,
          url: `/players/${player.id}`,
          data: player
        }))
    } catch (error) {
      console.error('Error searching players:', error)
      return []
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setSelectedIndex(-1)
    
    if (value.trim()) {
      updateDropdownPosition()
      setIsOpen(true)
      debouncedSearch(value)
    } else {
      setIsOpen(false)
      setResults([])
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle search submission
  const handleSearch = () => {
    onSearch(inputValue)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    console.log('Clicking result:', result.title, 'URL:', result.url)
    
    // Use direct navigation for more reliable results
    console.log('Navigating to:', result.url)
    window.location.href = result.url
  }

  // Handle clear
  const handleClear = () => {
    setInputValue('')
    onSearch('')
    setIsOpen(false)
    setResults([])
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Get icon for result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'tournament': return Trophy
      case 'team': return Users
      case 'player': return User
      default: return Search
    }
  }



  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  return (
    <div ref={searchRef} className={`relative ${className}`} style={{ zIndex: 99998 }}>
      <div className="relative flex group">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.trim()) {
                updateDropdownPosition()
                setIsOpen(true)
              }
            }}
            className="w-full pl-4 pr-10 py-3 bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 focus:bg-gray-800 hover:bg-gray-750 transition-all duration-300 ease-out shadow-lg focus:shadow-blue-500/20"
            placeholder="Search tournaments, teams, players..."
            autoComplete="off"
          />
          
          {/* Clear Button */}
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
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

            {/* Dropdown Results - Rendered as Portal */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div 
          data-search-dropdown="true"
          className="fixed bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-xl shadow-2xl shadow-black/50 max-h-96 overflow-y-auto scrollbar-thin" 
          style={{ 
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 99999
          }}
        >
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {Object.entries(groupedResults).map(([type, typeResults]) => (
                <div key={type}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700/50">
                    {type}s ({typeResults.length})
                  </div>
                  {typeResults.map((result) => {
                    const globalIndex = results.findIndex(r => r.id === result.id)
                    const Icon = getResultIcon(result.type)
                    
                    return (
                      <button
                        key={result.id}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleResultClick(result)
                        }}
                        className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700/50 transition-colors duration-200 text-left cursor-pointer ${
                          selectedIndex === globalIndex ? 'bg-gray-700/70' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 relative">
                          <div className={`relative w-8 h-8 ${
                            result.type === 'player' 
                              ? 'bg-gradient-to-br from-gray-600/80 to-gray-700/80 rounded-lg' 
                              : 'bg-gray-600/60 rounded-xl'
                          } border border-gray-700/40 hover:border-gray-600/60 transition-colors duration-200 overflow-hidden`}>
                            {result.image ? (
                              <img
                                src={result.image}
                                alt={result.title}
                                className={result.type === 'player' ? 'w-full h-full object-cover' : 'w-full h-full object-contain rounded-xl p-1.5'}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  if (result.type === 'player') {
                                    target.src = '/images/placeholder-player.svg'
                                  } else {
                                    target.src = '/images/placeholder-team.svg'
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {result.title}
                          </div>
                          {result.subtitle && (
                            <div className="text-gray-400 text-sm truncate">
                              {result.subtitle}
                            </div>
                          )}
                        </div>
                        
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : inputValue.trim() ? (
            <div className="p-4 text-center text-gray-400">
              No results found for &ldquo;{inputValue}&rdquo;
            </div>
          ) : null}
        </div>,
        document.body
      )}
    </div>
  )
}

// Debounce utility function
function debounce(func: (query: string) => Promise<void>, wait: number) {
  let timeout: NodeJS.Timeout | null = null
  
  return (query: string) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(query), wait)
  }
} 