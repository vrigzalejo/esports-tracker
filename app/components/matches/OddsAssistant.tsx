import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Match } from '@/types/esports'

interface OddsAssistantProps {
    match: Match
    isOpen: boolean
    onClose: () => void
}

interface OddsAnalysis {
    team1Odds: number
    team2Odds: number
    prediction: 'team1' | 'team2' | 'draw'
    confidence: number
    reasoning: string[]
    keyFactors: {
        factor: string
        impact: 'positive' | 'negative' | 'neutral'
        description: string
    }[]
    model?: string
    aiGenerated?: boolean
}

export default function OddsAssistant({ match, isOpen, onClose }: OddsAssistantProps) {
    const [analysis, setAnalysis] = useState<OddsAnalysis | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const team1 = match.opponents?.[0]?.opponent
    const team2 = match.opponents?.[1]?.opponent

    const generateOddsAnalysis = async (): Promise<OddsAnalysis> => {
        try {
            const response = await fetch('/api/analyze-match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ match }),
            })

            const data = await response.json()
            
            if (!data.success) {
                if (data.error === 'AI_NOT_CONFIGURED') {
                    throw new Error('DeepSeek AI not available. Using enhanced algorithmic fallback analysis.')
                } else if (data.error === 'AI_NOT_IMPLEMENTED') {
                    throw new Error('AI analysis ready! Add HUGGINGFACE_API_TOKEN for DeepSeek AI predictions.')
                } else {
                    throw new Error(data.message || 'Analysis failed')
                }
            }

            return {
                team1Odds: data.analysis.team1Odds,
                team2Odds: data.analysis.team2Odds,
                prediction: data.analysis.prediction,
                confidence: data.analysis.confidence,
                reasoning: data.analysis.reasoning,
                keyFactors: data.analysis.keyFactors,
                model: data.analysis.model,
                aiGenerated: data.analysis.aiGenerated
            }
        } catch (error) {
            console.error('Analysis error:', error)
            throw error
        }
    }

    const runAnalysis = async () => {
        if (!team1 || !team2) return

        setIsLoading(true)
        setError(null)
        
        try {
            const result = await generateOddsAnalysis()
            setAnalysis(result)
        } catch {
            setError('Failed to analyze match odds. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen && !analysis && !isLoading) {
            runAnalysis()
        }
    }, [isOpen])

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">AI Match Analyst</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                        title="Close AI Odds Assistant"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Match Info */}
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {team1?.image_url && (
                                    <div className="relative w-8 h-8">
                                        <Image 
                                            src={team1.image_url} 
                                            alt={team1.name} 
                                            fill
                                            className="rounded-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement
                                                if (match.opponents?.[0]?.type === 'Player') {
                                                    target.src = '/images/placeholder-player.svg'
                                                } else {
                                                    target.src = '/images/placeholder-team.svg'
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                                <span className="font-semibold text-white">{team1?.name || 'TBD'}</span>
                            </div>
                            <span className="text-gray-400 font-medium">VS</span>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-white">{team2?.name || 'TBD'}</span>
                                {team2?.image_url && (
                                    <div className="relative w-8 h-8">
                                        <Image 
                                            src={team2.image_url} 
                                            alt={team2.name} 
                                            fill
                                            className="rounded-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement
                                                if (match.opponents?.[1]?.type === 'Player') {
                                                    target.src = '/images/placeholder-player.svg'
                                                } else {
                                                    target.src = '/images/placeholder-team.svg'
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center gap-3 text-green-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                                <span className="text-lg">AI analyzing match...</span>
                            </div>
                            <p className="text-gray-400 mt-2">DeepSeek AI processing team data & statistics</p>
                            <div className="mt-4 flex justify-center">
                                <div className="bg-gray-800/50 rounded-lg p-3 max-w-md">
                                    <p className="text-xs text-gray-300">
                                        🤖 Real AI analyzing team performance, meta adaptation, tournament experience, and historical matchups
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-center">
                                <div className="bg-green-900/20 border border-green-500/30 rounded-lg px-3 py-1">
                                    <p className="text-xs text-green-400 font-medium">
                                        ⚡ Powered by DeepSeek AI
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            {error.includes('coming soon') ? (
                                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-blue-400 mb-2">Enhanced AI Analysis Active!</h3>
                                    <p className="text-blue-300 mb-4">
                                        Powered by sophisticated algorithmic intelligence for advanced esports analysis.
                                    </p>
                                    <div className="bg-blue-800/30 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-blue-200">
                                            🚀 <strong>Features available:</strong><br/>
                                            • Real-time team performance analysis<br/>
                                            • Historical matchup predictions<br/>
                                            • Meta adaptation insights<br/>
                                            • Professional-grade odds calculation
                                        </p>
                                    </div>
                                    <p className="text-xs text-blue-400">
                                        Enhanced AI predictions are now active and ready to use!
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="text-red-400 font-medium">Configuration Required</span>
                                    </div>
                                    <p className="text-red-300 text-sm mb-4">{error}</p>
                                    <button
                                        onClick={runAnalysis}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors text-sm"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {analysis && (
                        <div className="space-y-6">
                            {/* Odds Display */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                                    <h3 className="font-semibold text-white mb-2">{team1?.name || 'Team 1'}</h3>
                                    <div className="text-3xl font-bold text-blue-400">{analysis.team1Odds.toFixed(1)}%</div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${analysis.team1Odds}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                                    <h3 className="font-semibold text-white mb-2">{team2?.name || 'Team 2'}</h3>
                                    <div className="text-3xl font-bold text-purple-400">{analysis.team2Odds.toFixed(1)}%</div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                                        <div 
                                            className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${analysis.team2Odds}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Prediction */}
                            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="font-semibold text-green-400">AI Prediction</h3>
                                </div>
                                <p className="text-white">
                                    <span className="font-semibold">
                                        {analysis.prediction === 'team1' ? team1?.name : team2?.name}
                                    </span> is favored to win
                                </p>
                                <p className="text-sm text-gray-300 mt-1">
                                    Confidence: {analysis.confidence.toFixed(1)}%
                                </p>
                            </div>

                            {/* Key Factors */}
                            <div>
                                <h3 className="font-semibold text-white mb-3">Key Analysis Factors</h3>
                                <div className="space-y-2">
                                    {analysis.keyFactors.map((factor, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                                            <div className={`w-2 h-2 rounded-full ${
                                                factor.impact === 'positive' ? 'bg-green-500' :
                                                factor.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`}></div>
                                            <div className="flex-1">
                                                <span className="font-medium text-white">{factor.factor}</span>
                                                <p className="text-sm text-gray-400">{factor.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Reasoning */}
                            <div>
                                <h3 className="font-semibold text-white mb-3">AI Analysis</h3>
                                <div className="space-y-2">
                                    {analysis.reasoning.map((reason, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                                                <span className="text-xs font-bold text-blue-400">{index + 1}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm">{reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Info */}
                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                            <circle cx="4" cy="4" r="4"/>
                                        </svg>
                                    </div>
                                    <span className="text-green-400 text-sm font-medium">
                                        {(() => {
                                            const model = analysis?.model
                                            if (model === 'enhanced-algorithmic' || model === 'algorithmic-analysis' || model === 'algorithmic-fallback') {
                                                return 'Powered by Smart AI'
                                            } else if (model?.includes('deepseek') || model?.includes('mistral') || model?.includes('llama')) {
                                                return 'Powered by AI'
                                            } else if (model?.includes('enhanced')) {
                                                return 'Powered by Enhanced AI'
                                            } else {
                                                return 'Powered by AI'
                                            }
                                        })()}
                                    </span>
                                </div>
                                <p className="text-green-300 text-xs">
                                    {(() => {
                                        const model = analysis?.model
                                        if (model === 'enhanced-algorithmic' || model === 'algorithmic-analysis' || model === 'algorithmic-fallback') {
                                            return '🧠 Intelligent algorithmic analysis with professional esports expertise (AI fallback active)'
                                        } else if (model?.includes('deepseek') || model?.includes('mistral') || model?.includes('llama')) {
                                            return '🤖 Real AI analysis generated with professional esports expertise'
                                        } else if (model?.includes('huggingface')) {
                                            return '🤖 Real AI analysis generated by DeepSeek AI with professional esports expertise'
                                        } else if (model?.includes('enhanced')) {
                                            return '🧠 Enhanced algorithmic fallback analysis with professional esports expertise'
                                        } else {
                                            return '🤖 Real AI analysis generated with professional esports expertise'
                                        }
                                    })()}
                                </p>
                            </div>

                            {/* Disclaimer */}
                            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                                <p className="text-yellow-300 text-xs">
                                    ⚠️ This analysis is for entertainment purposes only. Predictions should not be used for betting or financial decisions.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 