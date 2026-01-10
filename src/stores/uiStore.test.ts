import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUIStore } from './uiStore'

// Mock STORAGE_KEYS
vi.mock('@/lib/constants', () => ({
  STORAGE_KEYS: {
    UI: 'mashb0ard-ui',
  },
}))

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useUIStore.setState({
      aiSidebarOpen: false,
      notesSidebarOpen: false,
      terminalPanelOpen: false,
      terminalPanelHeight: 300,
      commandPaletteOpen: false,
      settingsOpen: false,
      snippetsPopoverOpen: false,
    })
  })

  describe('AI Sidebar', () => {
    it('should toggle AI sidebar from closed to open', () => {
      const store = useUIStore.getState()
      expect(store.aiSidebarOpen).toBe(false)

      store.toggleAiSidebar()
      expect(useUIStore.getState().aiSidebarOpen).toBe(true)
    })

    it('should toggle AI sidebar from open to closed', () => {
      useUIStore.setState({ aiSidebarOpen: true })
      const store = useUIStore.getState()

      store.toggleAiSidebar()
      expect(useUIStore.getState().aiSidebarOpen).toBe(false)
    })
  })

  describe('Notes Sidebar', () => {
    it('should toggle notes sidebar', () => {
      const store = useUIStore.getState()
      expect(store.notesSidebarOpen).toBe(false)

      store.toggleNotesSidebar()
      expect(useUIStore.getState().notesSidebarOpen).toBe(true)

      store.toggleNotesSidebar()
      expect(useUIStore.getState().notesSidebarOpen).toBe(false)
    })

    it('should set notes sidebar open state directly', () => {
      const store = useUIStore.getState()

      store.setNotesSidebarOpen(true)
      expect(useUIStore.getState().notesSidebarOpen).toBe(true)

      store.setNotesSidebarOpen(false)
      expect(useUIStore.getState().notesSidebarOpen).toBe(false)
    })
  })

  describe('Terminal Panel', () => {
    it('should toggle terminal panel', () => {
      const store = useUIStore.getState()
      expect(store.terminalPanelOpen).toBe(false)

      store.toggleTerminalPanel()
      expect(useUIStore.getState().terminalPanelOpen).toBe(true)
    })

    it('should set terminal panel height', () => {
      const store = useUIStore.getState()
      store.setTerminalPanelHeight(500)
      expect(useUIStore.getState().terminalPanelHeight).toBe(500)
    })
  })

  describe('Command Palette', () => {
    it('should set command palette open state', () => {
      const store = useUIStore.getState()

      store.setCommandPaletteOpen(true)
      expect(useUIStore.getState().commandPaletteOpen).toBe(true)

      store.setCommandPaletteOpen(false)
      expect(useUIStore.getState().commandPaletteOpen).toBe(false)
    })
  })

  describe('Settings', () => {
    it('should set settings open state', () => {
      const store = useUIStore.getState()

      store.setSettingsOpen(true)
      expect(useUIStore.getState().settingsOpen).toBe(true)

      store.setSettingsOpen(false)
      expect(useUIStore.getState().settingsOpen).toBe(false)
    })
  })

  describe('Snippets Popover', () => {
    it('should set snippets popover open state', () => {
      const store = useUIStore.getState()

      store.setSnippetsPopoverOpen(true)
      expect(useUIStore.getState().snippetsPopoverOpen).toBe(true)

      store.setSnippetsPopoverOpen(false)
      expect(useUIStore.getState().snippetsPopoverOpen).toBe(false)
    })
  })

  describe('Close All Overlays', () => {
    it('should close all overlay states', () => {
      // Open all overlays
      useUIStore.setState({
        commandPaletteOpen: true,
        settingsOpen: true,
        snippetsPopoverOpen: true,
      })

      const store = useUIStore.getState()
      store.closeAllOverlays()

      const newState = useUIStore.getState()
      expect(newState.commandPaletteOpen).toBe(false)
      expect(newState.settingsOpen).toBe(false)
      expect(newState.snippetsPopoverOpen).toBe(false)
    })

    it('should not affect sidebar states when closing overlays', () => {
      useUIStore.setState({
        aiSidebarOpen: true,
        notesSidebarOpen: true,
        commandPaletteOpen: true,
        settingsOpen: true,
      })

      const store = useUIStore.getState()
      store.closeAllOverlays()

      const newState = useUIStore.getState()
      expect(newState.aiSidebarOpen).toBe(true)
      expect(newState.notesSidebarOpen).toBe(true)
      expect(newState.commandPaletteOpen).toBe(false)
      expect(newState.settingsOpen).toBe(false)
    })
  })
})
