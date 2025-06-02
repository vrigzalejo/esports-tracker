import type { StatCardProps } from '@/types/esports'
import { TrendingUp } from 'lucide-react'

export default function StatCard({
    icon: Icon,
    title,
    value,
    subtitle,
    trend
}: StatCardProps) {
    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-200 animate-fade-in">
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
    )
}
