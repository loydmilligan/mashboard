import { useState } from 'react'
import {
  Zap,
  Play,
  Plus,
  Coffee,
  Code,
  Briefcase,
  Folder,
  Globe,
  Home,
  Layers,
  Mail,
  Monitor,
  Rocket,
  Settings,
  Star,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

// Map icon names to Lucide components
const iconMap: Record<string, React.ReactNode> = {
  briefcase: <Briefcase className="h-4 w-4" />,
  code: <Code className="h-4 w-4" />,
  coffee: <Coffee className="h-4 w-4" />,
  folder: <Folder className="h-4 w-4" />,
  globe: <Globe className="h-4 w-4" />,
  home: <Home className="h-4 w-4" />,
  layers: <Layers className="h-4 w-4" />,
  mail: <Mail className="h-4 w-4" />,
  monitor: <Monitor className="h-4 w-4" />,
  rocket: <Rocket className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
  terminal: <Terminal className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
}

interface WorkflowLauncherProps {
  trigger?: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function WorkflowLauncher({
  trigger,
  align = 'start',
  side = 'right',
}: WorkflowLauncherProps) {
  const [open, setOpen] = useState(false)
  const { workflows, launchWorkflow } = useWorkflowStore()

  const handleLaunch = (workflowId: string) => {
    launchWorkflow(workflowId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Zap className="h-4 w-4" />
            <span>Workflows</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        className="w-72 p-2"
        sideOffset={8}
      >
        <div className="mb-2 flex items-center justify-between px-2">
          <h4 className="text-sm font-medium">Launch Workflow</h4>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          {workflows.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No workflows yet
            </p>
          ) : (
            workflows.map((workflow) => (
              <button
                key={workflow.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-2 py-2',
                  'text-left transition-colors',
                  'hover:bg-muted focus:bg-muted focus:outline-none'
                )}
                onClick={() => handleLaunch(workflow.id)}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ backgroundColor: workflow.color || '#64748b' }}
                >
                  {workflow.icon && iconMap[workflow.icon] ? (
                    <span className="text-white">
                      {iconMap[workflow.icon]}
                    </span>
                  ) : (
                    <Zap className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{workflow.name}</p>
                  {workflow.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {workflow.description}
                    </p>
                  )}
                </div>
                <Play className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))
          )}
        </div>

        <div className="mt-2 border-t border-border pt-2">
          <p className="px-2 text-xs text-muted-foreground">
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} •{' '}
            {workflows.reduce((acc, w) => acc + w.urls.length, 0)} URLs
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
