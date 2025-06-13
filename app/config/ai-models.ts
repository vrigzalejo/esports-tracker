// AI Model Configuration
// This file centralizes all AI model configurations for easy management

export interface ModelConfig {
  provider: string
  model: string
  maxTokens: number
  temperature: number
  enabled: boolean
  priority: number
  description?: string
  costTier?: 'free' | 'low' | 'medium' | 'high'
}

export interface ProviderConfig {
  name: string
  envKey: string
  baseUrl?: string
  defaultHeaders?: Record<string, string>
}

// Provider configurations
export const PROVIDERS: Record<string, ProviderConfig> = {
  huggingface: {
    name: 'Hugging Face',
    envKey: 'HUGGINGFACE_API_TOKEN',
    baseUrl: 'https://api-inference.huggingface.co'
  },
  openai: {
    name: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1'
  },
  anthropic: {
    name: 'Anthropic',
    envKey: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com'
  },
  google: {
    name: 'Google AI',
    envKey: 'GOOGLE_AI_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com'
  }
}

// Model configurations - easily extensible
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // Hugging Face Models
  deepseek: {
    provider: 'huggingface',
    model: 'deepseek-ai/DeepSeek-V3-0324',
    maxTokens: 1000,
    temperature: 0.7,
    enabled: true,
    priority: 1,
    description: 'DeepSeek V3 - Advanced reasoning model',
    costTier: 'free'
  },
  mistral: {
    provider: 'huggingface',
    model: 'mistralai/Mistral-7B-Instruct-v0.3',
    maxTokens: 800,
    temperature: 0.6,
    enabled: true,
    priority: 2,
    description: 'Mistral 7B - Fast and efficient',
    costTier: 'free'
  },
  llama: {
    provider: 'huggingface',
    model: 'meta-llama/Llama-2-7b-chat-hf',
    maxTokens: 800,
    temperature: 0.7,
    enabled: true,
    priority: 3,
    description: 'Llama 2 7B - Meta\'s open model',
    costTier: 'free'
  },
  codellama: {
    provider: 'huggingface',
    model: 'codellama/CodeLlama-7b-Instruct-hf',
    maxTokens: 600,
    temperature: 0.5,
    enabled: false,
    priority: 4,
    description: 'Code Llama - Specialized for code',
    costTier: 'free'
  },

  // OpenAI Models (for future implementation)
  gpt4: {
    provider: 'openai',
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7,
    enabled: false,
    priority: 0,
    description: 'GPT-4 - Most capable model',
    costTier: 'high'
  },
  gpt35turbo: {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    enabled: false,
    priority: 5,
    description: 'GPT-3.5 Turbo - Fast and cost-effective',
    costTier: 'low'
  },

  // Anthropic Models (for future implementation)
  claude3: {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 1000,
    temperature: 0.7,
    enabled: false,
    priority: 1,
    description: 'Claude 3 Sonnet - Balanced performance',
    costTier: 'medium'
  },

  // Google Models (for future implementation)
  gemini: {
    provider: 'google',
    model: 'gemini-pro',
    maxTokens: 1000,
    temperature: 0.7,
    enabled: false,
    priority: 2,
    description: 'Gemini Pro - Google\'s flagship model',
    costTier: 'medium'
  }
}

// Helper functions
export function getEnabledModels(): ModelConfig[] {
  return Object.values(MODEL_CONFIGS)
    .filter(config => config.enabled)
    .sort((a, b) => a.priority - b.priority)
}

export function getModelsByProvider(provider: string): ModelConfig[] {
  return Object.values(MODEL_CONFIGS)
    .filter(config => config.provider === provider && config.enabled)
    .sort((a, b) => a.priority - b.priority)
}

export function getModelConfig(modelKey: string): ModelConfig | undefined {
  return MODEL_CONFIGS[modelKey]
}

export function isProviderAvailable(provider: string): boolean {
  const providerConfig = PROVIDERS[provider]
  if (!providerConfig) return false
  
  return !!process.env[providerConfig.envKey]
}

// Environment-based model filtering
export function getAvailableModels(): ModelConfig[] {
  return getEnabledModels().filter(config => 
    isProviderAvailable(config.provider)
  )
}

// Model selection strategies
export type ModelSelectionStrategy = 'priority' | 'cost' | 'performance' | 'random'

export function selectModel(strategy: ModelSelectionStrategy = 'priority'): ModelConfig | null {
  const availableModels = getAvailableModels()
  
  if (availableModels.length === 0) return null
  
  switch (strategy) {
    case 'priority':
      return availableModels[0] // Already sorted by priority
    
    case 'cost':
      return availableModels
        .filter(m => m.costTier === 'free')
        .sort((a, b) => a.priority - b.priority)[0] || availableModels[0]
    
    case 'performance':
      return availableModels
        .filter(m => m.priority <= 2)[0] || availableModels[0]
    
    case 'random':
      return availableModels[Math.floor(Math.random() * availableModels.length)]
    
    default:
      return availableModels[0]
  }
} 