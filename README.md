# Esports Tracker - Next.js 15 + Tailwind CSS 4

A modern, full-featured esports tracking application built with Next.js 15, Tailwind CSS 4, and TypeScript. Track live matches, tournaments, teams, and statistics across multiple esports titles using the PandaScore API.

## 🚀 Features

### Core Functionality
- **Live Match Tracking**: Real-time match status with live indicators and countdown timers
- **AI Match Analysis**: Advanced AI-powered match predictions with multiple LLM support and smart fallback
- **Enhanced Match Details**: Comprehensive match information with score cards, team rosters, and recent performance
- **Tournament Management**: Complete tournament listings with detailed tournament pages, standings, matches, and prize pools
- **Team Analytics**: Team profiles with ratings, statistics, recent match history, and championship tracking
- **Advanced Search & Filtering**: Filter by game, team, tournament, or match status with real-time results
- **Responsive Design**: Mobile-first approach with smooth animations and modern UI

### Enhanced UI/UX Features
- **Glassmorphism Design**: Modern glass-morphism effects with backdrop blur and gradient backgrounds
- **Clean Team Images**: Proper logo containment with gradient overlays and hover animations
- **Smart Text Formatting**: Intelligent capitalization for match names, tournament titles, and league information with region acronym handling
- **Interactive Navigation**: Seamless navigation between tournaments, teams, and matches with consistent cursor styling
- **Match Name Cleaning**: Automatic removal of redundant team names from match titles for cleaner display
- **Games Format Display**: BO3, BO5 format indicators alongside match information
- **Status Indicators**: Live, completed, and upcoming match badges with animations and color coding

### Tournament Details System
- **Comprehensive Tournament Pages**: Dedicated pages for each tournament with complete information
- **Tournament Navigation**: Click-to-navigate from tournament cards, images, and names throughout the app
- **Real-time Match Display**: Tournament matches with enhanced visual design and team navigation
- **Dynamic Standings**: Calculated standings based on actual match results with win/loss tracking
- **Tournament Winner Display**: Special highlighting for tournament champions with roster information
- **Teams & Rosters**: Complete team rosters with player details, flags, roles, and ages
- **Tournament Info Sidebar**: Dates, times, game information, and location details with timezone support

### Match Details System
- **Interactive Score Cards**: Beautiful score displays with team logos and winner highlighting
- **Enhanced Match Cards**: Glass-morphism design with hover effects, glow animations, and improved typography
- **AI Match Predictions**: Professional esports analysis with odds calculation, confidence scoring, and detailed reasoning
- **Team Navigation**: Click team logos and names to navigate to team detail pages
- **Recent Team Matches**: Track team performance with W/L indicators and detailed match results
- **Tournament Context**: See tournament standings and related matches
- **Escape Key Support**: Quick modal navigation with keyboard shortcuts
- **Match Header**: Comprehensive match information with league, serie, and tournament details

### Team Management
- **Detailed Team Profiles**: Comprehensive team information with recent roster and match history
- **Championship History**: Track team achievements across tournaments with navigation to tournament details
- **Recent Championships Section**: Clean display of team wins with dates, times, and prize pools
- **Player Information**: Complete player profiles with nationality flags, age, role, and birthday information
- **Match Statistics**: Win/loss records and recent performance metrics
- **Tournament Participation**: View all tournaments a team has participated in with detailed roster information

### Timezone & Date Handling
- **User Timezone Conversion**: All dates and times displayed in user's current timezone
- **Comprehensive Date Display**: Start and end dates with times and timezone abbreviations
- **Tournament Scheduling**: Complete tournament timeline with proper timezone handling
- **Match Timing**: Accurate match scheduling with timezone-aware displays

### Technical Highlights
- **Next.js 15**: Latest features including Turbopack and improved performance
- **Tailwind CSS 4**: Modern styling with custom animations and gradients
- **TypeScript**: Full type safety throughout the application
- **Scalable AI System**: Multi-provider LLM architecture with automatic failover and priority-based selection
- **Optimized Performance**: Memoized components and efficient data fetching
- **Component Architecture**: Modular, reusable components with proper error handling
- **Custom Hooks**: Optimized data fetching and state management
- **API Integration**: Comprehensive PandaScore API wrapper with caching
- **Text Utilities**: Advanced text processing for consistent formatting with region acronym support
- **Timezone Utilities**: Robust timezone handling and date formatting
- **EOF Compliance**: Proper file endings for better Git compatibility

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd esports-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your PandaScore API token to .env.local

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:

