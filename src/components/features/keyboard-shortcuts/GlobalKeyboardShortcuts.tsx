import { useCallback } from 'react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import type { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts'
import { SHORTCUTS } from '@/lib/keyboardShortcuts'
import { useUIStore } from '@/stores/uiStore'
import { useContentStore } from '@/stores/contentStore'

/**
 * Global keyboard shortcuts handler
 * This component should be mounted once at the app root
 */
export function GlobalKeyboardShortcuts() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    toggleAiSidebar,
    toggleNotesSidebar,
    setSettingsOpen,
    togglePomodoroExpanded,
    closeAllOverlays,
  } = useUIStore()

  const { openTab, openTabs, setActiveTab } = useContentStore()

  // Helper to open or focus an app tab
  const openOrFocusApp = useCallback(
    (appType: 'termix' | 'bytestash' | 'searxng', title: string) => {
      const existingTab = openTabs.find((t) => t.appType === appType)
      if (existingTab) {
        setActiveTab(existingTab.id)
      } else {
        openTab({ appType, title })
      }
    },
    [openTabs, setActiveTab, openTab]
  )

  // Define all shortcuts with their actions
  const shortcuts: KeyboardShortcut[] = [
    // Command Palette (Mod+K)
    {
      ...SHORTCUTS.COMMAND_PALETTE,
      action: () => setCommandPaletteOpen(!commandPaletteOpen),
    },
    // AI Chat (Mod+/)
    {
      ...SHORTCUTS.AI_CHAT,
      action: () => {
        toggleAiSidebar()
        // Close command palette if it's open
        if (commandPaletteOpen) setCommandPaletteOpen(false)
      },
    },
    // Notes (Mod+Shift+N)
    {
      ...SHORTCUTS.NOTES,
      action: () => {
        toggleNotesSidebar()
        if (commandPaletteOpen) setCommandPaletteOpen(false)
      },
    },
    // Termix (Mod+`)
    {
      ...SHORTCUTS.TERMIX,
      action: () => {
        openOrFocusApp('termix', 'Termix')
        if (commandPaletteOpen) setCommandPaletteOpen(false)
      },
    },
    // ByteStash (Mod+Shift+B)
    {
      ...SHORTCUTS.BYTESTASH,
      action: () => {
        openOrFocusApp('bytestash', 'ByteStash')
        if (commandPaletteOpen) setCommandPaletteOpen(false)
      },
    },
    // Search (Mod+E)
    {
      ...SHORTCUTS.SEARCH,
      action: () => {
        openOrFocusApp('searxng', 'Search')
        if (commandPaletteOpen) setCommandPaletteOpen(false)
      },
    },
    // Pomodoro (Mod+Alt+P)
    {
      ...SHORTCUTS.POMODORO,
      action: () => {
        togglePomodoroExpanded()
        if (commandPaletteOpen) setCommandPaletteOpen(false)
      },
    },
    // Settings (Mod+,)
    {
      ...SHORTCUTS.SETTINGS,
      action: () => {
        setSettingsOpen(true)
        if (commandPaletteOpen) setCommandPaletteOpen(false)
      },
    },
    // Escape - close overlays
    {
      ...SHORTCUTS.ESCAPE,
      action: closeAllOverlays,
      // Don't prevent default for Escape so inputs can still use it
      preventDefault: false,
    },
  ]

  // Register all shortcuts
  useKeyboardShortcuts(shortcuts)

  // This component doesn't render anything
  return null
}

export default GlobalKeyboardShortcuts
