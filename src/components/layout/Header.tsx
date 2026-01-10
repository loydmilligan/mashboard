import {
  MessageSquare,
  FileText,
  Sun,
  Moon,
  Settings,
  HelpCircle,
  ScrollText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { SnippetsPopover } from '@/components/features/snippets/SnippetsPopover'
import { SearchBar } from '@/components/features/search/SearchBar'
import { HeaderPomodoro } from '@/components/features/pomodoro/HeaderPomodoro'
import { APP_NAME } from '@/lib/constants'
import { SHORTCUTS, getShortcutDisplay } from '@/lib/keyboardShortcuts'

// Keyboard shortcut badge component
function ShortcutBadge({ shortcut }: { shortcut: string }) {
  return (
    <span className="hidden lg:inline-flex ml-1 text-[10px] opacity-40 font-mono">
      {shortcut}
    </span>
  )
}

export function Header() {
  const {
    toggleAiSidebar,
    toggleNotesSidebar,
    toggleLogsPanel,
    setSettingsOpen,
    pomodoroExpanded,
    setPomodoroExpanded,
  } = useUIStore()

  const { appearance, setAppearance } = useSettingsStore()

  const toggleTheme = () => {
    setAppearance({ theme: appearance.theme === 'dark' ? 'light' : 'dark' })
  }

  const togglePomodoro = () => {
    setPomodoroExpanded(!pomodoroExpanded)
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* Left section: Logo and AI toggle */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>

        <div className="h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAiSidebar}
          aria-label="Toggle AI chat"
          title={`Toggle AI chat (${getShortcutDisplay(SHORTCUTS.AI_CHAT)})`}
          className="flex items-center gap-1 px-2"
        >
          <MessageSquare className="h-4 w-4" />
          <ShortcutBadge shortcut={getShortcutDisplay(SHORTCUTS.AI_CHAT)} />
        </Button>
      </div>

      {/* Center section: Pomodoro Timer + Search */}
      <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
        <HeaderPomodoro expanded={pomodoroExpanded} onToggle={togglePomodoro} />
        <SearchBar />
      </div>

      {/* Right section: Action icons */}
      <div className="flex items-center gap-2">
        <SnippetsPopover />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLogsPanel}
          aria-label="Toggle logs"
          title="Container Logs"
        >
          <ScrollText className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNotesSidebar}
          aria-label="Toggle notes"
          title={`Toggle notes (${getShortcutDisplay(SHORTCUTS.NOTES)})`}
          className="flex items-center gap-1 px-2"
        >
          <FileText className="h-4 w-4" />
          <ShortcutBadge shortcut={getShortcutDisplay(SHORTCUTS.NOTES)} />
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {appearance.theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          title={`Settings (${getShortcutDisplay(SHORTCUTS.SETTINGS)})`}
          className="flex items-center gap-1 px-2"
        >
          <Settings className="h-4 w-4" />
          <ShortcutBadge shortcut={getShortcutDisplay(SHORTCUTS.SETTINGS)} />
        </Button>

        <Button variant="ghost" size="icon" aria-label="Help" title="Help">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
