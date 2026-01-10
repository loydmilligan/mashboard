import { useState, useEffect } from 'react'
import {
  Globe,
  FileText,
  File,
  FileType,
  Table,
  Music,
  Youtube,
  Terminal,
  Trash2,
  GripVertical,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { taskResourcesService } from '@/services/taskResources'
import type { TaskResource, ResourceType } from '@/types/taskResource'
import { cn } from '@/lib/utils'

interface TaskResourceListProps {
  taskId: string
  onOpenResource?: (resource: TaskResource) => void
  className?: string
}

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  weblink: <Globe className="h-4 w-4" />,
  notemark: <FileText className="h-4 w-4" />,
  file: <File className="h-4 w-4" />,
  pdf: <FileType className="h-4 w-4" />,
  spreadsheet: <Table className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  ssh: <Terminal className="h-4 w-4" />,
}

export function TaskResourceList({
  taskId,
  onOpenResource,
  className,
}: TaskResourceListProps) {
  const [resources, setResources] = useState<TaskResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchResources = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await taskResourcesService.getResourcesForTask(taskId)
      setResources(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (taskId) {
      fetchResources()
    }
  }, [taskId])

  const handleDelete = async (resourceId: number) => {
    try {
      setDeletingId(resourceId)
      await taskResourcesService.deleteResource(taskId, resourceId)
      setResources((prev) => prev.filter((r) => r.id !== resourceId))
    } catch (err) {
      console.error('Failed to delete resource:', err)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-4', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('text-sm text-destructive py-2', className)}>
        {error}
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground py-2', className)}>
        No resources attached
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-grab" />
          <span className="text-muted-foreground">
            {RESOURCE_ICONS[resource.resource_type]}
          </span>
          <span
            className="flex-1 truncate text-sm cursor-pointer hover:underline"
            onClick={() => onOpenResource?.(resource)}
          >
            {resource.title}
          </span>
          {onOpenResource && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => onOpenResource(resource)}
              title="Open"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
            onClick={() => handleDelete(resource.id)}
            disabled={deletingId === resource.id}
            title="Delete"
          >
            {deletingId === resource.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}

export default TaskResourceList
