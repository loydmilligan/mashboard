import {
  Briefcase,
  Code,
  Coffee,
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
  Zap,
  Play,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Workflow } from '@/types/workflow'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  briefcase: Briefcase,
  code: Code,
  coffee: Coffee,
  folder: Folder,
  globe: Globe,
  home: Home,
  layers: Layers,
  mail: Mail,
  monitor: Monitor,
  rocket: Rocket,
  settings: Settings,
  star: Star,
  terminal: Terminal,
  zap: Zap,
}

interface WorkflowCardProps {
  workflow: Workflow
  onLaunch: () => void
  onEdit: () => void
  onDelete: () => void
}

export function WorkflowCard({ workflow, onLaunch, onEdit, onDelete }: WorkflowCardProps) {
  const IconComponent = ICON_MAP[workflow.icon || 'layers'] || Layers

  return (
    <div
      className="group relative flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted-foreground"
      style={{ '--workflow-color': workflow.color || '#3b82f6' } as React.CSSProperties}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${workflow.color || '#3b82f6'}20` }}
        >
          <IconComponent
            className="h-5 w-5"
            style={{ color: workflow.color || '#3b82f6' }}
          />
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <h3 className="mb-1 font-medium">{workflow.name}</h3>
      {workflow.description && (
        <p className="mb-3 text-sm text-muted-foreground">{workflow.description}</p>
      )}

      {/* URL count */}
      <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
        <ExternalLink className="h-3 w-3" />
        <span>{workflow.urls.length} link{workflow.urls.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Launch button */}
      <Button
        variant="default"
        size="sm"
        className="mt-auto w-full"
        onClick={onLaunch}
        style={{
          backgroundColor: workflow.color || '#3b82f6',
        }}
      >
        <Play className="mr-2 h-3.5 w-3.5" />
        Launch
      </Button>
    </div>
  )
}
