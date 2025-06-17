# Analytics Usage Examples

This document provides practical examples of how to use the Google Analytics integration throughout the Esports Tracker application.

## 🎯 Basic Usage

### Import Analytics Functions

```typescript
import {
  trackEvent,
  trackMatchView,
  trackTournamentView,
  trackTeamView,
  trackPlayerView,
  trackOddsAssistantUsage,
  trackMatchClick,
  trackFilter,
  trackNavigation
} from '@/lib/analytics'
```

## 📄 Page-Level Tracking

### Match Details Page

```typescript
// app/matches/[id]/page.tsx
import { trackMatchView } from '@/lib/analytics'
import { useEffect } from 'react'

export default function MatchDetailsPage({ params }: { params: { id: string } }) {
  const { match, loading } = useMatchData(params.id)

  useEffect(() => {
    if (match && !loading) {
      const teams = [match.opponents[0]?.opponent.name, match.opponents[1]?.opponent.name]
      trackMatchView(match.id, teams.filter(Boolean))
    }
  }, [match, loading])

  return (
    <div>
      {/* Match details content */}
    </div>
  )
}
```

### Tournament Details Page

```typescript
// app/tournaments/[tournamentId]/page.tsx
import { trackTournamentView } from '@/lib/analytics'

export default function TournamentDetailsPage({ params }: { params: { tournamentId: string } }) {
  const { tournament, loading } = useTournamentData(params.tournamentId)

  useEffect(() => {
    if (tournament && !loading) {
      trackTournamentView(tournament.id, tournament.name)
    }
  }, [tournament, loading])

  return (
    <div>
      {/* Tournament details content */}
    </div>
  )
}
```

### Team Details Page

```typescript
// app/teams/[teamId]/page.tsx
import { trackTeamView } from '@/lib/analytics'

export default function TeamDetailsPage({ params }: { params: { teamId: string } }) {
  const { team, loading } = useTeamData(params.teamId)

  useEffect(() => {
    if (team && !loading) {
      trackTeamView(team.id, team.name)
    }
  }, [team, loading])

  return (
    <div>
      {/* Team details content */}
    </div>
  )
}
```

## 🎮 Component-Level Tracking

### Match Card Component

```typescript
// app/components/matches/MatchCard.tsx
import { trackMatchClick } from '@/lib/analytics'
import Link from 'next/link'

interface MatchCardProps {
  match: Match
  source: string
}

export default function MatchCard({ match, source }: MatchCardProps) {
  const handleMatchClick = () => {
    const teams = match.opponents.map(o => o.opponent.name).join(' vs ')
    trackMatchClick(match.id, teams, source)
  }

  return (
    <Link href={`/matches/${match.id}`} onClick={handleMatchClick}>
      <div className="match-card">
        {/* Match card content */}
      </div>
    </Link>
  )
}
```

### Tournament Card Component

```typescript
// app/components/tournaments/TournamentCard.tsx
import { trackTournamentClick } from '@/lib/analytics'

export default function TournamentCard({ tournament, source }: TournamentCardProps) {
  const handleClick = () => {
    trackTournamentClick(tournament.id, tournament.name, source)
  }

  return (
    <Link href={`/tournaments/${tournament.id}`} onClick={handleClick}>
      <div className="tournament-card">
        {/* Tournament card content */}
      </div>
    </Link>
  )
}
```

### Search and Filter Components

```typescript
// app/components/SearchFilter.tsx
import { trackSearchPerformed, trackFilter } from '@/lib/analytics'

export default function SearchFilter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [gameFilter, setGameFilter] = useState('')

  const handleSearch = (query: string, results: any[]) => {
    trackSearchPerformed(query, results.length)
  }

  const handleGameFilter = (game: string, filteredResults: any[]) => {
    trackFilter('game', game, filteredResults.length)
    setGameFilter(game)
  }

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(searchQuery, searchResults)
          }
        }}
      />
      
      <select
        value={gameFilter}
        onChange={(e) => handleGameFilter(e.target.value, filteredResults)}
      >
        <option value="">All Games</option>
        <option value="lol">League of Legends</option>
        <option value="csgo">Counter-Strike</option>
      </select>
    </div>
  )
}
```

## 🤖 AI Features Tracking

### Odds Assistant Component

```typescript
// app/components/matches/OddsAssistant.tsx
import { trackOddsAssistantUsage } from '@/lib/analytics'

export default function OddsAssistant({ match }: { match: Match }) {
  const [showAnalysis, setShowAnalysis] = useState(false)

  const handleAnalyzeClick = () => {
    trackOddsAssistantUsage()
    setShowAnalysis(true)
    // Perform analysis...
  }

  return (
    <div>
      <button onClick={handleAnalyzeClick}>
        🤖 Analyze Match with AI
      </button>
      
      {showAnalysis && (
        <div className="analysis-modal">
          {/* AI analysis content */}
        </div>
      )}
    </div>
  )
}
```

## 📊 Performance and Error Tracking

### API Wrapper with Performance Tracking

