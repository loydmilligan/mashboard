export type ModelType = 'general' | 'coding' | 'image' | 'reasoning'

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
}
