# Esports Tracker - Next.js 15 + Tailwind CSS 4

A modern, full-featured esports tracking application built with Next.js 15, Tailwind CSS 4, and TypeScript. Track live matches, tournaments, teams, and statistics across multiple esports titles using the PandaScore API.

## 🚀 Features

### Core Functionality
- **Live Match Tracking**: Real-time match status with live indicators and countdown timers
- **Enhanced Match Details**: Comprehensive match information with score cards, team rosters, and recent performance
- **Tournament Management**: Complete tournament listings with standings, matches, and prize pools
- **Team Analytics**: Team profiles with ratings, statistics, and recent match history
- **Advanced Search & Filtering**: Filter by game, team, tournament, or match status
- **Responsive Design**: Mobile-first approach with smooth animations and modern UI

### Match Details System
- **Interactive Score Cards**: Beautiful score displays with team logos and winner highlighting
- **Team Rosters**: View complete team lineups for tournament matches
- **Recent Team Matches**: Track team performance with W/L indicators and match results
- **Tournament Context**: See tournament standings and related matches
- **Escape Key Support**: Quick modal navigation with keyboard shortcuts

### Tournament Features
- **Smart Standings**: Conditional W/L columns that adapt to available data
- **Team-Focused Views**: Highlight relevant teams in tournament standings
- **Match Filtering**: Show only matches involving specific teams
- **Performance Tracking**: Win rates, rankings, and head-to-head records

### Technical Highlights
- **Next.js 15**: Latest features including Turbopack and improved performance
- **Tailwind CSS 4**: Modern styling with custom animations and gradients
- **TypeScript**: Full type safety throughout the application
- **Optimized Performance**: Memoized components and efficient data fetching
- **Component Architecture**: Modular, reusable components with proper error handling
- **Custom Hooks**: Optimized data fetching and state management
- **API Integration**: Comprehensive PandaScore API wrapper with caching

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
│           └── matches/   # Team match history
├── components/            # Reusable components
│   ├── layout/           # Layout components (Header, Footer, Navigation)
│   ├── matches/          # Match-related components
│   │   ├── MatchCard.tsx # Match display cards
│   │   ├── MatchDetails.tsx # Detailed match view
│   │   ├── TeamMatches.tsx # Team match history
│   │   └── TeamRoster.tsx # Team roster display
│   ├── tournaments/      # Tournament components
│   │   ├── TournamentStandings.tsx # Smart standings table
│   │   └── TournamentMatches.tsx # Tournament match lists
│   ├── teams/           # Team components
│   └── ui/              # UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and API
├── types/               # TypeScript definitions
└── globals.css         # Global styles
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
- `GET /api/matches` - Match data with real-time updates
- `GET /api/teams/[teamId]/matches` - Team-specific match history

#### Tournament Endpoints
- `GET /api/tournaments` - Tournament listings
- `GET /api/tournaments/[id]/standings` - Tournament standings
- `GET /api/tournaments/[id]/matches` - Tournament matches
- `GET /api/tournaments/[id]/rosters` - Team rosters for tournament

#### Team Endpoints
- `GET /api/teams` - Team profiles and statistics

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
- **Gradient Accents**: Beautiful color transitions and hover effects
- **Responsive Grid Layouts**: Adaptive layouts for all screen sizes
- **Loading States**: Skeleton animations and smooth transitions
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### Interactive Elements
- **Hover Animations**: Smooth transitions and micro-interactions
- **Modal System**: Escape key support and backdrop click handling
- **Status Indicators**: Live match indicators and status badges
- **Score Displays**: Winner highlighting and team comparison cards

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
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Optimized bundle sizes and tree shaking

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
