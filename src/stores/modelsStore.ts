import { create } from 'zustand'
import type { AIModel, CreateAIModelInput, UpdateAIModelInput } from '@/types/models'
import { modelsService } from '@/services/models'

interface ModelsState {
  models: AIModel[]
  isLoading: boolean
  error: string | null
  initialized: boolean

  // Actions
  fetchModels: () => Promise<void>
  createModel: (input: CreateAIModelInput) => Promise<AIModel>
  updateModel: (id: number, input: UpdateAIModelInput) => Promise<AIModel>
  deleteModel: (id: number) => Promise<void>
  reorderModels: (modelIds: number[]) => Promise<void>
  toggleFavorite: (id: number) => Promise<void>

  // Helpers
  getModelByOpenRouterId: (modelId: string) => AIModel | undefined
  getNickname: (modelId: string) => string
}

export const useModelsStore = create<ModelsState>()((set, get) => ({
  models: [],
  isLoading: false,
  error: null,
  initialized: false,

  fetchModels: async () => {
    if (get().isLoading) return

    set({ isLoading: true, error: null })
    try {
      const models = await modelsService.getAll()
      set({ models, isLoading: false, initialized: true })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch models',
        isLoading: false,
      })
    }
  },

  createModel: async (input) => {
    set({ isLoading: true, error: null })
    try {
      const model = await modelsService.create(input)
      set((state) => ({
        models: [...state.models, model],
        isLoading: false,
      }))
      return model
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create model',
        isLoading: false,
      })
      throw error
    }
  },

  updateModel: async (id, input) => {
    set({ isLoading: true, error: null })
    try {
      const model = await modelsService.update(id, input)
      set((state) => ({
        models: state.models.map((m) => (m.id === id ? model : m)),
        isLoading: false,
      }))
      return model
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update model',
        isLoading: false,
      })
      throw error
    }
  },

  deleteModel: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await modelsService.delete(id)
      set((state) => ({
        models: state.models.filter((m) => m.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete model',
        isLoading: false,
      })
      throw error
    }
  },

  reorderModels: async (modelIds) => {
    try {
      const models = await modelsService.reorder(modelIds)
      set({ models })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reorder models',
      })
      throw error
    }
  },

  toggleFavorite: async (id) => {
    const model = get().models.find((m) => m.id === id)
    if (!model) return

    try {
      await modelsService.toggleFavorite(id, !model.favorite)
      // Refetch to get correct order after favorite toggle
      await get().fetchModels()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle favorite',
      })
      throw error
    }
  },

  getModelByOpenRouterId: (modelId: string) => {
    return get().models.find((m) => m.model_id === modelId)
  },

  getNickname: (modelId: string) => {
    const model = get().models.find((m) => m.model_id === modelId)
    if (model) return model.nickname
    // Fallback: extract name from model_id (e.g., "anthropic/claude-3" -> "claude-3")
    const parts = modelId.split('/')
    return parts[parts.length - 1] || modelId
  },
}))

// Initialize models on first import
if (typeof window !== 'undefined') {
  useModelsStore.getState().fetchModels()
}
