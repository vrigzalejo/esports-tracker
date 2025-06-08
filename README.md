# Esports Tracker - Next.js 15 + Tailwind CSS 4

A modern, full-featured esports tracking application built with Next.js 15, Tailwind CSS 4, and TypeScript. Track live matches, tournaments, teams, and statistics across multiple esports titles using the PandaScore API.

## 🚀 Features

### Core Functionality
- **Live Match Tracking**: Real-time match status with live indicators and countdown timers
- **Enhanced Match Details**: Comprehensive match information with score cards, team rosters, and recent performance
- **Tournament Management**: Complete tournament listings with standings, matches, and prize pools
- **Team Analytics**: Team profiles with ratings, statistics, and recent match history
- **Advanced Search & Filtering**: Filter by game, team, tournament, or match status with real-time results
- **Responsive Design**: Mobile-first approach with smooth animations and modern UI

### Enhanced UI/UX Features
- **Clean Team Images**: Glassmorphism design with gradient backgrounds, backdrop blur, and proper logo containment
- **Smart Text Formatting**: Intelligent capitalization for match names, tournament titles, and league information
- **Interactive Elements**: Consistent cursor pointer styling across all clickable elements
- **Match Name Cleaning**: Automatic removal of team names from match titles for cleaner display
- **Games Format Display**: BO3, BO5 format indicators alongside match information
- **Status Indicators**: Live, completed, and upcoming match badges with animations

### Match Details System
- **Interactive Score Cards**: Beautiful score displays with team logos and winner highlighting
- **Team Rosters**: View complete team lineups for tournament matches with player details
- **Recent Team Matches**: Track team performance with W/L indicators and detailed match results
- **Tournament Context**: See tournament standings and related matches
- **Escape Key Support**: Quick modal navigation with keyboard shortcuts
- **Match Header**: Comprehensive match information with league, serie, and tournament details

### Tournament Features
- **Smart Standings**: Conditional W/L columns that adapt to available data
- **Team-Focused Views**: Highlight relevant teams in tournament standings
- **Match Filtering**: Show only matches involving specific teams
- **Performance Tracking**: Win rates, rankings, and head-to-head records
- **Championship Tracking**: Display team achievements and tournament wins
- **Prize Pool Formatting**: Intelligent currency detection and formatting

### Team Management
- **Detailed Team Profiles**: Comprehensive team information with recent roster and match history
- **Championship History**: Track team achievements across tournaments
- **Player Information**: Complete player profiles with nationality, age, and role information
- **Match Statistics**: Win/loss records and recent performance metrics
- **Tournament Participation**: View all tournaments a team has participated in

### Technical Highlights
- **Next.js 15**: Latest features including Turbopack and improved performance
- **Tailwind CSS 4**: Modern styling with custom animations and gradients
- **TypeScript**: Full type safety throughout the application
- **Optimized Performance**: Memoized components and efficient data fetching
- **Component Architecture**: Modular, reusable components with proper error handling
- **Custom Hooks**: Optimized data fetching and state management
- **API Integration**: Comprehensive PandaScore API wrapper with caching
- **Text Utilities**: Advanced text processing for consistent formatting
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
NEXT_PUBLIC_PANDASCORE_TOKEN=your_api_token_here
```

### PandaScore API Setup
1. Visit [pandascore.co](https://pandascore.co)
2. Create a free account
3. Generate an API token
4. Add the token to your environment variables

## 📁 Project Structure

```
app/
├── api/                    # API routes
│   ├── matches/           # Match endpoints
│   ├── tournaments/       # Tournament endpoints
│   │   └── [id]/         # Tournament-specific data
│   │       ├── standings/ # Tournament standings
│   │       ├── matches/   # Tournament matches
│   │       └── rosters/   # Team rosters
│   └── teams/            # Team endpoints
│       └── [teamId]/     # Team-specific data
│           ├── matches/   # Team match history
│           ├── tournaments/ # Team tournament participation
│           ├── leagues/   # Team league information
│           └── series/    # Team series data
├── components/            # Reusable components
│   ├── layout/           # Layout components (Header, Footer, Navigation)
│   │   ├── Header.tsx    # Main header with search functionality
│   │   ├── Navigation.tsx # Navigation bar with active states
│   │   └── Footer.tsx    # Footer with links and branding
│   ├── matches/          # Match-related components
│   │   ├── MatchCard.tsx # Enhanced match display cards
│   │   ├── MatchDetails.tsx # Detailed match view with clean team images
│   │   ├── MatchHeader.tsx # Match header with stream links
│   │   ├── MatchInfo.tsx # Match information display
│   │   ├── TeamMatches.tsx # Team match history
│   │   ├── TeamRoster.tsx # Team roster display
│   │   └── MatchesContent.tsx # Main matches page content
│   ├── tournaments/      # Tournament components
│   │   ├── TournamentStandings.tsx # Smart standings with clean team images
│   │   ├── TournamentMatches.tsx # Tournament match lists with clean images
│   │   ├── TournamentCard.tsx # Tournament display cards
│   │   └── TournamentsContent.tsx # Main tournaments page content
│   ├── teams/           # Team components
│   │   ├── TeamDetailsContent.tsx # Comprehensive team details
│   │   ├── TeamsContent.tsx # Main teams page content
│   │   └── TeamDisplay.tsx # Enhanced team display with clean images
│   ├── ui/              # UI components
│   │   ├── StatCard.tsx # Statistics display cards
│   │   └── AlphaBanner.tsx # Alpha version banner
│   └── debug/           # Debug components
│       └── CacheStatus.tsx # Cache status indicator
├── hooks/               # Custom React hooks
│   └── useEsportsData.tsx # Data fetching hooks
├── lib/                 # Utilities and API
│   ├── textUtils.ts     # Text formatting and capitalization utilities
│   ├── tournamentUtils.ts # Tournament-specific utilities
│   └── pandaScore.ts    # PandaScore API wrapper
├── types/               # TypeScript definitions
│   └── esports.ts       # Esports data type definitions
└── globals.css         # Global styles with custom animations
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
- `GET /api/teams/[teamId]/matches` - Team-specific match history

