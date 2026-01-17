import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'

// Core app types (existing)
export type CoreAppType =
  | 'termix'
  | 'bytestash'
  | 'searxng'
  | 'home-assistant'
  | 'betterbrain'
  | 'music-league'

// Resource viewer types (new - for task resources)
export type ViewerAppType =
  | 'webview'           // Generic iframe for embeddable links
  | 'notemark-viewer'   // NoteMark note display
  | 'image-viewer'      // Image viewer with zoom
  | 'pdf-viewer'        // PDF viewer
  | 'audio-player'      // Audio player
  | 'spreadsheet-viewer'// Spreadsheet viewer
  | 'youtube'           // YouTube player embed
  | 'code-viewer'       // Code/text file viewer

export type AppType = CoreAppType | ViewerAppType

// Props for different app types
export interface WebviewProps {
  url: string
}

export interface NotemarkViewerProps {
  noteId: string
  notePath?: string
}

export interface ImageViewerProps {
  url: string
  originalName?: string
}

export interface PdfViewerProps {
  url: string
  originalName?: string
}

export interface AudioPlayerProps {
  url: string
  originalName?: string
}

export interface SpreadsheetViewerProps {
  url: string
  originalName?: string
  sheetName?: string
}

export interface YoutubeProps {
  videoId: string
  startTime?: number
}

export interface CodeViewerProps {
  url: string
  originalName?: string
  language?: string
}

export interface TermixProps {
  connectionId?: string
  host?: string
  port?: number
  username?: string
}

export interface SearxngProps {
  query?: string
}

export type AppProps =
  | WebviewProps
  | NotemarkViewerProps
  | ImageViewerProps
  | PdfViewerProps
  | AudioPlayerProps
  | SpreadsheetViewerProps
  | YoutubeProps
  | CodeViewerProps
  | TermixProps
  | SearxngProps
  | Record<string, unknown>

export interface ContentTab {
  id: string
  appType: AppType
  title: string
  props?: AppProps
  // Optional: link to task resource for tracking
  taskResourceId?: number
  vikunjaTaskId?: string
  // Pin status for tab management
  isPinned?: boolean
}

interface ContentState {
  openTabs: ContentTab[]
  activeTabId: string | null

  // Actions
  openTab: (tab: Omit<ContentTab, 'id'>) => string // Returns the new tab ID
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string | null) => void
  updateTabProps: (tabId: string, props: Record<string, unknown>) => void
  reorderTabs: (tabIds: string[]) => void
  closeAllTabs: () => void
  closeTabsByTask: (vikunjaTaskId: string) => void
  findTabByResourceId: (taskResourceId: number) => ContentTab | undefined
  // Context menu actions
  closeOtherTabs: (tabId: string) => void
  closeTabsToRight: (tabId: string) => void
  duplicateTab: (tabId: string) => string | null
  togglePinTab: (tabId: string) => void
}

function generateId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      openTabs: [],
      activeTabId: null,

      openTab: (tab) => {
        const id = generateId()
        const newTab: ContentTab = { ...tab, id }

        set((state) => ({
          openTabs: [...state.openTabs, newTab],
          activeTabId: id,
        }))

        return id
      },

      closeTab: (tabId) => {
        const state = get()
        const tabIndex = state.openTabs.findIndex((t) => t.id === tabId)
        const newTabs = state.openTabs.filter((t) => t.id !== tabId)

        let newActiveId = state.activeTabId

        // If closing the active tab, switch to adjacent tab
        if (state.activeTabId === tabId) {
          if (newTabs.length === 0) {
            newActiveId = null
          } else if (tabIndex >= newTabs.length) {
            newActiveId = newTabs[newTabs.length - 1].id
          } else {
            newActiveId = newTabs[tabIndex].id
          }
        }

        set({
          openTabs: newTabs,
          activeTabId: newActiveId,
        })
      },

      setActiveTab: (tabId) => {
        set({ activeTabId: tabId })
      },

      updateTabProps: (tabId, props) => {
        set((state) => ({
          openTabs: state.openTabs.map((tab) =>
            tab.id === tabId ? { ...tab, props: { ...tab.props, ...props } } : tab
          ),
        }))
      },

      reorderTabs: (tabIds) => {
        set((state) => {
          const tabMap = new Map(state.openTabs.map((t) => [t.id, t]))
          const reordered = tabIds
            .map((id) => tabMap.get(id))
            .filter((t): t is ContentTab => t !== undefined)
          return { openTabs: reordered }
        })
      },

      closeAllTabs: () => {
        set({ openTabs: [], activeTabId: null })
      },

      closeTabsByTask: (vikunjaTaskId) => {
        const state = get()
        const newTabs = state.openTabs.filter((t) => t.vikunjaTaskId !== vikunjaTaskId)

        let newActiveId = state.activeTabId
        // If active tab was closed, set to last tab or null
        if (state.activeTabId && !newTabs.find((t) => t.id === state.activeTabId)) {
          newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null
        }

        set({ openTabs: newTabs, activeTabId: newActiveId })
      },

      findTabByResourceId: (taskResourceId) => {
        return get().openTabs.find((t) => t.taskResourceId === taskResourceId)
      },

      closeOtherTabs: (tabId) => {
        const state = get()
        const tabToKeep = state.openTabs.find((t) => t.id === tabId)
        if (!tabToKeep) return

        // Keep pinned tabs and the specified tab
        const newTabs = state.openTabs.filter((t) => t.id === tabId || t.isPinned)

        set({
          openTabs: newTabs,
          activeTabId: tabId,
        })
      },

      closeTabsToRight: (tabId) => {
        const state = get()
        const tabIndex = state.openTabs.findIndex((t) => t.id === tabId)
        if (tabIndex === -1) return

        // Keep tabs up to and including this one, plus any pinned tabs to the right
        const newTabs = state.openTabs.filter((t, index) => index <= tabIndex || t.isPinned)

        let newActiveId = state.activeTabId
        // If active tab was closed, set to the clicked tab
        if (state.activeTabId && !newTabs.find((t) => t.id === state.activeTabId)) {
          newActiveId = tabId
        }

        set({ openTabs: newTabs, activeTabId: newActiveId })
      },

      duplicateTab: (tabId) => {
        const state = get()
        const tabToDuplicate = state.openTabs.find((t) => t.id === tabId)
        if (!tabToDuplicate) return null

        const newId = generateId()
        const duplicatedTab: ContentTab = {
          ...tabToDuplicate,
          id: newId,
          title: `${tabToDuplicate.title} (copy)`,
          isPinned: false, // Duplicated tabs are not pinned
        }

        // Insert after the original tab
        const tabIndex = state.openTabs.findIndex((t) => t.id === tabId)
        const newTabs = [...state.openTabs]
        newTabs.splice(tabIndex + 1, 0, duplicatedTab)

        set({
          openTabs: newTabs,
          activeTabId: newId,
        })

        return newId
      },

      togglePinTab: (tabId) => {
        set((state) => {
          const newTabs = state.openTabs.map((t) =>
            t.id === tabId ? { ...t, isPinned: !t.isPinned } : t
          )

          // Sort tabs: pinned first, then unpinned
          const pinned = newTabs.filter((t) => t.isPinned)
          const unpinned = newTabs.filter((t) => !t.isPinned)

          return { openTabs: [...pinned, ...unpinned] }
        })
      },
    }),
    {
      name: STORAGE_KEYS.CONTENT_TABS,
    }
  )
)
