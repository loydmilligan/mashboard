import type { AIModel, CreateAIModelInput, UpdateAIModelInput } from '@/types/models'

const API_BASE = '/api/mashboard'

class ModelsService {
  async getAll(): Promise<AIModel[]> {
    const response = await fetch(`${API_BASE}/models`)
    if (!response.ok) {
      throw new Error('Failed to fetch AI models')
    }
    return response.json()
  }

  async getById(id: number): Promise<AIModel> {
    const response = await fetch(`${API_BASE}/models/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch AI model')
    }
    return response.json()
  }

  async getByModelId(modelId: string): Promise<AIModel | null> {
    const response = await fetch(`${API_BASE}/models/${encodeURIComponent(modelId)}`)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error('Failed to fetch AI model')
    }
    return response.json()
  }

  async create(input: CreateAIModelInput): Promise<AIModel> {
    const response = await fetch(`${API_BASE}/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create AI model')
    }
    return response.json()
  }

  async update(id: number, input: UpdateAIModelInput): Promise<AIModel> {
    const response = await fetch(`${API_BASE}/models/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update AI model')
    }
    return response.json()
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/models/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete AI model')
    }
  }

  async reorder(modelIds: number[]): Promise<AIModel[]> {
    const response = await fetch(`${API_BASE}/models/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelIds }),
    })
    if (!response.ok) {
      throw new Error('Failed to reorder AI models')
    }
    return response.json()
  }

  async toggleFavorite(id: number, favorite: boolean): Promise<AIModel> {
    const response = await fetch(`${API_BASE}/models/${id}/favorite`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite }),
    })
    if (!response.ok) {
      throw new Error('Failed to toggle favorite')
    }
    return response.json()
  }
}

export const modelsService = new ModelsService()