#### Tournament Endpoints
- `GET /api/tournaments` - Tournament listings with search and filtering
- `GET /api/tournaments/[id]/standings` - Tournament standings
- `GET /api/tournaments/[id]/matches` - Tournament matches
- `GET /api/tournaments/[id]/rosters` - Team rosters for tournament

#### Team Endpoints
- `GET /api/teams` - Team profiles and statistics with search
- `GET /api/teams/[teamId]` - Individual team details
- `GET /api/teams/[teamId]/tournaments` - Team tournament participation
- `GET /api/teams/[teamId]/leagues` - Team league information
- `GET /api/teams/[teamId]/series` - Team series data

### Using the PandaScore API Wrapper

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

## 🎨 UI/UX Features

### Design System
- **Modern Glassmorphism**: Backdrop blur effects and translucent elements
- **Clean Team Images**: Gradient backgrounds with proper logo containment and padding
- **Gradient Accents**: Beautiful color transitions and hover effects
- **Responsive Grid Layouts**: Adaptive layouts for all screen sizes
- **Loading States**: Skeleton animations and smooth transitions
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### Interactive Elements
- **Consistent Cursor Styling**: Pointer cursors on all clickable elements
- **Hover Animations**: Smooth transitions and micro-interactions
- **Modal System**: Escape key support and backdrop click handling
- **Status Indicators**: Live match indicators and status badges with animations
- **Score Displays**: Winner highlighting and team comparison cards

### Text Formatting
- **Smart Capitalization**: Intelligent text formatting for match names and tournament titles
- **Match Name Cleaning**: Automatic removal of team information from match titles
- **League Information Parsing**: Proper formatting of league, serie, and tournament names
- **Prize Pool Formatting**: Currency detection and proper formatting

### Accessibility
- **Keyboard Navigation**: Full keyboard support for modals and interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Clear focus indicators and logical tab order

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

## 📊 Performance Optimizations

- **Core Web Vitals**: Optimized for excellent performance scores
- **Component Memoization**: Prevents unnecessary re-renders
- **Efficient Data Fetching**: Smart caching and request deduplication
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with lazy loading and proper error handling
- **Bundle Analysis**: Optimized bundle sizes and tree shaking
- **Text Processing**: Efficient text utilities for consistent formatting

## 🔧 Development Features

### Code Quality
- **TypeScript**: Full type safety throughout the application
- **EOF Compliance**: Proper file endings for all source files
- **Consistent Styling**: Unified approach to component styling and interactions
- **Error Boundaries**: Proper error handling and fallback components

### Developer Experience
- **Hot Reload**: Fast development with Next.js hot reload
- **Type Safety**: Comprehensive TypeScript definitions
- **Component Documentation**: Well-documented component props and usage
- **Utility Functions**: Reusable text processing and formatting utilities

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

## 💖 Support

If you find this project helpful, consider supporting its development:

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-yellow.svg)](https://coff.ee/brigsalejoq)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PandaScore](https://pandascore.co) for providing the comprehensive esports API
- [Next.js](https://nextjs.org) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Lucide React](https://lucide.dev) for the beautiful icon library

---

**Made with ❤️ by [Brigido Alejo](https://www.brigidoalejo.com)**
