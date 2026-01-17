import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'

interface UIState {
  // Sidebar states
  aiSidebarOpen: boolean
  notesSidebarOpen: boolean
  aiSidebarWidth: number
  notesSidebarWidth: number

  // Terminal panel
  terminalPanelOpen: boolean
  terminalPanelHeight: number

  // Logs panel
  logsPanelOpen: boolean
  logsPanelHeight: number

  // Pomodoro
  pomodoroExpanded: boolean

  // Overlays
  commandPaletteOpen: boolean
  settingsOpen: boolean
  snippetsPopoverOpen: boolean
  musicLeagueDrawerOpen: boolean

  // Actions
  toggleAiSidebar: () => void
  toggleNotesSidebar: () => void
  setNotesSidebarOpen: (open: boolean) => void
  setAiSidebarWidth: (width: number) => void
  setNotesSidebarWidth: (width: number) => void
  toggleTerminalPanel: () => void
  setTerminalPanelHeight: (height: number) => void
  toggleLogsPanel: () => void
  setLogsPanelHeight: (height: number) => void
  setPomodoroExpanded: (expanded: boolean) => void
  togglePomodoroExpanded: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setSnippetsPopoverOpen: (open: boolean) => void
  setMusicLeagueDrawerOpen: (open: boolean) => void
  toggleMusicLeagueDrawer: () => void
  closeAllOverlays: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial states
      aiSidebarOpen: false,
      notesSidebarOpen: false,
      aiSidebarWidth: 320,
      notesSidebarWidth: 320,
      terminalPanelOpen: false,
      terminalPanelHeight: 300,
      logsPanelOpen: false,
      logsPanelHeight: Math.floor(window.innerHeight * 0.67), // 2/3 of screen
      pomodoroExpanded: false,
      commandPaletteOpen: false,
      settingsOpen: false,
      snippetsPopoverOpen: false,
      musicLeagueDrawerOpen: false,

      // Actions
      toggleAiSidebar: () => set((state) => ({ aiSidebarOpen: !state.aiSidebarOpen })),
      toggleNotesSidebar: () => set((state) => ({ notesSidebarOpen: !state.notesSidebarOpen })),
      setNotesSidebarOpen: (open) => set({ notesSidebarOpen: open }),
      setAiSidebarWidth: (width) => set({ aiSidebarWidth: width }),
      setNotesSidebarWidth: (width) => set({ notesSidebarWidth: width }),
      toggleTerminalPanel: () => set((state) => ({ terminalPanelOpen: !state.terminalPanelOpen })),
      setTerminalPanelHeight: (height) => set({ terminalPanelHeight: height }),
      toggleLogsPanel: () => set((state) => ({ logsPanelOpen: !state.logsPanelOpen })),
      setLogsPanelHeight: (height) => set({ logsPanelHeight: height }),
      setPomodoroExpanded: (expanded) => set({ pomodoroExpanded: expanded }),
      togglePomodoroExpanded: () => set((state) => ({ pomodoroExpanded: !state.pomodoroExpanded })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setSnippetsPopoverOpen: (open) => set({ snippetsPopoverOpen: open }),
      setMusicLeagueDrawerOpen: (open) => set({ musicLeagueDrawerOpen: open }),
      toggleMusicLeagueDrawer: () => set((state) => ({ musicLeagueDrawerOpen: !state.musicLeagueDrawerOpen })),
      closeAllOverlays: () =>
        set({
          commandPaletteOpen: false,
          settingsOpen: false,
          snippetsPopoverOpen: false,
          pomodoroExpanded: false,
          musicLeagueDrawerOpen: false,
        }),
    }),
    {
      name: STORAGE_KEYS.UI,
      partialize: (state) => ({
        // Only persist certain values, not open states
        terminalPanelHeight: state.terminalPanelHeight,
        logsPanelHeight: state.logsPanelHeight,
        aiSidebarWidth: state.aiSidebarWidth,
        notesSidebarWidth: state.notesSidebarWidth,
      }),
    }
  )
)
