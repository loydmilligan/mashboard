import { useSettingsStore } from '@/stores/settingsStore'
import type { ServerInfo } from '@/types/termix'

// Termix API response format for /status endpoint
interface TermixStatusResponse {
  [hostId: string]: {
    status: 'online' | 'offline'
    lastChecked: string
  }
}

class TermixService {
  private get baseUrl(): string {
    return useSettingsStore.getState().termix.baseUrl
  }

  private get token(): string {
    return useSettingsStore.getState().termix.token
  }

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    }
  }

  async getAllServerInfo(): Promise<ServerInfo[]> {
    if (!this.baseUrl || !this.token) {
      throw new Error('Termix not configured')
    }

    const response = await fetch(`${this.baseUrl}/status`, {
      headers: this.headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Termix token')
      }
      throw new Error(`Failed to fetch status: ${response.statusText}`)
    }

    const data: TermixStatusResponse = await response.json()

    // Convert Termix format to our ServerInfo format
    return Object.entries(data).map(([hostId, info]) => ({
      host: {
        id: hostId,
        name: `Server ${hostId}`, // Termix /status doesn't return host names
        hostname: '',
      },
      status: {
        hostId,
        online: info.status === 'online',
        lastSeen: info.lastChecked ? new Date(info.lastChecked).getTime() : null,
      },
    }))
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.token)
  }
}

export const termixService = new TermixService()
