'use client'

import { useState } from 'react'
import { Play, Trophy, Users, TrendingUp, Calendar, Award, DollarSign, Globe } from 'lucide-react'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import StatCard from '@/components/ui/StatCard'

export default function StatsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <Navigation activeTab="stats" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-8">
                    Statistics Overview
                </h1>

                {/* Main Statistics */}
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

                {/* Additional Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={Calendar}
                        title="Matches Today"
                        value="24"
                        subtitle="Scheduled"
                        trend="+8"
                    />
                    <StatCard
                        icon={Award}
                        title="Completed Events"
                        value="1,247"
                        subtitle="This year"
                    />
                    <StatCard
                        icon={DollarSign}
                        title="Avg Prize Pool"
                        value="$2.8M"
                        subtitle="Per major tournament"
                        trend="+12%"
                    />
                    <StatCard
                        icon={Globe}
                        title="Countries"
                        value="67"
                        subtitle="Represented"
                    />
                </div>

                {/* Game-specific Statistics */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-6">Game Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">834</div>
                            <div className="text-gray-300">League of Legends</div>
                            <div className="text-sm text-gray-500">Active matches</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-400 mb-2">627</div>
                            <div className="text-gray-300">Counter-Strike 2</div>
                            <div className="text-sm text-gray-500">Active matches</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-400 mb-2">421</div>
                            <div className="text-gray-300">Dota 2</div>
                            <div className="text-sm text-gray-500">Active matches</div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-300">T1 vs DRX match started</span>
                            </div>
                            <span className="text-sm text-gray-500">2 minutes ago</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-300">World Championship 2024 announced</span>
                            </div>
                            <span className="text-sm text-gray-500">1 hour ago</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-gray-300">FaZe Clan roster update</span>
                            </div>
                            <span className="text-sm text-gray-500">3 hours ago</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
