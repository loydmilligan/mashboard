// Better Brain API Service

import { useSettingsStore } from '@/stores/settingsStore'
import type {
  BBItemDetail,
  BBBriefing,
  ItemListResponse,
  SearchResponse,
  BBStats,
  ContentType,
  ItemStatus,
} from '@/types/betterBrain'

const getBaseUrl = (): string => {
  const settings = useSettingsStore.getState()
  return settings.betterBrain?.baseUrl || '/api/betterbrain'
}

// --- Library ---

export async function getItems(
  contentType?: ContentType,
  params: {
    search?: string
    source?: string
    status?: ItemStatus
    limit?: number
    offset?: number
  } = {}
): Promise<ItemListResponse> {
  const baseUrl = getBaseUrl()

  // Map content type to endpoint
  let endpoint = 'items'
  if (contentType) {
    endpoint =
      contentType === 'model'
        ? 'models'
        : contentType === 'repo'
          ? 'repos'
          : contentType === 'video'
            ? 'videos'
            : 'news'
  }

  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set('search', params.search)
  if (params.source) searchParams.set('source', params.source)
  if (params.status) searchParams.set('status', params.status)
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.offset) searchParams.set('offset', params.offset.toString())

  const response = await fetch(`${baseUrl}/library/${endpoint}?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`)
  }

  return response.json()
}

export async function getItem(id: number): Promise<BBItemDetail> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/library/item/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch item: ${response.statusText}`)
  }

  return response.json()
}

// --- Search ---

export async function searchItems(
  query: string,
  contentTypes?: ContentType[],
  limit = 20
): Promise<SearchResponse> {
  const baseUrl = getBaseUrl()

  const response = await fetch(`${baseUrl}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      content_types: contentTypes,
      limit,
    }),
  })

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`)
  }

  return response.json()
}

// --- Briefings ---

export async function getLatestBriefing(): Promise<BBBriefing> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/briefing/latest`)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No briefings available')
    }
    throw new Error(`Failed to fetch briefing: ${response.statusText}`)
  }

  return response.json()
}

export async function getBriefings(limit = 10): Promise<BBBriefing[]> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/briefing/list?limit=${limit}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch briefings: ${response.statusText}`)
  }

  const data = await response.json()
  return data.briefings || []
}

export async function generateBriefing(): Promise<{ id: number; status: string; message: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/briefing/generate`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Failed to generate briefing: ${response.statusText}`)
  }

  return response.json()
}

// --- Stats ---

export async function getStats(): Promise<BBStats> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/stats`)

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`)
  }

  return response.json()
}

// --- Health ---

export async function checkHealth(): Promise<boolean> {
  const baseUrl = getBaseUrl()
  try {
    const response = await fetch(`${baseUrl}/health`)
    return response.ok
  } catch {
    return false
  }
}

// --- Admin ---

export async function reprocessPending(limit = 10): Promise<{ queued_count: number; message: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/reprocess-pending?limit=${limit}`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Failed to reprocess: ${response.statusText}`)
  }

  return response.json()
}

export async function reprocessFailed(limit = 10): Promise<{ queued_count: number; message: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/reprocess-failed?limit=${limit}`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Failed to reprocess: ${response.statusText}`)
  }

  return response.json()
}
