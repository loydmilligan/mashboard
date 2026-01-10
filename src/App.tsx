import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { LeftPanel } from '@/components/layout/LeftPanel'
import { ContentArea } from '@/components/layout/ContentArea'
import { AIChatSidebar } from '@/components/features/ai-chat/AIChatSidebar'
import { NotesSidebar } from '@/components/features/notes/NotesSidebar'
import { LogsPanel } from '@/components/layout/LogsPanel'
import { SettingsDialog } from '@/components/features/settings/SettingsDialog'
import { CommandPalette } from '@/components/features/command-palette/CommandPalette'
import { GlobalKeyboardShortcuts } from '@/components/features/keyboard-shortcuts/GlobalKeyboardShortcuts'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { useAutoHidePanel } from '@/hooks/usePanelAutoHide'

function App() {
  const { appearance } = useSettingsStore()
  const { aiSidebarOpen, notesSidebarOpen } = useUIStore()

  // Auto-hide panels based on timeout settings
  useAutoHidePanel('aiSidebar', aiSidebarOpen)
  useAutoHidePanel('notesSidebar', notesSidebarOpen)

  // Apply theme on mount and when it changes
  useEffect(() => {
    const root = document.documentElement

    if (appearance.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('light', !prefersDark)
    } else {
      root.classList.toggle('light', appearance.theme === 'light')
    }
  }, [appearance.theme])

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Main layout area with sidebars */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* AI Chat Sidebar (left overlay) */}
        <AIChatSidebar />

        {/* Main Split Layout */}
        <SplitLayout
          leftPanel={<LeftPanel />}
          rightPanel={<ContentArea />}
          className="flex-1"
        />

        {/* Notes Sidebar (right overlay) */}
        <NotesSidebar />
      </div>

      {/* Modals */}
      <SettingsDialog />
      <CommandPalette />

      {/* Slide-up Panels */}
      <LogsPanel />

      {/* Global Keyboard Shortcuts Handler */}
      <GlobalKeyboardShortcuts />
    </div>
  )
}

export default App
