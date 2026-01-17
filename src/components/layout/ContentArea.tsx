import {
  X,
  Plus,
  Terminal,
  Code2,
  Search,
  Home,
  Globe,
  FileText,
  Image,
  FileType,
  Music,
  Table,
  Youtube,
  Pin,
  Copy,
  XCircle,
  ArrowRightToLine,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  ContextMenuCheckboxItem,
} from '@/components/ui/context-menu'
import { useContentStore } from '@/stores/contentStore'
import type { AppType, ContentTab } from '@/stores/contentStore'
import { cn } from '@/lib/utils'

// App configurations
const APP_CONFIG: Record<AppType, { icon: React.ReactNode; label: string }> = {
  // Core apps
  termix: { icon: <Terminal className="h-4 w-4" />, label: 'Termix' },
  bytestash: { icon: <Code2 className="h-4 w-4" />, label: 'ByteStash' },
  searxng: { icon: <Search className="h-4 w-4" />, label: 'Search' },
  'home-assistant': { icon: <Home className="h-4 w-4" />, label: 'Home Assistant' },
  betterbrain: { icon: <Database className="h-4 w-4" />, label: 'Better Brain' },
  'music-league': { icon: <Music className="h-4 w-4" />, label: 'Music League' },
  // Viewer apps
  webview: { icon: <Globe className="h-4 w-4" />, label: 'Web View' },
  'notemark-viewer': { icon: <FileText className="h-4 w-4" />, label: 'Note' },
  'image-viewer': { icon: <Image className="h-4 w-4" />, label: 'Image' },
  'pdf-viewer': { icon: <FileType className="h-4 w-4" />, label: 'PDF' },
  'audio-player': { icon: <Music className="h-4 w-4" />, label: 'Audio' },
  'spreadsheet-viewer': { icon: <Table className="h-4 w-4" />, label: 'Spreadsheet' },
  youtube: { icon: <Youtube className="h-4 w-4" />, label: 'YouTube' },
  'code-viewer': { icon: <Code2 className="h-4 w-4" />, label: 'Code' },
}

interface TabProps {
  tab: ContentTab
  tabIndex: number
  totalTabs: number
  isActive: boolean
  onSelect: () => void
  onClose: () => void
}

function Tab({ tab, tabIndex, totalTabs, isActive, onSelect, onClose }: TabProps) {
  const { closeOtherTabs, closeTabsToRight, duplicateTab, togglePinTab } = useContentStore()
  const config = APP_CONFIG[tab.appType]

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'group flex h-9 items-center gap-2 border-r border-border px-3',
            'cursor-pointer transition-colors',
            isActive ? 'bg-background' : 'bg-muted/50 hover:bg-muted',
            tab.isPinned && 'bg-primary/5'
          )}
          onClick={onSelect}
        >
          {tab.isPinned && <Pin className="h-3 w-3 text-primary" />}
          {config?.icon}
          <span className="max-w-[120px] truncate text-sm">{tab.title}</span>
          {!tab.isPinned && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'ml-1 h-5 w-5 p-0',
                'opacity-0 transition-opacity group-hover:opacity-100',
                isActive && 'opacity-50 hover:opacity-100'
              )}
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Close
          <ContextMenuShortcut>⌘W</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => closeOtherTabs(tab.id)}
          disabled={totalTabs <= 1}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Close Other Tabs
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => closeTabsToRight(tab.id)}
          disabled={tabIndex >= totalTabs - 1}
        >
          <ArrowRightToLine className="mr-2 h-4 w-4" />
          Close Tabs to Right
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => duplicateTab(tab.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate Tab
        </ContextMenuItem>
        <ContextMenuCheckboxItem
          checked={tab.isPinned}
          onCheckedChange={() => togglePinTab(tab.id)}
        >
          <Pin className="mr-2 h-4 w-4" />
          Pin Tab
        </ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function EmptyState() {
  const { openTab } = useContentStore()

  const handleOpenApp = (appType: AppType) => {
    openTab({
      appType,
      title: APP_CONFIG[appType].label,
    })
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background p-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Terminal className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium">No apps open</h3>
      <p className="mb-6 text-sm text-muted-foreground">
        Select an app from the Tools panel or use the button below
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => handleOpenApp('termix')}>
          <Terminal className="mr-2 h-4 w-4" />
          Open Termix
        </Button>
        <Button variant="outline" onClick={() => handleOpenApp('bytestash')}>
          <Code2 className="mr-2 h-4 w-4" />
          Open ByteStash
        </Button>
      </div>
    </div>
  )
}

