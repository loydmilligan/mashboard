// Settings API service
// Stores settings in PostgreSQL instead of localStorage

const API_BASE = '/api/mashboard'

export interface SettingsData {
  openRouterKey?: string
  termix?: {
    baseUrl: string
    token: string
    iframeUrl: string
  }
  dumbpad?: {
    baseUrl: string
  }
  bytestash?: {
    baseUrl: string
    apiKey: string
  }
  searxng?: {
    baseUrl: string
  }
  dozzle?: {
    baseUrl: string
  }
  vikunja?: {
    baseUrl: string
    token: string
    iframeUrl: string
  }
  notemark?: {
    baseUrl: string
    token: string
    iframeUrl: string
    username: string
    defaultBookId: string
    configuredNotes: Array<{
      id: string
      name: string
      noteId: string
      icon: string
      color: string
    }>
  }
  betterBrain?: {
    baseUrl: string
  }
  youtubeMusic?: {
    clientId: string
    clientSecret: string
    refreshToken: string
  }
  spotify?: {
    clientId: string
    clientSecret: string
    refreshToken: string
  }
  ai?: {
    defaultModel: string
    favoriteModels: string[]
    summaryModel: string
    deepReasoningDefault: boolean
    customModels: string
  }
  appearance?: {
    theme: 'light' | 'dark' | 'system'
    sidebarBehavior: 'push' | 'overlay'
  }
  panelTimeouts?: {
    aiSidebar: number
    notesSidebar: number
    terminalPanel: number
  }
  servicesEnabled?: {
    openRouter: boolean
    termix: boolean
    dumbpad: boolean
    bytestash: boolean
    searxng: boolean
    dozzle: boolean
    vikunja: boolean
    notemark: boolean
    betterBrain: boolean
  }
}

class SettingsService {
  private userId = 'default'

  async getSettings(): Promise<SettingsData> {
    try {
      const response = await fetch(`${API_BASE}/settings?userId=${this.userId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching settings:', error)
      return {}
    }
  }

  async saveSettings(settings: SettingsData): Promise<SettingsData> {
    try {
      const response = await fetch(`${API_BASE}/settings?userId=${this.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('Error saving settings:', error)
      throw error
    }
  }

  async patchSettings(updates: Partial<SettingsData>): Promise<SettingsData> {
    try {
      const response = await fetch(`${API_BASE}/settings?userId=${this.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error(`Failed to patch settings: ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('Error patching settings:', error)
      throw error
    }
  }
}

export const settingsService = new SettingsService()
