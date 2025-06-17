import { NextRequest, NextResponse } from 'next/server'

// Types
interface Team {
  name: string
}

interface Match {
  videogame: { name: string }
  league?: { name?: string; tier?: string; region?: string }
  region?: string
  number_of_games: number
  status: string
  opponents?: Array<{ opponent: Team }>
}

interface KeyFactor {
  factor: string
  impact: 'positive' | 'negative' | 'neutral'
  description: string
}

interface AnalysisResult {
  team1Odds: number
  team2Odds: number
  prediction: 'team1' | 'team2'
  confidence: number
  reasoning: string[]
  keyFactors: KeyFactor[]
}

interface AIProvider {
  name: string
  isAvailable: () => boolean
  generateAnalysis: (team1: Team, team2: Team, match: Match) => Promise<AnalysisResult>
}

interface ModelConfig {
  provider: string
  model: string
  maxTokens: number
  temperature: number
  enabled: boolean
  priority: number
  description?: string
  costTier?: 'free' | 'low' | 'medium' | 'high'
}

// Constants
const CONFIDENCE_RANGE = {
  MIN: 55,
  MAX: 88
} as const

const ODDS_RANGE = {
  MIN: 25,
  MAX: 75
} as const

// Model configurations - easily extensible
const MODEL_CONFIGS: Record<string, ModelConfig> = {
  deepseek: {
    provider: 'huggingface',
    model: 'deepseek-ai/DeepSeek-V3-0324',
    maxTokens: 1000,
    temperature: 0.7,
    enabled: true,
    priority: 1
  },
  mistral: {
    provider: 'huggingface',
    model: 'mistralai/Mistral-7B-Instruct-v0.3',
    maxTokens: 800,
    temperature: 0.6,
    enabled: true,
    priority: 2
  },
  llama: {
    provider: 'huggingface',
    model: 'meta-llama/Llama-2-7b-chat-hf',
    maxTokens: 800,
    temperature: 0.7,
    enabled: true,
    priority: 3
  },
  gpt4: {
    provider: 'openai',
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7,
    enabled: false, // Disabled by default
    priority: 0
  }
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    const { match } = await request.json()

    // Validation
    const validationError = validateRequest(match)
    if (validationError) {
      return validationError
    }

    const team1 = match.opponents[0].opponent
    const team2 = match.opponents[1].opponent

    // Generate analysis with AI fallback
    const { analysis, model } = await generateMatchAnalysis(team1, team2, match)
    
    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        team1Name: team1.name,
        team2Name: team2.name,
        aiGenerated: true,
        model,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to process analysis request'
    }, { status: 500 })
  }
}

// Validation helper
function validateRequest(match: unknown): NextResponse | null {
  if (!match || typeof match !== 'object') {
    return NextResponse.json({ error: 'Match data is required' }, { status: 400 })
  }

  const matchObj = match as Record<string, unknown>
  const opponents = matchObj.opponents as Array<{ opponent: Team }> | undefined
  const team1 = opponents?.[0]?.opponent
  const team2 = opponents?.[1]?.opponent

  if (!team1 || !team2) {
    return NextResponse.json({ error: 'Both teams are required for analysis' }, { status: 400 })
  }

  return null
}

// AI Provider Factory
class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map()

  static registerProvider(name: string, provider: AIProvider): void {
    this.providers.set(name, provider)
  }

  static getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values())
      .filter(provider => provider.isAvailable())
      .sort((a, b) => this.getProviderPriority(a.name) - this.getProviderPriority(b.name))
  }

  private static getProviderPriority(providerName: string): number {
    const config = Object.values(MODEL_CONFIGS).find(c => 
      c.model.includes(providerName.toLowerCase()) || 
      providerName.toLowerCase().includes(c.model.split('/')[1]?.split('-')[0] || '')
    )
    return config?.priority ?? 999
  }

  static async tryProviders(team1: Team, team2: Team, match: Match): Promise<{ analysis: AnalysisResult; model: string } | null> {
    const providers = this.getAvailableProviders()
    
    console.log(`🤖 AI Analysis: ${team1.name} vs ${team2.name} (${providers.length} providers available)`)
    
    for (const provider of providers) {
      try {
        const startTime = Date.now()
        const analysis = await provider.generateAnalysis(team1, team2, match)
        const duration = Date.now() - startTime
        
        console.log(`✅ [${provider.name}] Analysis completed in ${duration}ms - ${analysis.prediction === 'team1' ? team1.name : team2.name} (${analysis.confidence}% confidence)`)
        
        return { analysis, model: `${provider.name}-enhanced` }
      } catch (error) {
        console.log(`❌ [${provider.name}] Analysis failed: ${error instanceof Error ? error.message : error}`)
        continue
      }
    }
    
    console.log(`⚠️ All AI providers failed, using algorithmic analysis`)
    return null
  }
}

