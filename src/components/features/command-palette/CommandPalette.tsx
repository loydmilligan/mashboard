import { useMemo } from 'react'
import {
  MessageSquare,
  FileText,
  Terminal,
  Settings,
  Code2,
  Play,
  StickyNote,
  Sun,
  Moon,
  Search,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useUIStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePinnedNotesStore } from '@/stores/pinnedNotesStore'
import { useContentStore } from '@/stores/contentStore'
import { SHORTCUTS, getShortcutDisplay } from '@/lib/keyboardShortcuts'

interface CommandAction {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  keywords?: string[]
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const {
    toggleAiSidebar,
    toggleNotesSidebar,
    setSettingsOpen,
    setSnippetsPopoverOpen,
  } = useUIStore()
  const { appearance, setAppearance } = useSettingsStore()
  const { workflows, launchWorkflow } = useWorkflowStore()
  const { pinnedNotes } = usePinnedNotesStore()
  const { openTab, openTabs, setActiveTab } = useContentStore()

  // Close palette when action is executed
  const runAction = (action: () => void) => {
    action()
    setCommandPaletteOpen(false)
  }

  // Helper to open or focus app
  const openOrFocusApp = (appType: 'termix' | 'bytestash' | 'searxng', title: string) => {
    const existingTab = openTabs.find((t) => t.appType === appType)
    if (existingTab) {
      setActiveTab(existingTab.id)
    } else {
      openTab({ appType, title })
    }
  }

  // Core actions
  const coreActions: CommandAction[] = useMemo(
    () => [
      {
        id: 'ai-chat',
        label: 'Open AI Chat',
        icon: <MessageSquare className="mr-2 h-4 w-4" />,
        shortcut: getShortcutDisplay(SHORTCUTS.AI_CHAT),
        action: () => runAction(toggleAiSidebar),
        keywords: ['chat', 'assistant', 'claude', 'ai'],
      },
      {
        id: 'notes',
        label: 'Open Notes',
        icon: <FileText className="mr-2 h-4 w-4" />,
        shortcut: getShortcutDisplay(SHORTCUTS.NOTES),
        action: () => runAction(toggleNotesSidebar),
        keywords: ['notes', 'dumbpad', 'notepad'],
      },
      {
        id: 'termix',
        label: 'Open Termix',
        icon: <Terminal className="mr-2 h-4 w-4" />,
        shortcut: getShortcutDisplay(SHORTCUTS.TERMIX),
        action: () => runAction(() => openOrFocusApp('termix', 'Termix')),
        keywords: ['terminal', 'console', 'ssh', 'termix'],
      },
      {
        id: 'bytestash',
        label: 'Open ByteStash',
        icon: <Code2 className="mr-2 h-4 w-4" />,
        shortcut: getShortcutDisplay(SHORTCUTS.BYTESTASH),
        action: () => runAction(() => openOrFocusApp('bytestash', 'ByteStash')),
        keywords: ['snippets', 'code', 'bytestash'],
      },
      {
        id: 'search',
        label: 'Open Search',
        icon: <Search className="mr-2 h-4 w-4" />,
        shortcut: getShortcutDisplay(SHORTCUTS.SEARCH),
        action: () => runAction(() => openOrFocusApp('searxng', 'Search')),
        keywords: ['search', 'web', 'searxng'],
      },
      {
        id: 'snippets-popover',
        label: 'Quick Snippets',
        icon: <Code2 className="mr-2 h-4 w-4" />,
        action: () => runAction(() => setSnippetsPopoverOpen(true)),
        keywords: ['snippets', 'quick'],
      },
      {
        id: 'settings',
        label: 'Open Settings',
        icon: <Settings className="mr-2 h-4 w-4" />,
        shortcut: getShortcutDisplay(SHORTCUTS.SETTINGS),
        action: () => runAction(() => setSettingsOpen(true)),
        keywords: ['settings', 'preferences', 'config'],
      },
      {
        id: 'toggle-theme',
        label: appearance.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        icon:
          appearance.theme === 'dark' ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          ),
        action: () =>
          runAction(() =>
            setAppearance({ theme: appearance.theme === 'dark' ? 'light' : 'dark' })
          ),
        keywords: ['theme', 'dark', 'light', 'mode'],
      },
    ],
    [
      appearance.theme,
      toggleAiSidebar,
      toggleNotesSidebar,
      openTabs,
      setActiveTab,
      openTab,
      setSnippetsPopoverOpen,
      setSettingsOpen,
      setAppearance,
    ]
  )

  // Workflow actions
  const workflowActions: CommandAction[] = useMemo(
    () =>
      workflows.map((workflow) => ({
        id: `workflow-${workflow.id}`,
        label: `Launch: ${workflow.name}`,
        icon: <Play className="mr-2 h-4 w-4" />,
        action: () => runAction(() => launchWorkflow(workflow.id)),
        keywords: ['workflow', 'launch', workflow.name.toLowerCase()],
      })),
    [workflows, launchWorkflow]
  )

  // Pinned note actions
  const pinnedNoteActions: CommandAction[] = useMemo(
    () =>
      pinnedNotes.map((note) => ({
        id: `note-${note.id}`,
        label: `${note.emoji} ${note.name}`,
        icon: <StickyNote className="mr-2 h-4 w-4" />,
        action: () =>
          runAction(() => {
            if (window.openNote) {
              window.openNote(note.notepadId)
            }
          }),
        keywords: ['note', 'pinned', note.name.toLowerCase()],
      })),
    [pinnedNotes]
  )

  // Keyboard shortcuts are now handled globally by GlobalKeyboardShortcuts component

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          {coreActions.map((action) => (
            <CommandItem key={action.id} onSelect={action.action} keywords={action.keywords}>
              {action.icon}
              <span>{action.label}</span>
              {action.shortcut && <CommandShortcut>{action.shortcut}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>

        {workflowActions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Workflows">
              {workflowActions.map((action) => (
                <CommandItem key={action.id} onSelect={action.action} keywords={action.keywords}>
                  {action.icon}
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {pinnedNoteActions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Pinned Notes">
              {pinnedNoteActions.map((action) => (
                <CommandItem key={action.id} onSelect={action.action} keywords={action.keywords}>
                  {action.icon}
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