```typescript
// app/lib/apiWithAnalytics.ts
import { trackAPIPerformance, trackError } from '@/lib/analytics'

export async function fetchWithAnalytics<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(endpoint, options)
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      trackAPIPerformance(endpoint, responseTime, false)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    trackAPIPerformance(endpoint, responseTime, true)
    
    return data
  } catch (error) {
    const responseTime = Date.now() - startTime
    trackAPIPerformance(endpoint, responseTime, false)
    trackError('API_ERROR', error.message, endpoint)
    throw error
  }
}
```

### Error Boundary with Analytics

```typescript
// app/components/ErrorBoundary.tsx
import { trackError } from '@/lib/analytics'
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    trackError('COMPONENT_ERROR', error.message, errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>
    }

    return this.props.children
  }
}
```

## 🧭 Navigation Tracking

### Header Navigation Component

```typescript
// app/components/layout/Navigation.tsx
import { trackNavigation } from '@/lib/analytics'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [previousPath, setPreviousPath] = useState<string>('')

  useEffect(() => {
    if (previousPath && previousPath !== pathname) {
      trackNavigation(previousPath, pathname)
    }
    setPreviousPath(pathname)
  }, [pathname, previousPath])

  return (
    <nav>
      {/* Navigation content */}
    </nav>
  )
}
```

## 🎯 Live Features Tracking

### Live Match Component

```typescript
// app/components/matches/LiveMatch.tsx
import { trackLiveMatchInteraction } from '@/lib/analytics'

export default function LiveMatch({ match }: { match: Match }) {
  const handleRefresh = () => {
    trackLiveMatchInteraction(match.id, 'refresh')
    // Refresh match data...
  }

  const handleStreamClick = () => {
    trackLiveMatchInteraction(match.id, 'stream_click')
    // Open stream...
  }

  const handleOddsView = () => {
    trackLiveMatchInteraction(match.id, 'odds_view')
    // Show odds...
  }

  return (
    <div className="live-match">
      <button onClick={handleRefresh}>🔄 Refresh</button>
      <button onClick={handleStreamClick}>📺 Watch Stream</button>
      <button onClick={handleOddsView}>💰 View Odds</button>
    </div>
  )
}
```

## 🏆 Tournament Features

### Tournament Standings Component

```typescript
// app/components/tournaments/TournamentStandings.tsx
import { trackStandingsView } from '@/lib/analytics'

export default function TournamentStandings({ tournament }: { tournament: Tournament }) {
  useEffect(() => {
    trackStandingsView(tournament.id, tournament.name)
  }, [tournament])

  return (
    <div className="standings">
      {/* Standings content */}
    </div>
  )
}
```

### Team Roster Component

```typescript
// app/components/teams/TeamRoster.tsx
import { trackRosterView } from '@/lib/analytics'

export default function TeamRoster({ 
  team, 
  context = 'team_page' 
}: { 
  team: Team
  context?: string 
}) {
  useEffect(() => {
    trackRosterView(team.id, team.name, context)
  }, [team, context])

  return (
    <div className="team-roster">
      {/* Roster content */}
    </div>
  )
}
```

## 🎮 Game-Specific Tracking

### Game Selection Component

```typescript
// app/components/GameSelector.tsx
import { trackGameEngagement } from '@/lib/analytics'

export default function GameSelector() {
  const handleGameSelect = (gameName: string) => {
    trackGameEngagement(gameName, 'selected')
    // Handle game selection...
  }

  const handleGameHover = (gameName: string) => {
    trackGameEngagement(gameName, 'hovered')
  }

  return (
    <div className="game-selector">
      {games.map(game => (
        <button
          key={game.id}
          onClick={() => handleGameSelect(game.name)}
          onMouseEnter={() => handleGameHover(game.name)}
        >
          {game.name}
        </button>
      ))}
    </div>
  )
}
```

## 📱 Best Practices

### 1. Conditional Tracking
Always check if analytics is enabled:

```typescript
if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
  trackEvent('event_name', 'category', 'label')
}
```

### 2. Debounced Tracking
For high-frequency events, use debouncing:

```typescript
import { useMemo } from 'react'
import { debounce } from 'lodash'

const debouncedTrackSearch = useMemo(
  () => debounce((query: string, results: number) => {
    trackSearchPerformed(query, results)
  }, 1000),
  []
)
```

### 3. Error Handling
Wrap analytics calls in try-catch blocks:

```typescript
const safeTrackEvent = (action: string, category: string, label?: string) => {
  try {
    trackEvent(action, category, label)
  } catch (error) {
    console.warn('Analytics tracking failed:', error)
  }
}
```

### 4. Context-Aware Tracking
Include context information in event labels:

```typescript
const trackMatchViewWithContext = (
  match: Match, 
  source: 'homepage' | 'search' | 'tournament' | 'team_page'
) => {
  const teams = match.opponents.map(o => o.opponent.name).join(' vs ')
  trackEvent('view_match', 'engagement', `${teams} from ${source}`)
}
```

---

🎯 **Use these examples as templates for implementing analytics throughout your esports tracker application!** 