// App components
import { TermixApp } from '@/components/features/content-apps/apps/TermixApp'
import { ByteStashApp } from '@/components/features/content-apps/apps/ByteStashApp'
import { SearxngApp } from '@/components/features/content-apps/apps/SearxngApp'
import { BetterBrainApp } from '@/components/features/content-apps/apps/BetterBrainApp'
import { MusicLeagueApp } from '@/components/features/content-apps/apps/MusicLeagueApp'
// Viewer apps
import { WebViewApp } from '@/components/features/content-apps/apps/WebViewApp'
import { NoteMarkViewerApp } from '@/components/features/content-apps/apps/NoteMarkViewerApp'
import { ImageViewerApp } from '@/components/features/content-apps/apps/ImageViewerApp'
import { PdfViewerApp } from '@/components/features/content-apps/apps/PdfViewerApp'
import { AudioPlayerApp } from '@/components/features/content-apps/apps/AudioPlayerApp'
import { SpreadsheetViewerApp } from '@/components/features/content-apps/apps/SpreadsheetViewerApp'
import { YouTubeApp } from '@/components/features/content-apps/apps/YouTubeApp'
import { CodeViewerApp } from '@/components/features/content-apps/apps/CodeViewerApp'

function AppRenderer({ tab }: { tab: ContentTab }) {
  // Use Record<string, unknown> for flexible prop access
  const props = (tab.props || {}) as Record<string, unknown>

  switch (tab.appType) {
    // Core apps
    case 'termix':
      return <TermixApp />
    case 'bytestash':
      return <ByteStashApp />
    case 'searxng':
      return <SearxngApp query={props.query as string} />
    case 'home-assistant':
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Home Assistant coming soon</p>
        </div>
      )
    case 'betterbrain':
      return <BetterBrainApp />
    case 'music-league':
      return <MusicLeagueApp />
    // Viewer apps
    case 'webview':
      return <WebViewApp url={props.url as string} />
    case 'notemark-viewer':
      return (
        <NoteMarkViewerApp
          noteId={props.noteId as string}
          notePath={props.notePath as string | undefined}
        />
      )
    case 'image-viewer':
      return (
        <ImageViewerApp
          url={props.url as string}
          originalName={props.originalName as string | undefined}
        />
      )
    case 'pdf-viewer':
      return (
        <PdfViewerApp
          url={props.url as string}
          originalName={props.originalName as string | undefined}
        />
      )
    case 'audio-player':
      return (
        <AudioPlayerApp
          url={props.url as string}
          originalName={props.originalName as string | undefined}
        />
      )
    case 'spreadsheet-viewer':
      return (
        <SpreadsheetViewerApp
          url={props.url as string}
          originalName={props.originalName as string | undefined}
          sheetName={props.sheetName as string | undefined}
        />
      )
    case 'youtube':
      return (
        <YouTubeApp
          videoId={props.videoId as string}
          startTime={props.startTime as number | undefined}
        />
      )
    case 'code-viewer':
      return (
        <CodeViewerApp
          url={props.url as string}
          originalName={props.originalName as string | undefined}
          language={props.language as string | undefined}
        />
      )
    default:
      return null
  }
}

export function ContentArea() {
  const { openTabs, activeTabId, setActiveTab, closeTab, openTab } = useContentStore()

  const activeTab = openTabs.find((t) => t.id === activeTabId)

  const handleAddTab = (appType: AppType) => {
    openTab({
      appType,
      title: APP_CONFIG[appType].label,
    })
  }

  if (openTabs.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Tab Bar */}
      <div className="flex h-9 shrink-0 items-center border-b border-border bg-muted/30">
        {openTabs.map((tab, index) => (
          <Tab
            key={tab.id}
            tab={tab}
            tabIndex={index}
            totalTabs={openTabs.length}
            isActive={tab.id === activeTabId}
            onSelect={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
          />
        ))}

        {/* Add Tab Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-1 h-7 w-7 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleAddTab('termix')}>
              <Terminal className="mr-2 h-4 w-4" />
              Termix
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddTab('bytestash')}>
              <Code2 className="mr-2 h-4 w-4" />
              ByteStash
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddTab('searxng')}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddTab('betterbrain')}>
              <Database className="mr-2 h-4 w-4" />
              Better Brain
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddTab('music-league')}>
              <Music className="mr-2 h-4 w-4" />
              Music League
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab ? (
          <AppRenderer tab={activeTab} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Select a tab</p>
          </div>
        )}
      </div>
    </div>
  )
}
