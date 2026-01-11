export type ModelType = 'general' | 'coding' | 'image' | 'reasoning'

// Provider extracted from model_id (e.g., "anthropic" from "anthropic/claude-3.5-sonnet")
export type ModelProvider =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'meta-llama'
  | 'mistralai'
  | 'deepseek'
  | 'cohere'
  | 'perplexity'
  | 'qwen'
  | 'x-ai'
  | string // fallback for unknown providers

export interface AIModel {
  id: number
  model_id: string // OpenRouter model ID (e.g., "anthropic/claude-sonnet-4")
  nickname: string // Display name for UI
  description?: string
  tags: string[]
  favorite: boolean
  model_type: ModelType
  supports_deep_reasoning: boolean
  supports_streaming: boolean
  sort_order: number
  // OpenRouter metadata
  input_modalities: string[]
  output_modalities: string[]
  context_length?: number
  pricing_prompt?: string
  pricing_completion?: string
  pricing_image?: string
  created_at: string
  updated_at: string
}

export interface CreateAIModelInput {
  model_id: string
  nickname: string
  description?: string
  tags?: string[]
  favorite?: boolean
  model_type?: ModelType
  supports_deep_reasoning?: boolean
  supports_streaming?: boolean
  sort_order?: number
  input_modalities?: string[]
  output_modalities?: string[]
  context_length?: number
  pricing_prompt?: string
  pricing_completion?: string
  pricing_image?: string
}

export interface UpdateAIModelInput {
  model_id?: string
  nickname?: string
  description?: string
  tags?: string[]
  favorite?: boolean
  model_type?: ModelType
  supports_deep_reasoning?: boolean
  supports_streaming?: boolean
  sort_order?: number
  input_modalities?: string[]
  output_modalities?: string[]
  context_length?: number
  pricing_prompt?: string
  pricing_completion?: string
  pricing_image?: string
}

// Response from OpenRouter lookup API
export interface OpenRouterModelInfo {
  model_id: string
  name: string
  description?: string
  context_length?: number
  input_modalities: string[]
  output_modalities: string[]
  pricing_prompt?: string
  pricing_completion?: string
  pricing_image?: string
  supports_streaming: boolean
  supports_deep_reasoning: boolean
}

// Helper to extract provider from model_id
export function getModelProvider(modelId: string): ModelProvider {
  return modelId.split('/')[0] || 'unknown'
}

// Helper to calculate cost tier ($, $$, $$$)
export function getCostTier(pricingPrompt?: string, pricingCompletion?: string): '$' | '$$' | '$$$' | null {
  if (!pricingPrompt && !pricingCompletion) return null

  // Average of prompt and completion cost per 1M tokens
  const prompt = parseFloat(pricingPrompt || '0') * 1_000_000
  const completion = parseFloat(pricingCompletion || '0') * 1_000_000
  const avgCost = (prompt + completion) / 2

  // Tiers based on cost per 1M tokens:
  // $ = < $1 (cheap models like Haiku, Gemini Flash)
  // $$ = $1-$10 (mid-range like Sonnet, GPT-4o)
  // $$$ = > $10 (expensive like Opus, o1)
  if (avgCost < 1) return '$'
  if (avgCost < 10) return '$$'
  return '$$$'
}