```env
PANDASCORE_TOKEN=your_api_token_here
HUGGINGFACE_API_TOKEN=your_huggingface_token_here  # Optional: For AI match analysis
```

### API Setup

#### PandaScore API (Required)
1. Visit [pandascore.co](https://pandascore.co)
2. Create a free account
3. Generate an API token
4. Add the token to your environment variables

#### Hugging Face API (Optional - For AI Analysis)
1. Visit [huggingface.co](https://huggingface.co)
2. Create a free account
3. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new token with "Read" permissions
5. Add `HUGGINGFACE_API_TOKEN=your_token_here` to your `.env.local`

**Note**: The AI analysis system works without any API tokens by falling back to enhanced algorithmic analysis. Hugging Face integration is optional but provides superior AI-powered predictions.

## 📁 Project Structure

```
app/
├── api/                    # API routes
│   ├── analyze-match/     # AI match analysis endpoint
│   ├── matches/           # Match endpoints
│   ├── tournaments/       # Tournament endpoints
│   │   └── [tournamentId]/ # Tournament-specific data
│   │       ├── route.ts   # Tournament details
│   │       ├── standings/ # Tournament standings
│   │       ├── matches/   # Tournament matches
│   │       └── rosters/   # Team rosters
│   └── teams/            # Team endpoints
│       └── [teamId]/     # Team-specific data
│           ├── matches/   # Team match history
│           ├── tournaments/ # Team tournament participation
│           ├── leagues/   # Team league information
│           └── series/    # Team series data
├── config/               # Configuration files
│   └── ai-models.ts     # AI model configurations and provider settings
├── tournaments/          # Tournament pages
│   └── [tournamentId]/  # Dynamic tournament detail pages
│       └── page.tsx     # Tournament detail page
├── teams/               # Team pages
│   └── [teamId]/       # Dynamic team detail pages
│       └── page.tsx    # Team detail page
├── components/          # Reusable components
│   ├── layout/         # Layout components (Header, Footer, Navigation)
│   │   ├── Header.tsx  # Main header with search functionality
│   │   ├── Navigation.tsx # Navigation bar with active states
│   │   └── Footer.tsx  # Footer with links and branding
│   ├── matches/        # Match-related components
│   │   ├── MatchCard.tsx # Enhanced match display cards with glass-morphism
│   │   ├── MatchDetails.tsx # Detailed match view with team navigation
│   │   ├── MatchHeader.tsx # Match header with stream links
│   │   ├── MatchInfo.tsx # Match information display
│   │   ├── OddsAssistant.tsx # AI-powered match analysis modal with predictions
│   │   ├── TeamMatches.tsx # Team match history
│   │   ├── TeamRoster.tsx # Team roster display
│   │   └── MatchesContent.tsx # Main matches page content
│   ├── tournaments/    # Tournament components
│   │   ├── TournamentDetailsContent.tsx # Comprehensive tournament details page
│   │   ├── TournamentStandings.tsx # Smart standings with calculated results
│   │   ├── TournamentMatches.tsx # Tournament match lists with navigation
│   │   ├── TournamentCard.tsx # Tournament display cards with navigation
│   │   └── TournamentsContent.tsx # Main tournaments page content
│   ├── teams/         # Team components
│   │   ├── TeamDetailsContent.tsx # Comprehensive team details with championships
│   │   ├── TeamsContent.tsx # Main teams page content
│   │   └── TeamDisplay.tsx # Enhanced team display with navigation
│   ├── ui/            # UI components
│   │   ├── StatCard.tsx # Statistics display cards
│   │   └── AlphaBanner.tsx # Alpha version banner
│   └── debug/         # Debug components
│       └── CacheStatus.tsx # Cache status indicator
├── hooks/             # Custom React hooks
│   ├── useEsportsData.tsx # Data fetching hooks
│   └── useMatchData.tsx # Match-specific data hooks with timezone handling
├── lib/               # Utilities and API
│   ├── textUtils.ts   # Text formatting, capitalization, and region acronym utilities
│   ├── tournamentUtils.ts # Tournament-specific utilities
│   ├── timezoneUtils.ts # Timezone handling and date formatting
│   └── pandaScore.ts  # PandaScore API wrapper
├── types/             # TypeScript definitions
│   └── esports.ts     # Esports data type definitions
└── globals.css       # Global styles with custom animations
```

## 🎮 Supported Games

The application supports all games available through PandaScore:
- League of Legends
- Counter-Strike 2
- Dota 2
- Valorant
- Overwatch 2
- Rainbow Six Siege
- Rocket League
- And many more!

## 🔌 API Integration

### Available Endpoints

#### Match Endpoints
- `GET /api/matches` - Match data with real-time updates and filtering
- `POST /api/analyze-match` - AI-powered match analysis with predictions and odds
- `GET /api/teams/[teamId]/matches` - Team-specific match history

#### Tournament Endpoints
- `GET /api/tournaments` - Tournament listings with search and filtering
- `GET /api/tournaments/[tournamentId]` - Individual tournament details
- `GET /api/tournaments/[tournamentId]/standings` - Tournament standings
- `GET /api/tournaments/[tournamentId]/matches` - Tournament matches
- `GET /api/tournaments/[tournamentId]/rosters` - Team rosters for tournament

#### Team Endpoints
- `GET /api/teams` - Team profiles and statistics with search
- `GET /api/teams/[teamId]` - Individual team details
- `GET /api/teams/[teamId]/tournaments` - Team tournament participation
- `GET /api/teams/[teamId]/leagues` - Team league information
- `GET /api/teams/[teamId]/series` - Team series data

### Using the API

#### PandaScore API Wrapper
```typescript
import { getMatches, getTournamentStandings, getTeamMatches } from '@/lib/pandaScore'

// Fetch live matches
const liveMatches = await getMatches({
  filter: { status: 'running' }
})

// Get tournament standings
const standings = await getTournamentStandings('tournament-id')

// Get team match history
const teamMatches = await getTeamMatches('team-id')
```

#### AI Match Analysis
```typescript
// Analyze a match with AI predictions
const response = await fetch('/api/analyze-match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ match: matchData })
})

const { analysis } = await response.json()
// Returns: odds, prediction, confidence, reasoning, keyFactors
```

## 🎨 UI/UX Features

### Design System
- **Modern Glassmorphism**: Backdrop blur effects and translucent elements throughout
- **Enhanced Match Cards**: Glass-morphism design with hover animations, glow effects, and improved typography
- **Clean Team Images**: Gradient backgrounds with proper logo containment and padding
- **Gradient Accents**: Beautiful color transitions and hover effects
- **Responsive Grid Layouts**: Adaptive layouts for all screen sizes
- **Loading States**: Skeleton animations and smooth transitions
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### Interactive Elements
- **Comprehensive Navigation**: Click-to-navigate from tournament cards, team logos, league images, and names
- **Consistent Cursor Styling**: Pointer cursors on all clickable elements
- **Hover Animations**: Smooth transitions and micro-interactions with scale and glow effects
- **Modal System**: Escape key support and backdrop click handling with keyboard navigation
- **Status Indicators**: Live match indicators and status badges with animations
- **Score Displays**: Winner highlighting and team comparison cards
- **AI Analysis Modal**: Professional match analysis interface with clear provider identification

### Text Formatting
- **Smart Capitalization**: Intelligent text formatting for match names and tournament titles
- **Region Acronym Handling**: Proper capitalization of region acronyms (EMEA, APAC, etc.)
- **Match Name Cleaning**: Automatic removal of team information from match titles
- **League Information Parsing**: Proper formatting of league, serie, and tournament names
- **Prize Pool Formatting**: Currency detection and proper formatting

### Tournament Features
- **Tournament Detail Pages**: Comprehensive tournament information with matches, standings, and team rosters
- **Dynamic Standings**: Real-time calculation of team standings based on match results
- **Tournament Winner Display**: Special highlighting for champions with roster information
- **Teams & Rosters Section**: Complete team information with player details and flags
- **Tournament Navigation**: Seamless navigation between related tournaments, teams, and matches

### Team Features
- **Team Detail Pages**: Comprehensive team profiles with tournament history and achievements
- **Championship Tracking**: Recent championships section with tournament navigation
- **Player Information**: Detailed player profiles with nationality flags, roles, and ages
- **Tournament Participation**: Complete tournament history with roster information

### Timezone & Date Features
- **User Timezone Display**: All dates and times shown in user's current timezone
- **Comprehensive Date Information**: Start and end dates with times and timezone abbreviations
- **Tournament Scheduling**: Complete timeline information with proper timezone handling

### Accessibility
- **Keyboard Navigation**: Full keyboard support for modals and interactions with Escape key handling
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Clear focus indicators and logical tab order
- **Clear AI Feedback**: Transparent messaging about which analysis system is active

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤖 AI Analysis System

### Scalable LLM Architecture
- **Multi-Provider Support**: DeepSeek, Mistral, Llama, and extensible for GPT-4, Claude, Gemini
- **Priority-Based Fallback**: Automatic failover between AI models based on availability and performance
- **Provider Factory Pattern**: Centralized management of AI providers with dynamic registration
- **Configuration-Driven**: External config file for easy model management and scaling
- **Smart Fallback**: Always reliable with enhanced algorithmic analysis as final fallback

### AI Features
- **Professional Match Analysis**: Comprehensive esports predictions with odds calculation
- **Confidence Scoring**: AI-generated confidence levels (55-88% range) based on multiple factors
- **Detailed Reasoning**: 5-point analysis explaining prediction rationale
- **Key Factors Analysis**: Tournament prestige, regional advantage, series format, game meta, team professionalism
- **Real-time Processing**: Fast analysis with processing indicators and smooth UX
- **Smart Model Detection**: Intelligent UI branding that accurately reflects which AI system is active
- **Seamless Fallback Experience**: Transparent switching between AI and algorithmic analysis with appropriate messaging

### Supported AI Models
- **DeepSeek V3** (Primary): Advanced reasoning and esports knowledge
- **Mistral 7B**: Fast and efficient analysis
- **Llama 2**: Reliable open-source alternative
- **Enhanced Algorithmic**: Sophisticated fallback with professional esports analysis
- **Extensible**: Easy to add GPT-4, Claude 3, Gemini Pro, and other providers

### AI System Reliability
- **Intelligent Model Detection**: Accurate identification of active analysis system with appropriate UI branding
- **Transparent Fallback**: Clear messaging when switching between AI and algorithmic analysis
- **100% Uptime**: Always functional with smart algorithmic fallback when AI providers are unavailable
- **User-Friendly Feedback**: Proper error handling with helpful configuration guidance

## 📊 Performance Optimizations

- **Core Web Vitals**: Optimized for excellent performance scores
- **Component Memoization**: Prevents unnecessary re-renders
- **Efficient Data Fetching**: Smart caching and request deduplication
- **AI Response Caching**: Intelligent caching of AI analysis results
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with lazy loading and proper error handling
- **Bundle Analysis**: Optimized bundle sizes and tree shaking
- **Text Processing**: Efficient text utilities for consistent formatting
- **Height Matching**: Dynamic height calculations for consistent layouts

## 🔧 Development Features

### Code Quality
- **TypeScript**: Full type safety throughout the application
- **EOF Compliance**: Proper file endings for all source files
- **Consistent Styling**: Unified approach to component styling and interactions
- **Error Boundaries**: Proper error handling and fallback components
- **Linter Compliance**: Clean code with proper TypeScript typing
- **Robust Logic**: Explicit conditional logic with clear model detection and fallback handling

### Developer Experience
- **Hot Reload**: Fast development with Next.js hot reload
- **Type Safety**: Comprehensive TypeScript definitions
- **Component Documentation**: Well-documented component props and usage
- **Utility Functions**: Reusable text processing, timezone, and formatting utilities
- **Modular Architecture**: Clean separation of concerns with reusable components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use proper component composition
- Add proper error handling
- Include responsive design considerations
- Test on multiple screen sizes
- Ensure proper EOF newlines in all files
- Use consistent cursor pointer styling
- Apply proper text formatting utilities
- Implement proper timezone handling
- Add navigation between related entities

## 💖 Support

If you find this project helpful, consider supporting its development:

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-yellow.svg)](https://coff.ee/brigsalejoq)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PandaScore](https://pandascore.co) for providing the comprehensive esports API
- [Hugging Face](https://huggingface.co) for the free AI inference API and model hosting
- [DeepSeek](https://www.deepseek.com) for the advanced AI reasoning capabilities
- [Next.js](https://nextjs.org) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Lucide React](https://lucide.dev) for the beautiful icon library

---

**Made with ❤️ by [Brigido Alejo](https://www.brigidoalejo.com)**
