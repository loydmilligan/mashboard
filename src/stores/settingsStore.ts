import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { settingsService } from '@/services/settings'
import { STORAGE_KEYS } from '@/lib/constants'

interface TermixConfig {
  baseUrl: string // API base URL (e.g., /api/termix)
  token: string
  iframeUrl: string // Direct URL for iframe embedding (e.g., http://localhost:8080)
}

interface DumbpadConfig {
  baseUrl: string
}

interface ByteStashConfig {
  baseUrl: string
  apiKey: string
}

interface SearxngConfig {
  baseUrl: string
}

interface DozzleConfig {
  baseUrl: string // URL for Dozzle (e.g., /dozzle)
}

interface VikunjaConfig {
  baseUrl: string // API URL (e.g., /api/vikunja)
  token: string // API token (starts with tk_)
  iframeUrl: string // Direct URL for iframe embedding
}

interface ConfiguredNote {
  id: string // Unique identifier for the configured note type
  name: string // Display name (e.g., "Ideas", "Research")
  noteId: string // NoteMark note UUID
  icon: string // Lucide icon name
  color: string // Tailwind color class
}

interface NoteMarkConfig {
  baseUrl: string // API URL (e.g., /api/notemark)
  token: string // JWT access token
  iframeUrl: string // Direct URL for iframe embedding
  username: string // Username for slug-based access
  defaultBookId: string // Default book for quick note creation
  configuredNotes: ConfiguredNote[] // Quick-access configured notes
}

interface AIPreferences {
  defaultModel: string
  favoriteModels: string[]
  summaryModel: string
  deepReasoningDefault: boolean
  customModels: string // newline-separated list of model IDs
  streamingEnabled: boolean // Enable streaming responses (default: true)
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  sidebarBehavior: 'push' | 'overlay'
}

interface PanelTimeouts {
  aiSidebar: number // 0 = disabled, otherwise milliseconds
  notesSidebar: number
  terminalPanel: number
}

// Track which services are enabled
interface ServicesEnabled {
  openRouter: boolean
  termix: boolean
  dumbpad: boolean
  bytestash: boolean
  searxng: boolean
  dozzle: boolean
  vikunja: boolean
  notemark: boolean
}

interface SettingsState {
  // Loading state
  isLoading: boolean
  isInitialized: boolean
  lastSaved: Date | null

  // API Keys & URLs
  openRouterKey: string
  termix: TermixConfig
  dumbpad: DumbpadConfig
  bytestash: ByteStashConfig
  searxng: SearxngConfig
  dozzle: DozzleConfig
  vikunja: VikunjaConfig
  notemark: NoteMarkConfig

  // Services enabled/disabled
  servicesEnabled: ServicesEnabled

  // AI Preferences
  ai: AIPreferences

  // Appearance
  appearance: AppearanceSettings

  // Panel auto-hide timeouts
  panelTimeouts: PanelTimeouts

  // Actions
  fetchSettings: () => Promise<void>
  saveSettings: () => Promise<void>
  setOpenRouterKey: (key: string) => void
  setTermixConfig: (config: Partial<TermixConfig>) => void
  setDumbpadConfig: (config: Partial<DumbpadConfig>) => void
  setBytestashConfig: (config: Partial<ByteStashConfig>) => void
  setSearxngConfig: (config: Partial<SearxngConfig>) => void
  setDozzleConfig: (config: Partial<DozzleConfig>) => void
  setVikunjaConfig: (config: Partial<VikunjaConfig>) => void
  setNoteMarkConfig: (config: Partial<NoteMarkConfig>) => void
  setServicesEnabled: (services: Partial<ServicesEnabled>) => void
  setAIPreferences: (prefs: Partial<AIPreferences>) => void
  setAppearance: (settings: Partial<AppearanceSettings>) => void
  setPanelTimeouts: (timeouts: Partial<PanelTimeouts>) => void
  exportSettings: () => string
  importSettings: (json: string) => boolean
  clearAllData: () => void
}

