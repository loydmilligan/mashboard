import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSettingsStore } from './settingsStore'

// Mock STORAGE_KEYS
vi.mock('@/lib/constants', () => ({
  STORAGE_KEYS: {
    SETTINGS: 'mashb0ard-settings',
    CHAT: 'mashb0ard-chat',
    WORKFLOWS: 'mashb0ard-workflows',
    PINNED_NOTES: 'mashb0ard-pinned-notes',
    UI: 'mashb0ard-ui',
    LAYOUT: 'mashb0ard-layout',
    CONTENT_TABS: 'mashb0ard-content-tabs',
  },
}))

describe('settingsStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    const store = useSettingsStore.getState()
    store.setOpenRouterKey('')
    store.setTermixConfig({ baseUrl: '', token: '', iframeUrl: '' })
    store.setDumbpadConfig({ baseUrl: '' })
    store.setBytestashConfig({ baseUrl: '', apiKey: '' })
    store.setSearxngConfig({ baseUrl: '' })
    store.setAIPreferences({
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
      customModels: '',
    })
    store.setAppearance({ theme: 'dark', sidebarBehavior: 'overlay' })
  })

  describe('OpenRouter key', () => {
    it('should set OpenRouter key', () => {
      const store = useSettingsStore.getState()
      store.setOpenRouterKey('sk-or-v1-test-key')
      expect(useSettingsStore.getState().openRouterKey).toBe('sk-or-v1-test-key')
    })

    it('should clear OpenRouter key', () => {
      const store = useSettingsStore.getState()
      store.setOpenRouterKey('sk-or-v1-test-key')
      store.setOpenRouterKey('')
      expect(useSettingsStore.getState().openRouterKey).toBe('')
    })
  })

  describe('Termix config', () => {
    it('should set Termix config partially', () => {
      const store = useSettingsStore.getState()
      store.setTermixConfig({ baseUrl: '/api/termix' })
      expect(useSettingsStore.getState().termix.baseUrl).toBe('/api/termix')
      expect(useSettingsStore.getState().termix.token).toBe('')
    })

    it('should set Termix config fully', () => {
      const store = useSettingsStore.getState()
      store.setTermixConfig({
        baseUrl: '/api/termix',
        token: 'jwt-token',
        iframeUrl: 'http://localhost:8080',
      })
      expect(useSettingsStore.getState().termix).toEqual({
        baseUrl: '/api/termix',
        token: 'jwt-token',
        iframeUrl: 'http://localhost:8080',
      })
    })
  })

  describe('Dumbpad config', () => {
    it('should set Dumbpad base URL', () => {
      const store = useSettingsStore.getState()
      store.setDumbpadConfig({ baseUrl: '/dumbpad' })
      expect(useSettingsStore.getState().dumbpad.baseUrl).toBe('/dumbpad')
    })
  })

  describe('ByteStash config', () => {
    it('should set ByteStash config', () => {
      const store = useSettingsStore.getState()
      store.setBytestashConfig({ baseUrl: '/bytestash', apiKey: 'bs_key' })
      expect(useSettingsStore.getState().bytestash).toEqual({
        baseUrl: '/bytestash',
        apiKey: 'bs_key',
      })
    })
  })

  describe('SearXNG config', () => {
    it('should set SearXNG base URL', () => {
      const store = useSettingsStore.getState()
      store.setSearxngConfig({ baseUrl: '/searxng' })
      expect(useSettingsStore.getState().searxng.baseUrl).toBe('/searxng')
    })
  })

  describe('AI preferences', () => {
    it('should set default model', () => {
      const store = useSettingsStore.getState()
      store.setAIPreferences({ defaultModel: 'openai/gpt-4o' })
      expect(useSettingsStore.getState().ai.defaultModel).toBe('openai/gpt-4o')
    })

    it('should set favorite models', () => {
      const store = useSettingsStore.getState()
      const newFavorites = ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet']
      store.setAIPreferences({ favoriteModels: newFavorites })
      expect(useSettingsStore.getState().ai.favoriteModels).toEqual(newFavorites)
    })

    it('should set deep reasoning default', () => {
      const store = useSettingsStore.getState()
      store.setAIPreferences({ deepReasoningDefault: true })
      expect(useSettingsStore.getState().ai.deepReasoningDefault).toBe(true)
    })
  })

  describe('Appearance settings', () => {
    it('should set theme', () => {
      const store = useSettingsStore.getState()
      store.setAppearance({ theme: 'light' })
      expect(useSettingsStore.getState().appearance.theme).toBe('light')
    })

    it('should set sidebar behavior', () => {
      const store = useSettingsStore.getState()
      store.setAppearance({ sidebarBehavior: 'push' })
      expect(useSettingsStore.getState().appearance.sidebarBehavior).toBe('push')
    })
  })

  describe('Panel timeouts', () => {
    it('should set panel timeouts', () => {
      const store = useSettingsStore.getState()
      store.setPanelTimeouts({ aiSidebar: 5000, notesSidebar: 3000 })
      expect(useSettingsStore.getState().panelTimeouts.aiSidebar).toBe(5000)
      expect(useSettingsStore.getState().panelTimeouts.notesSidebar).toBe(3000)
    })
  })

  describe('Export/Import settings', () => {
    it('should export settings as JSON', () => {
      const store = useSettingsStore.getState()
      store.setOpenRouterKey('test-key')
      store.setTermixConfig({ baseUrl: '/api/termix' })

      const exported = store.exportSettings()
      const parsed = JSON.parse(exported)

      expect(parsed.openRouterKey).toBe('test-key')
      expect(parsed.termix.baseUrl).toBe('/api/termix')
      expect(parsed.exportedAt).toBeDefined()
      expect(parsed.version).toBe(1)
    })

    it('should import valid settings JSON', () => {
      const store = useSettingsStore.getState()
      const importData = {
        openRouterKey: 'imported-key',
        termix: { baseUrl: '/imported-termix', token: 'token', iframeUrl: '' },
        dumbpad: { baseUrl: '/imported-dumbpad' },
      }

      const result = store.importSettings(JSON.stringify(importData))
      expect(result).toBe(true)
      expect(useSettingsStore.getState().openRouterKey).toBe('imported-key')
      expect(useSettingsStore.getState().termix.baseUrl).toBe('/imported-termix')
      expect(useSettingsStore.getState().dumbpad.baseUrl).toBe('/imported-dumbpad')
    })

    it('should reject invalid JSON', () => {
      const store = useSettingsStore.getState()
      const result = store.importSettings('invalid json')
      expect(result).toBe(false)
    })

    it('should handle partial imports', () => {
      const store = useSettingsStore.getState()
      store.setOpenRouterKey('existing-key')

      const importData = {
        dumbpad: { baseUrl: '/new-dumbpad' },
      }

      const result = store.importSettings(JSON.stringify(importData))
      expect(result).toBe(true)
      expect(useSettingsStore.getState().openRouterKey).toBe('existing-key') // unchanged
      expect(useSettingsStore.getState().dumbpad.baseUrl).toBe('/new-dumbpad') // updated
    })
  })
})
