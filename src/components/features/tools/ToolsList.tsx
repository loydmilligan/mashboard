import { Terminal, Code2, Zap, Plus, Search, Settings, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useContentStore } from '@/stores/contentStore'
import type { AppType } from '@/stores/contentStore'
import { useUIStore } from '@/stores/uiStore'
import { WorkflowLauncher } from '@/components/features/workflows/WorkflowLauncher'
import { cn } from '@/lib/utils'

interface Tool {
  id: AppType | 'workflows'
  name: string
  icon: React.ReactNode
  description: string
}

const tools: Tool[] = [
  {
    id: 'termix',
    name: 'Termix',
    icon: <Terminal className="h-4 w-4" />,
    description: 'SSH Terminal',
  },
  {
    id: 'bytestash',
    name: 'ByteStash',
    icon: <Code2 className="h-4 w-4" />,
    description: 'Code Snippets',
  },
  {
    id: 'searxng',
    name: 'Search',
    icon: <Search className="h-4 w-4" />,
    description: 'Web Search',
  },
]

export function ToolsList() {
  const { openTab, openTabs, setActiveTab } = useContentStore()
  const { setSettingsOpen } = useUIStore()

  const handleToolClick = (tool: Tool) => {
    // Check if app is already open
    const existingTab = openTabs.find((t) => t.appType === tool.id)
    if (existingTab) {
      setActiveTab(existingTab.id)
      return
    }

    // Open new tab
    openTab({
      appType: tool.id as AppType,
      title: tool.name,
    })
  }

  const handleOpenInNewTab = (tool: Tool) => {
    // Always open a new tab, even if one exists
    openTab({
      appType: tool.id as AppType,
      title: tool.name,
    })
  }

  return (
    <div className="space-y-1">
      {tools.map((tool) => {
        const isOpen = openTabs.some((t) => t.appType === tool.id)

        return (
          <ContextMenu key={tool.id}>
            <ContextMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start gap-2',
                  isOpen && 'bg-muted'
                )}
                onClick={() => handleToolClick(tool)}
              >
                {tool.icon}
                <span className="flex-1 text-left">{tool.name}</span>
                <span className="text-xs text-muted-foreground">
                  {isOpen ? 'Open' : ''}
                </span>
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem onClick={() => handleOpenInNewTab(tool)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {isOpen ? 'Open Another Tab' : 'Open in New Tab'}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Configure Settings
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )
      })}

      {/* Workflow Launcher */}
      <WorkflowLauncher
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <Zap className="h-4 w-4" />
            <span className="flex-1 text-left">Workflows</span>
            <Zap className="h-3 w-3 text-muted-foreground" />
          </Button>
        }
        align="start"
        side="right"
      />

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground"
        disabled
      >
        <Plus className="h-4 w-4" />
        <span>Add Tool</span>
      </Button>
    </div>
  )
}
