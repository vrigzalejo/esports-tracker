# Esports Tracker - Next.js 15 + Tailwind CSS 4

A modern, full-featured esports tracking application built with Next.js 15, Tailwind CSS 4, and TypeScript. Track live matches, tournaments, teams, and statistics across multiple esports titles using the PandaScore API.

## 🚀 Features

### Core Functionality
- **Live Match Tracking**: Real-time match status with live indicators
- **Tournament Management**: Comprehensive tournament listings with prize pools
- **Team Analytics**: Team profiles with ratings and statistics  
- **Advanced Search**: Filter by game, team, or tournament
- **Responsive Design**: Mobile-first approach with smooth animations

### Technical Highlights
- **Next.js 15**: Latest features including Turbopack and improved performance
- **Tailwind CSS 4**: Modern styling with custom animations and gradients
- **TypeScript**: Full type safety throughout the application
- **Component Architecture**: Modular, reusable components
- **Custom Hooks**: Optimized data fetching and state management
- **API Integration**: Ready-to-use PandaScore API wrapper

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
src/
├── app/                 # Next.js 15 app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page component
├── components/         # Reusable components
│   ├── layout/        # Layout components
│   ├── matches/       # Match-related components
│   ├── tournaments/   # Tournament components
│   ├── teams/         # Team components
│   └── ui/            # UI components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and API
├── types/             # TypeScript definitions
└── ...
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

### Using the PandaScore API Wrapper

```typescript
import { PandaScoreAPI } from '@/lib/api'

const api = new PandaScoreAPI(process.env.NEXT_PUBLIC_PANDASCORE_TOKEN!)

// Fetch live matches
const liveMatches = await api.getMatches({
  filter: { status: 'running' }
})

// Get upcoming tournaments
const tournaments = await api.getTournaments({
  per_page: 20
})
```

### Available Endpoints
- `GET /matches` - Match data with real-time updates
- `GET /tournaments` - Tournament information and schedules
- `GET /teams` - Team profiles and statistics
- `GET /players` - Player data and performance metrics
- `GET /leagues` - League information
- `GET /videogames` - Supported games list

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

## 📊 Performance

- **Core Web Vitals**: Optimized for excellent performance scores
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Efficient data fetching with SWR patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