const defaultSettings = {
  openRouterKey: '',
  termix: {
    baseUrl: '',
    token: '',
    iframeUrl: '',
  },
  dumbpad: {
    baseUrl: '',
  },
  bytestash: {
    baseUrl: '',
    apiKey: '',
  },
  searxng: {
    baseUrl: '',
  },
  dozzle: {
    baseUrl: '/dozzle',
  },
  vikunja: {
    baseUrl: '/api/vikunja',
    token: '',
    iframeUrl: '',
  },
  notemark: {
    baseUrl: '/api/notemark',
    token: '',
    iframeUrl: '',
    username: '',
    defaultBookId: '',
    configuredNotes: [
      { id: 'ideas', name: 'Ideas', noteId: '', icon: 'Lightbulb', color: 'text-yellow-500' },
      { id: 'research', name: 'Research', noteId: '', icon: 'BookOpen', color: 'text-blue-500' },
      { id: 'quickthoughts', name: 'Quick Thoughts', noteId: '', icon: 'Zap', color: 'text-purple-500' },
    ],
  },
  ai: {
    defaultModel: 'anthropic/claude-3.5-sonnet',
    favoriteModels: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'anthropic/claude-3-opus',
      'google/gemini-pro-1.5',
      'meta-llama/llama-3.1-405b-instruct',
    ],
    summaryModel: 'anthropic/claude-3-haiku',
    deepReasoningDefault: false,
    customModels: '', // empty = use defaults
    streamingEnabled: true, // Enable streaming by default
  },
  appearance: {
    theme: 'dark' as const,
    sidebarBehavior: 'overlay' as const,
  },
  panelTimeouts: {
    aiSidebar: 0, // 0 = disabled (stays open)
    notesSidebar: 0,
    terminalPanel: 0,
  },
  servicesEnabled: {
    openRouter: true,
    termix: true,
    dumbpad: true,
    bytestash: true,
    searxng: true,
    dozzle: true,
    vikunja: true,
    notemark: true,
  },
}

// Debounce helper
let saveTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSave = (saveFunc: () => Promise<void>) => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveFunc()
  }, 500) // Save 500ms after last change
}

// Helper to get settings data (without actions and meta fields)
const getSettingsData = (state: SettingsState) => ({
  openRouterKey: state.openRouterKey,
  termix: state.termix,
  dumbpad: state.dumbpad,
  bytestash: state.bytestash,
  searxng: state.searxng,
  dozzle: state.dozzle,
  vikunja: state.vikunja,
  notemark: state.notemark,
  ai: state.ai,
  appearance: state.appearance,
  panelTimeouts: state.panelTimeouts,
  servicesEnabled: state.servicesEnabled,
})