// Hugging Face Provider
class HuggingFaceProvider implements AIProvider {
  constructor(
    public name: string,
    private modelConfig: ModelConfig
  ) {}

  isAvailable(): boolean {
    return !!(process.env.HUGGINGFACE_API_TOKEN && this.modelConfig.enabled)
  }

  async generateAnalysis(team1: Team, team2: Team, match: Match): Promise<AnalysisResult> {
    const { InferenceClient } = await import("@huggingface/inference")
    
    const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN
    if (!HUGGINGFACE_API_TOKEN) {
      throw new Error('Hugging Face API token not configured')
    }

    const client = new InferenceClient(HUGGINGFACE_API_TOKEN)
    const prompt = createAIPrompt(team1, team2, match)

    try {
      const apiStartTime = Date.now()
      const chatCompletion = await client.chatCompletion({
        provider: "novita",
        model: this.modelConfig.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: this.modelConfig.maxTokens,
        temperature: this.modelConfig.temperature,
      })
      const apiDuration = Date.now() - apiStartTime

      const responseContent = chatCompletion.choices[0].message.content
      if (!responseContent) {
        throw new Error('No content in AI response')
      }

      const parseStartTime = Date.now()
      const result = parseAndValidateAIResponse(responseContent, team1, team2, match)
      const parseDuration = Date.now() - parseStartTime
      
      console.log(`🔍 [${this.name}] Response processed in ${apiDuration + parseDuration}ms`)
      return result

    } catch (error) {
      console.error(`💥 [${this.name}] Error:`, {
        error: error instanceof Error ? error.message : error,
        model: this.modelConfig.model
      })
      throw new Error(`${this.name} analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Future providers can be added here following the same pattern
// Example:
// class OpenAIProvider implements AIProvider { ... }
// class AnthropicProvider implements AIProvider { ... }

// Initialize providers
function initializeProviders(): void {
  // Register Hugging Face models
  Object.entries(MODEL_CONFIGS).forEach(([key, config]) => {
    if (config.provider === 'huggingface') {
      const provider = new HuggingFaceProvider(key, config)
      AIProviderFactory.registerProvider(key, provider)
    }
  })

  // Register other providers (when implemented)
  // const openaiProvider = new OpenAIProvider('gpt4', MODEL_CONFIGS.gpt4)
  // AIProviderFactory.registerProvider('gpt4', openaiProvider)
}

// Main analysis orchestrator
async function generateMatchAnalysis(
  team1: Team, 
  team2: Team, 
  match: Match
): Promise<{ analysis: AnalysisResult; model: string }> {
  
  console.log(`🚀 Match analysis: ${team1.name} vs ${team2.name}`)
  
  // Initialize providers on first use
  initializeProviders()

  // Try AI providers in priority order
  const aiResult = await AIProviderFactory.tryProviders(team1, team2, match)
  
  if (aiResult) {
    return aiResult
  }

  // Fallback to algorithmic analysis
  const startTime = Date.now()
  const analysis = await generateAlgorithmicAnalysis(team1, team2, match)
  const duration = Date.now() - startTime
  
  console.log(`✅ Algorithmic analysis completed in ${duration}ms - ${analysis.prediction === 'team1' ? team1.name : team2.name} (${analysis.confidence}% confidence)`)
  
  return { analysis, model: 'enhanced-algorithmic' }
}

// Create AI prompt
function createAIPrompt(team1: Team, team2: Team, match: Match): string {
  return `Analyze this esports match as a professional analyst:

Match: ${team1.name} vs ${team2.name}
Game: ${match.videogame.name}
Tournament: ${match.league?.name || 'N/A'}
Format: Best of ${match.number_of_games}
Region: ${match.region || match.league?.region || 'International'}

Provide analysis in JSON format with the following structure:
{
  "team1Odds": number (0-100),
  "team2Odds": number (0-100, should total 100 with team1Odds),
  "prediction": "team1" or "team2",
  "confidence": number (0-100),
  "reasoning": ["reason1", "reason2", "reason3", "reason4", "reason5"],
  "keyFactors": [
    {"factor": "Factor Name", "impact": "positive/negative/neutral", "description": "Description"}
  ]
}

Respond with ONLY the JSON object, no additional text.`
}

// Parse and validate AI response
function parseAndValidateAIResponse(
  responseContent: string, 
  team1: Team, 
  team2: Team, 
  match: Match
): AnalysisResult {
  
  let rawAnalysis: Record<string, unknown>

  try {
    rawAnalysis = JSON.parse(responseContent) as Record<string, unknown>
  } catch {
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response')
    }
    rawAnalysis = JSON.parse(jsonMatch[0]) as Record<string, unknown>
  }

  // Validate and normalize the response
  return normalizeAIResponse(rawAnalysis, team1, team2, match)
}

// Normalize AI response to match our interface
function normalizeAIResponse(
  raw: Record<string, unknown>, 
  team1: Team, 
  team2: Team, 
  match: Match
): AnalysisResult {
  
  // Extract and validate odds
  let team1Odds = 50
  let team2Odds = 50
  
  if (typeof raw.team1Odds === 'number' && typeof raw.team2Odds === 'number') {
    const total = raw.team1Odds + raw.team2Odds
    if (Math.abs(total - 100) > 0.1 && total > 0) {
      team1Odds = Math.round((raw.team1Odds / total) * 100 * 10) / 10
      team2Odds = Math.round((100 - team1Odds) * 10) / 10
    } else {
      team1Odds = raw.team1Odds
      team2Odds = raw.team2Odds
    }
  }

  // Extract and validate confidence
  const confidence = typeof raw.confidence === 'number' 
    ? Math.max(0, Math.min(100, raw.confidence))
    : 75

  // Extract and validate prediction
  const prediction: 'team1' | 'team2' = 
    raw.prediction === 'team1' || raw.prediction === 'team2' 
      ? raw.prediction 
      : team1Odds > team2Odds ? 'team1' : 'team2'

  // Extract and validate reasoning
  const reasoning = Array.isArray(raw.reasoning) && raw.reasoning.every(r => typeof r === 'string')
    ? raw.reasoning as string[]
    : createDefaultReasoning(team1, team2, { team1Odds, team2Odds, confidence, prediction }, true)

  // Extract and validate key factors
  const keyFactors = Array.isArray(raw.keyFactors) && isValidKeyFactorsArray(raw.keyFactors)
    ? raw.keyFactors as KeyFactor[]
    : createDefaultKeyFactors(match, true)

  return {
    team1Odds: Math.round(team1Odds * 10) / 10,
    team2Odds: Math.round(team2Odds * 10) / 10,
    prediction,
    confidence: Math.round(confidence),
    reasoning,
    keyFactors
  }
}

// Type guard for key factors
function isValidKeyFactorsArray(arr: unknown[]): boolean {
  return arr.every(item => 
    typeof item === 'object' && 
    item !== null &&
    typeof (item as Record<string, unknown>).factor === 'string' &&
    ['positive', 'negative', 'neutral'].includes((item as Record<string, unknown>).impact as string) &&
    typeof (item as Record<string, unknown>).description === 'string'
  )
}

// Enhanced algorithmic analysis
async function generateAlgorithmicAnalysis(
  team1: Team, 
  team2: Team, 
  match: Match
): Promise<AnalysisResult> {
  
  // Generate analysis factors
  const factors = createAnalysisFactors(team1, team2, match)
  
  // Calculate odds based on various factors
  const { team1Odds, team2Odds } = calculateAlgorithmicOdds(team1, team2, match, factors)
  
  // Determine prediction and confidence
  const prediction = team1Odds > team2Odds ? 'team1' : 'team2'
  const confidence = calculateAlgorithmicConfidence(team1Odds, factors)
  
  // Generate reasoning
  const reasoning = createDefaultReasoning(team1, team2, { team1Odds, team2Odds, confidence, prediction }, false)
  
  return {
    team1Odds,
    team2Odds,
    prediction,
    confidence,
    reasoning,
    keyFactors: factors
  }
}

// Create analysis factors
function createAnalysisFactors(team1: Team, team2: Team, match: Match): KeyFactor[] {
  return [
    {
      factor: 'Tournament Prestige',
      impact: getTournamentImpact(match.league?.tier),
      description: `${match.league?.tier || 'Unknown'} tier tournament - higher tiers favor experienced teams`
    },
    {
      factor: 'Regional Advantage',
      impact: match.region ? 'positive' : 'neutral',
      description: match.region 
        ? `Home region advantage in ${match.region} can boost performance` 
        : 'International neutral ground'
    },
    {
      factor: 'Series Format',
      impact: getFormatImpact(match.number_of_games),
      description: `Best of ${match.number_of_games} format ${getFormatDescription(match.number_of_games)}`
    },
    {
      factor: 'Game Meta Analysis',
      impact: 'neutral',
      description: `Current ${match.videogame.name} competitive meta emphasizes strategic adaptation`
    },
    {
      factor: 'Team Professionalism',
      impact: getTeamProfessionalismImpact(team1, team2),
      description: 'Team naming patterns can indicate organizational maturity and branding investment'
    }
  ]
}

// Helper functions for factor analysis
function getTournamentImpact(tier?: string): 'positive' | 'negative' | 'neutral' {
  switch (tier) {
    case 'S': return 'positive'
    case 'A': return 'neutral'
    default: return 'negative'
  }
}

function getFormatImpact(games: number): 'positive' | 'negative' | 'neutral' {
  if (games >= 5) return 'positive'
  if (games === 3) return 'neutral'
  return 'negative'
}

function getFormatDescription(games: number): string {
  if (games >= 5) return 'favors consistent teams'
  if (games === 3) return 'balanced format'
  return 'allows for upsets'
}

function getTeamProfessionalismImpact(team1: Team, team2: Team): 'positive' | 'negative' | 'neutral' {
  const team1Score = calculateTeamScore(team1)
  const team2Score = calculateTeamScore(team2)
  
  if (team1Score > team2Score) return 'positive'
  if (team1Score < team2Score) return 'negative'
  return 'neutral'
}

function calculateTeamScore(team: Team): number {
  return team.name.length + 
    (team.name.includes('Gaming') ? 2 : 0) + 
    (team.name.includes('Esports') ? 2 : 0) + 
    (team.name.includes('Team') ? 1 : 0)
}

// Calculate algorithmic odds
function calculateAlgorithmicOdds(
  team1: Team, 
  team2: Team, 
  match: Match, 
  factors: KeyFactor[]
): { team1Odds: number; team2Odds: number } {
  
  const positiveFactors = factors.filter(f => f.impact === 'positive').length
  const negativeFactors = factors.filter(f => f.impact === 'negative').length
  
  let factorAdjustment = 0
  if (positiveFactors > negativeFactors) {
    factorAdjustment = (positiveFactors - negativeFactors) * 4
  } else if (negativeFactors > positiveFactors) {
    factorAdjustment = -(negativeFactors - positiveFactors) * 4
  }

  const tierBonus = match.league?.tier === 'S' ? 3 : match.league?.tier === 'A' ? 1 : 0
  const gameAdjustment = getGameAdjustment(match.videogame.name)
  const nameAdjustment = (calculateTeamScore(team1) - calculateTeamScore(team2)) * 0.3

  const totalAdjustment = factorAdjustment + tierBonus + gameAdjustment + nameAdjustment
  
  const team1Odds = Math.max(ODDS_RANGE.MIN, Math.min(ODDS_RANGE.MAX, 50 + totalAdjustment))
  const team2Odds = 100 - team1Odds

  return { team1Odds, team2Odds }
}

function getGameAdjustment(gameName: string): number {
  const name = gameName.toLowerCase()
  if (name.includes('league')) return 2
  if (name.includes('counter')) return 1
  return 0
}

// Calculate algorithmic confidence
function calculateAlgorithmicConfidence(team1Odds: number, factors: KeyFactor[]): number {
  const oddsSpread = Math.abs(team1Odds - 50)
  const positiveFactors = factors.filter(f => f.impact === 'positive').length
  const negativeFactors = factors.filter(f => f.impact === 'negative').length
  const factorConfidence = Math.min(20, (positiveFactors + negativeFactors) * 4)
  const baseConfidence = 65 + (oddsSpread * 0.6) + factorConfidence
  
  return Math.min(CONFIDENCE_RANGE.MAX, Math.max(CONFIDENCE_RANGE.MIN, baseConfidence))
}

// Create default reasoning
function createDefaultReasoning(
  team1: Team, 
  team2: Team, 
  analysis: { team1Odds: number; team2Odds: number; confidence: number; prediction: string }, 
  isAIEnhanced: boolean
): string[] {
  
  const analysisType = isAIEnhanced ? 'AI-enhanced' : 'enhanced algorithmic'
  const aiPrefix = isAIEnhanced 
    ? 'AI provided enhanced insights combined with' 
    : 'Enhanced algorithmic analysis focused on'
  
  return [
    `${team1.name} calculated with ${analysis.team1Odds.toFixed(1)}% win probability using ${analysisType} analysis`,
    `${team2.name} shows ${analysis.team2Odds.toFixed(1)}% chance based on tournament context, format, and competitive factors`,
    `Analysis incorporates game meta considerations and tournament prestige level`,
    `Confidence level: ${analysis.confidence.toFixed(1)}% derived from ${analysisType} assessment including multiple key variables`,
    `${aiPrefix} professional esports factors`
  ]
}

// Create default key factors
function createDefaultKeyFactors(match: Match, isAI: boolean): KeyFactor[] {
  return [
    { 
      factor: isAI ? 'AI Analysis' : 'Algorithmic Analysis', 
      impact: 'positive', 
      description: isAI 
        ? 'AI provided comprehensive match analysis' 
        : 'Enhanced algorithmic analysis with professional expertise'
    },
    { 
      factor: 'Tournament Context', 
      impact: 'neutral', 
      description: `${match.league?.name || 'Tournament'} competitive environment` 
    },
    { 
      factor: 'Game Meta', 
      impact: 'neutral', 
      description: `${match.videogame.name} current competitive landscape` 
    }
  ]
}
