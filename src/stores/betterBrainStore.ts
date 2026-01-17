import { create } from 'zustand'
import type {
  BBItem,
  BBItemDetail,
  BBBriefing,
  BBStats,
  ContentType,
  LibraryFilters,
} from '@/types/betterBrain'
import * as betterBrainService from '@/services/betterBrain'

interface BetterBrainState {
  // Library state
  items: BBItem[]
  totalItems: number
  isLoadingItems: boolean
  itemsError: string | null

  // Selected item
  selectedItem: BBItemDetail | null
  isLoadingDetail: boolean

  // Filters
  filters: LibraryFilters

  // Briefing state
  latestBriefing: BBBriefing | null
  isLoadingBriefing: boolean
  isGeneratingBriefing: boolean
  briefingError: string | null

  // Stats
  stats: BBStats | null

  // Service health
  isHealthy: boolean
  lastHealthCheck: Date | null

  // Actions
  fetchItems: (contentType?: ContentType, offset?: number) => Promise<void>
  fetchItemDetail: (id: number) => Promise<void>
  clearSelectedItem: () => void
  setFilters: (filters: Partial<LibraryFilters>) => void
  resetFilters: () => void
  fetchLatestBriefing: () => Promise<void>
  generateBriefing: () => Promise<void>
  fetchStats: () => Promise<void>
  checkHealth: () => Promise<boolean>
  searchItems: (query: string) => Promise<void>
  reprocessPending: (limit?: number) => Promise<void>
}

const DEFAULT_FILTERS: LibraryFilters = {
  contentType: 'all',
  search: '',
  source: null,
  status: 'all',
}

export const useBetterBrainStore = create<BetterBrainState>((set, get) => ({
  // Initial state
  items: [],
  totalItems: 0,
  isLoadingItems: false,
  itemsError: null,

  selectedItem: null,
  isLoadingDetail: false,

  filters: DEFAULT_FILTERS,

  latestBriefing: null,
  isLoadingBriefing: false,
  isGeneratingBriefing: false,
  briefingError: null,

  stats: null,
  isHealthy: false,
  lastHealthCheck: null,

  // Actions
  fetchItems: async (contentType, offset = 0) => {
    set({ isLoadingItems: true, itemsError: null })

    try {
      const { filters } = get()
      const type = contentType || (filters.contentType !== 'all' ? filters.contentType : undefined)

      const response = await betterBrainService.getItems(type, {
        search: filters.search || undefined,
        source: filters.source || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        limit: 50,
        offset,
      })

      set({
        items: offset === 0 ? response.items : [...get().items, ...response.items],
        totalItems: response.total,
        isLoadingItems: false,
      })
    } catch (error) {
      set({
        isLoadingItems: false,
        itemsError: error instanceof Error ? error.message : 'Failed to load items',
      })
    }
  },

  fetchItemDetail: async (id) => {
    set({ isLoadingDetail: true })

    try {
      const item = await betterBrainService.getItem(id)
      set({ selectedItem: item, isLoadingDetail: false })
    } catch (error) {
      set({ isLoadingDetail: false })
      console.error('Failed to fetch item detail:', error)
    }
  },

  clearSelectedItem: () => set({ selectedItem: null }),

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } })
  },

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  fetchLatestBriefing: async () => {
    set({ isLoadingBriefing: true, briefingError: null })

    try {
      const briefing = await betterBrainService.getLatestBriefing()
      set({ latestBriefing: briefing, isLoadingBriefing: false })
    } catch (error) {
      set({
        isLoadingBriefing: false,
        briefingError: error instanceof Error ? error.message : 'Failed to load briefing',
      })
    }
  },

  generateBriefing: async () => {
    set({ isGeneratingBriefing: true, briefingError: null })

    try {
      await betterBrainService.generateBriefing()
      // Fetch the newly generated briefing
      await get().fetchLatestBriefing()
      set({ isGeneratingBriefing: false })
    } catch (error) {
      set({
        isGeneratingBriefing: false,
        briefingError: error instanceof Error ? error.message : 'Failed to generate briefing',
      })
    }
  },

  fetchStats: async () => {
    try {
      const stats = await betterBrainService.getStats()
      set({ stats })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  },

  checkHealth: async () => {
    const isHealthy = await betterBrainService.checkHealth()
    set({ isHealthy, lastHealthCheck: new Date() })
    return isHealthy
  },

  searchItems: async (query) => {
    set({ isLoadingItems: true, itemsError: null })

    try {
      const response = await betterBrainService.searchItems(query)
      // Convert search results to items format
      set({
        items: response.results.map((r) => ({
          id: r.id,
          url: r.url,
          title: r.title,
          content_type: r.content_type,
          summary: r.summary,
          source: null,
          thumbnail_url: null,
          status: 'processed' as const,
          ingested_at: '',
          metadata: { score: r.score },
        })),
        totalItems: response.total,
        isLoadingItems: false,
      })
    } catch (error) {
      set({
        isLoadingItems: false,
        itemsError: error instanceof Error ? error.message : 'Search failed',
      })
    }
  },

  reprocessPending: async (limit = 20) => {
    try {
      await betterBrainService.reprocessPending(limit)
      // Refresh stats after reprocessing
      await get().fetchStats()
    } catch (error) {
      console.error('Failed to reprocess pending items:', error)
    }
  },
}))
