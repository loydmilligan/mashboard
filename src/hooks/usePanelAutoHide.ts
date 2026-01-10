import { useEffect, useRef, useCallback } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'

type PanelType = 'aiSidebar' | 'notesSidebar' | 'terminalPanel'

export function usePanelAutoHide(panelType: PanelType): {
  resetTimer: () => void
  clearTimer: () => void
} {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelTimeouts = useSettingsStore((state) => state.panelTimeouts)

  const getCloseAction = useCallback(() => {
    const store = useUIStore.getState()
    switch (panelType) {
      case 'aiSidebar':
        return () => store.aiSidebarOpen && useUIStore.setState({ aiSidebarOpen: false })
      case 'notesSidebar':
        return () => store.notesSidebarOpen && useUIStore.setState({ notesSidebarOpen: false })
      case 'terminalPanel':
        return () => store.terminalPanelOpen && useUIStore.setState({ terminalPanelOpen: false })
    }
  }, [panelType])

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const resetTimer = useCallback(() => {
    clearTimer()
    const timeout = panelTimeouts[panelType]
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        getCloseAction()()
      }, timeout)
    }
  }, [panelTimeouts, panelType, clearTimer, getCloseAction])

  // Clean up on unmount
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  return { resetTimer, clearTimer }
}

// Simplified hook that auto-starts timer when panel opens
export function useAutoHidePanel(
  panelType: PanelType,
  isOpen: boolean
): void {
  const { resetTimer, clearTimer } = usePanelAutoHide(panelType)

  useEffect(() => {
    if (isOpen) {
      resetTimer()
    } else {
      clearTimer()
    }
  }, [isOpen, resetTimer, clearTimer])
}
