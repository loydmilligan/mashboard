import { useSettingsStore } from '@/stores/settingsStore'
import type { Snippet, SnippetSearchResult, CreateSnippetInput } from '@/types/snippet'

class ByteStashService {
  private get baseUrl(): string {
    return useSettingsStore.getState().bytestash.baseUrl
  }

  private get apiKey(): string {
    return useSettingsStore.getState().bytestash.apiKey
  }

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    }
  }

  async searchSnippets(query: string): Promise<SnippetSearchResult[]> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('ByteStash not configured')
    }

    const url = new URL(`${this.baseUrl}/api/snippets`)
    if (query) {
      url.searchParams.set('q', query)
    }

    const response = await fetch(url.toString(), {
      headers: this.headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid ByteStash API key')
      }
      throw new Error(`Failed to search snippets: ${response.statusText}`)
    }

    const data = await response.json()

    // Transform to SnippetSearchResult format
    return (data.snippets || data || []).map((snippet: Snippet) => ({
      id: snippet.id,
      title: snippet.title,
      description: snippet.description,
      categories: snippet.categories || [],
      language: snippet.fragments?.[0]?.language || 'text',
    }))
  }

  async getSnippet(id: string): Promise<Snippet> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('ByteStash not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/snippets/${id}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Snippet not found')
      }
      throw new Error(`Failed to fetch snippet: ${response.statusText}`)
    }

    return response.json()
  }

  async createSnippet(input: CreateSnippetInput): Promise<Snippet> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('ByteStash not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/snippets`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error(`Failed to create snippet: ${response.statusText}`)
    }

    return response.json()
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.apiKey)
  }

  getByteStashUrl(snippetId?: string): string {
    if (snippetId) {
      return `${this.baseUrl}/snippet/${snippetId}`
    }
    return this.baseUrl
  }
}

export const bytestashService = new ByteStashService()