export const useSettingsStore = create<SettingsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial loading state
    isLoading: true,
    isInitialized: false,
    lastSaved: null,

    ...defaultSettings,

    fetchSettings: async () => {
      set({ isLoading: true })
      try {
        const serverSettings = await settingsService.getSettings()

        // Merge server settings with defaults (server takes precedence)
        set({
          openRouterKey: serverSettings.openRouterKey ?? defaultSettings.openRouterKey,
          termix: { ...defaultSettings.termix, ...serverSettings.termix },
          dumbpad: { ...defaultSettings.dumbpad, ...serverSettings.dumbpad },
          bytestash: { ...defaultSettings.bytestash, ...serverSettings.bytestash },
          searxng: { ...defaultSettings.searxng, ...serverSettings.searxng },
          dozzle: { ...defaultSettings.dozzle, ...serverSettings.dozzle },
          vikunja: { ...defaultSettings.vikunja, ...serverSettings.vikunja },
          notemark: { ...defaultSettings.notemark, ...serverSettings.notemark },
          ai: { ...defaultSettings.ai, ...serverSettings.ai },
          appearance: { ...defaultSettings.appearance, ...serverSettings.appearance },
          panelTimeouts: { ...defaultSettings.panelTimeouts, ...serverSettings.panelTimeouts },
          servicesEnabled: { ...defaultSettings.servicesEnabled, ...serverSettings.servicesEnabled },
          isLoading: false,
          isInitialized: true,
        })
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        set({ isLoading: false, isInitialized: true })
      }
    },

    saveSettings: async () => {
      const state = get()
      try {
        await settingsService.saveSettings(getSettingsData(state))
        set({ lastSaved: new Date() })
      } catch (error) {
        console.error('Failed to save settings:', error)
      }
    },

    setOpenRouterKey: (key) => {
      set({ openRouterKey: key })
      debouncedSave(get().saveSettings)
    },

    setTermixConfig: (config) => {
      set((state) => ({
        termix: { ...state.termix, ...config },
      }))
      debouncedSave(get().saveSettings)
    },

    setDumbpadConfig: (config) => {
      set((state) => ({
        dumbpad: { ...state.dumbpad, ...config },
      }))
      debouncedSave(get().saveSettings)
    },

    setBytestashConfig: (config) => {
      set((state) => ({
        bytestash: { ...state.bytestash, ...config },
      }))
      debouncedSave(get().saveSettings)
    },

    setSearxngConfig: (config) => {
      set((state) => ({
        searxng: { ...state.searxng, ...config },
      }))
      debouncedSave(get().saveSettings)
    },

    setDozzleConfig: (config) => {
      set((state) => ({
        dozzle: { ...state.dozzle, ...config },
      }))
      debouncedSave(get().saveSettings)
    },

    setVikunjaConfig: (config) => {
      set((state) => ({
        vikunja: { ...state.vikunja, ...config },
      }))
      debouncedSave(get().saveSettings)
    },

    setNoteMarkConfig: (config) => {
      set((state) => ({
        notemark: { ...state.notemark, ...config },
      }))
      debouncedSave(get().saveSettings)
    },

    setServicesEnabled: (services) => {
      set((state) => ({
        servicesEnabled: { ...state.servicesEnabled, ...services },
      }))
      debouncedSave(get().saveSettings)
    },

    setAIPreferences: (prefs) => {
      set((state) => ({
        ai: { ...state.ai, ...prefs },
      }))
      debouncedSave(get().saveSettings)
    },

    setAppearance: (settings) => {
      set((state) => ({
        appearance: { ...state.appearance, ...settings },
      }))
      debouncedSave(get().saveSettings)
    },

    setPanelTimeouts: (timeouts) => {
      set((state) => ({
        panelTimeouts: { ...state.panelTimeouts, ...timeouts },
      }))
      debouncedSave(get().saveSettings)
    },

    exportSettings: () => {
      const state = get()
      const exportData = {
        ...getSettingsData(state),
        exportedAt: new Date().toISOString(),
        version: 1,
      }
      return JSON.stringify(exportData, null, 2)
    },

    importSettings: (json) => {
      try {
        const data = JSON.parse(json)
        if (data.openRouterKey !== undefined) set({ openRouterKey: data.openRouterKey })
        if (data.termix) set({ termix: { ...defaultSettings.termix, ...data.termix } })
        if (data.dumbpad) set({ dumbpad: { ...defaultSettings.dumbpad, ...data.dumbpad } })
        if (data.bytestash) set({ bytestash: { ...defaultSettings.bytestash, ...data.bytestash } })
        if (data.searxng) set({ searxng: { ...defaultSettings.searxng, ...data.searxng } })
        if (data.dozzle) set({ dozzle: { ...defaultSettings.dozzle, ...data.dozzle } })
        if (data.vikunja) set({ vikunja: { ...defaultSettings.vikunja, ...data.vikunja } })
        if (data.notemark) set({ notemark: { ...defaultSettings.notemark, ...data.notemark } })
        if (data.ai) set({ ai: { ...defaultSettings.ai, ...data.ai } })
        if (data.appearance) set({ appearance: { ...defaultSettings.appearance, ...data.appearance } })
        if (data.panelTimeouts) set({ panelTimeouts: { ...defaultSettings.panelTimeouts, ...data.panelTimeouts } })
        if (data.servicesEnabled) set({ servicesEnabled: { ...defaultSettings.servicesEnabled, ...data.servicesEnabled } })
        // Save imported settings to server
        get().saveSettings()
        return true
      } catch {
        return false
      }
    },

    clearAllData: () => {
      // Clear old localStorage keys for mashb0ard (cleanup migration)
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
      // Reset to defaults
      set(defaultSettings)
      // Save cleared settings to server
      get().saveSettings()
    },
  }))
)

// Initialize settings on app load
if (typeof window !== 'undefined') {
  useSettingsStore.getState().fetchSettings()
}
