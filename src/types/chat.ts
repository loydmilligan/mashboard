export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  model?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  model: string
  createdAt: number
  updatedAt: number
}

export interface ChatCompletionRequest {
  model: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

export interface ChatCompletionChunk {
  id: string
  choices: Array<{
    delta: {
      content?: string
      role?: string
      reasoning?: string
      reasoning_details?: Array<{ type: string; summary?: string; id?: string }>
    }
    finish_reason: string | null
    index: number
  }>
  model: string
}

/**
 * Streaming chunk types for differentiating reasoning vs content
 */
export interface StreamChunk {
  type: 'reasoning' | 'content'
  text: string
}

// Note: Model configuration is now stored in the database and managed via modelsStore
