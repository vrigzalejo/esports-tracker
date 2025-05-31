import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Users, Gamepad2, Clock, Star, TrendingUp, Play, Pause, Search, Filter, ChevronRight, ExternalLink } from 'lucide-react';

// Types
interface Match {
    id: number;
    name: string;
    status: string;
    begin_at: string;
    tournament: {
        name: string;
        league: {
            name: string;
            image_url: string;
        };
    };
    opponents: Array<{
        opponent: {
            name: string;
            image_url: string;
        };
    }>;
    games: Array<{
        winner: {
            id: number;
        };
    }>;
    videogame: {
        name: string;
        slug: string;
    };
}

interface Tournament {
    id: number;
    name: string;
    begin_at: string;
    end_at: string;
    prize_pool: string;
    league: {
        name: string;
        image_url: string;
    };
    videogame: {
        name: string;
    };
}

interface Team {
    id: number;
    name: string;
    image_url: string;
    acronym: string;
    location: string;
}

const EsportsTracker = () => {
    const [activeTab, setActiveTab] = useState('matches');
    const [matches, setMatches] = useState<Match[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGame, setSelectedGame] = useState('all');

    // Mock data for demonstration (in real app, this would come from PandaScore API)
    const mockMatches: Match[] = [
        {
            id: 1,
            name: "Team Liquid vs Fnatic",
            status: "running",
            begin_at: "2025-05-30T18:00:00Z",
            tournament: {
                name: "LEC Summer Split",
                league: {
                    name: "League of Legends European Championship",
                    image_url: "/api/placeholder/40/40"
                }
            },
            opponents: [
                {
                    opponent: {
                        name: "Team Liquid",
                        image_url: "/api/placeholder/40/40"
                    }
                },
                {
                    opponent: {
                        name: "Fnatic",
                        image_url: "/api/placeholder/40/40"
                    }
                }
            ],
            games: [],
            videogame: {
                name: "League of Legends",
                slug: "lol"
            }
        },
        {
            id: 2,
            name: "G2 Esports vs MAD Lions",
            status: "finished",
            begin_at: "2025-05-30T16:00:00Z",
            tournament: {
                name: "LEC Summer Split",
                league: {
                    name: "League of Legends European Championship",
                    image_url: "/api/placeholder/40/40"
                }
            },
            opponents: [
                {
                    opponent: {
                        name: "G2 Esports",
                        image_url: "/api/placeholder/40/40"
                    }
                },
                {
                    opponent: {
                        name: "MAD Lions",
                        image_url: "/api/placeholder/40/40"
                    }
                }
            ],
            games: [{ winner: { id: 1 } }],
            videogame: {
                name: "League of Legends",
                slug: "lol"
            }
        },
        {
            id: 3,
            name: "FaZe Clan vs NAVI",
            status: "not_started",
            begin_at: "2025-05-30T20:00:00Z",
            tournament: {
                name: "IEM Cologne",
                league: {
                    name: "Intel Extreme Masters",
                    image_url: "/api/placeholder/40/40"
                }
            },
            opponents: [
                {
                    opponent: {
                        name: "FaZe Clan",
                        image_url: "/api/placeholder/40/40"
                    }
                },
                {
                    opponent: {
                        name: "NAVI",
                        image_url: "/api/placeholder/40/40"
                    }
                }
            ],
            games: [],
            videogame: {
                name: "Counter-Strike 2",
                slug: "cs2"
            }
        }
    ];

    const mockTournaments: Tournament[] = [
        {
            id: 1,
            name: "The International 2025",
            begin_at: "2025-10-15T00:00:00Z",
            end_at: "2025-10-30T00:00:00Z",
            prize_pool: "$40,000,000",
            league: {
                name: "The International",
                image_url: "/api/placeholder/50/50"
            },
            videogame: {
                name: "Dota 2"
            }
        },
        {
            id: 2,
            name: "Worlds 2025",
            begin_at: "2025-09-25T00:00:00Z",
            end_at: "2025-11-05T00:00:00Z",
            prize_pool: "$5,000,000",
            league: {
                name: "League of Legends World Championship",
                image_url: "/api/placeholder/50/50"
            },
            videogame: {
                name: "League of Legends"
            }
        },
        {
            id: 3,
            name: "PGL Major Copenhagen 2025",
            begin_at: "2025-08-01T00:00:00Z",
            end_at: "2025-08-15T00:00:00Z",
            prize_pool: "$1,250,000",
            league: {
                name: "PGL Major",
                image_url: "/api/placeholder/50/50"
            },
            videogame: {
                name: "Counter-Strike 2"
            }
        }
    ];

    const mockTeams: Team[] = [
        {
            id: 1,
            name: "Team Liquid",
            image_url: "/api/placeholder/60/60",
            acronym: "TL",
            location: "Netherlands"
        },
        {
            id: 2,
            name: "Fnatic",
            image_url: "/api/placeholder/60/60",
            acronym: "FNC",
            location: "United Kingdom"
        },
        {
            id: 3,
            name: "G2 Esports",
            image_url: "/api/placeholder/60/60",
            acronym: "G2",
            location: "Germany"
        },
        {
            id: 4,
            name: "FaZe Clan",
            image_url: "/api/placeholder/60/60",
            acronym: "FAZE",
            location: "United States"
        }
    ];

    useEffect(() => {
        // In a real app, you would fetch from PandaScore API here
        // Example API calls:
        // fetch('https://api.pandascore.co/matches?token=YOUR_TOKEN')
        // fetch('https://api.pandascore.co/tournaments?token=YOUR_TOKEN')
        // fetch('https://api.pandascore.co/teams?token=YOUR_TOKEN')

        setMatches(mockMatches);
        setTournaments(mockTournaments);
        setTeams(mockTeams);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-green-500';
            case 'finished': return 'bg-gray-500';
            case 'not_started': return 'bg-blue-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'running': return 'LIVE';
            case 'finished': return 'FINISHED';
            case 'not_started': return 'UPCOMING';
            default: return 'TBD';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, trend }: any) => (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">{title}</p>
                        <p className="text-2xl font-bold text-white">{value}</p>
                    </div>
                </div>
                {trend && (
                    <div className="flex items-center text-green-400 text-sm">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {trend}
                    </div>
                )}
            </div>
            {subtitle && <p className="text-gray-500 text-sm mt-2">{subtitle}</p>}
        </div>
    );

    const MatchCard = ({ match }: { match: Match }) => (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(match.status)}`}>
                        {getStatusText(match.status)}
                    </span>
                    <span className="text-gray-400 text-sm">{match.videogame.name}</span>
                </div>
                <span className="text-gray-400 text-sm">{formatDate(match.begin_at)}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <img src={match.opponents[0]?.opponent.image_url} alt="" className="w-8 h-8 rounded" />
                        <span className="text-white font-medium">{match.opponents[0]?.opponent.name}</span>
                    </div>
                    <span className="text-gray-400">vs</span>
                    <div className="flex items-center space-x-2">
                        <img src={match.opponents[1]?.opponent.image_url} alt="" className="w-8 h-8 rounded" />
                        <span className="text-white font-medium">{match.opponents[1]?.opponent.name}</span>
                    </div>
                </div>
                {match.status === 'running' && (
                    <div className="flex items-center text-red-400">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></div>
                        LIVE
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{match.tournament.league.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    );

    const TournamentCard = ({ tournament }: { tournament: Tournament }) => (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <img src={tournament.league.image_url} alt="" className="w-12 h-12 rounded-lg" />
                    <div>
                        <h3 className="text-white font-semibold">{tournament.name}</h3>
                        <p className="text-gray-400 text-sm">{tournament.videogame.name}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-green-400 font-bold">{tournament.prize_pool}</p>
                    <p className="text-gray-400 text-xs">Prize Pool</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-300">{formatDate(tournament.begin_at)} - {formatDate(tournament.end_at)}</span>
                </div>
            </div>
        </div>
    );

    const TeamCard = ({ team }: { team: Team }) => (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-colors">
            <div className="flex items-center space-x-4">
                <img src={team.image_url} alt="" className="w-16 h-16 rounded-lg" />
                <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                    <p className="text-gray-400">{team.acronym}</p>
                    <p className="text-gray-500 text-sm">{team.location}</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center text-yellow-400 mb-1">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="text-sm">8.5</span>
                    </div>
                    <p className="text-gray-400 text-xs">Rating</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Gamepad2 className="w-8 h-8 text-blue-500" />
                                <span className="text-xl font-bold">EsportsTracker</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search matches, teams..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {[
                            { id: 'matches', label: 'Live Matches', icon: Play },
                            { id: 'tournaments', label: 'Tournaments', icon: Trophy },
                            { id: 'teams', label: 'Teams', icon: Users },
                            { id: 'stats', label: 'Statistics', icon: TrendingUp }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center space-x-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Overview */}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={Play}
                            title="Live Matches"
                            value="12"
                            subtitle="Across all games"
                            trend="+3"
                        />
                        <StatCard
                            icon={Trophy}
                            title="Active Tournaments"
                            value="45"
                            subtitle="This month"
                        />
                        <StatCard
                            icon={Users}
                            title="Top Teams"
                            value="2,341"
                            subtitle="Tracked globally"
                        />
                        <StatCard
                            icon={TrendingUp}
                            title="Total Prize Pool"
                            value="$125M"
                            subtitle="This year"
                            trend="+15%"
                        />
                    </div>
                )}

                {/* Live Matches */}
                {activeTab === 'matches' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Live & Upcoming Matches</h2>
                            <div className="flex items-center space-x-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedGame}
                                    onChange={(e) => setSelectedGame(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="all">All Games</option>
                                    <option value="lol">League of Legends</option>
                                    <option value="cs2">Counter-Strike 2</option>
                                    <option value="dota2">Dota 2</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {matches.map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Tournaments */}
                {activeTab === 'tournaments' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Upcoming Tournaments</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {tournaments.map((tournament) => (
                                <TournamentCard key={tournament.id} tournament={tournament} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Teams */}
                {activeTab === 'teams' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Top Teams</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teams.map((team) => (
                                <TeamCard key={team.id} team={team} />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* API Integration Notice */}
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mx-4 mb-8">
                <div className="flex items-start space-x-3">
                    <ExternalLink className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="text-sm">
                        <p className="text-blue-100 font-medium mb-1">PandaScore API Integration</p>
                        <p className="text-blue-200">
                            This demo uses mock data. To connect to PandaScore API, replace the mock data with actual API calls:
                        </p>
                        <ul className="text-blue-200 mt-2 space-y-1">
                            <li>• Matches: <code className="bg-blue-800 px-1 rounded">GET /matches</code></li>
                            <li>• Tournaments: <code className="bg-blue-800 px-1 rounded">GET /tournaments</code></li>
                            <li>• Teams: <code className="bg-blue-800 px-1 rounded">GET /teams</code></li>
                            <li>• Players: <code className="bg-blue-800 px-1 rounded">GET /players</code></li>
                        </ul>
                        <p className="text-blue-200 mt-2">
                            Visit <a href="https://pandascore.co" className="text-blue-300 underline">pandascore.co</a> to get your free API token.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EsportsTracker;
