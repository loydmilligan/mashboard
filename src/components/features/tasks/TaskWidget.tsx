import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Plus,
  RefreshCw,
  AlertCircle,
  Calendar,
  ExternalLink,
  Timer,
  Paperclip,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useTaskStore,
  getPriorityLabel,
  getPriorityColor,
  formatDueDate,
  getDueDateColor,
} from '@/stores/taskStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useUIStore } from '@/stores/uiStore'
import { vikunjaService } from '@/services/vikunja'
import { cn } from '@/lib/utils'
import { openAllResourcesForTask, openResourceAsTab } from '@/lib/openResourceAsTab'
import { TaskResourceList } from './TaskResourceList'
import { AddResourceDialog } from './AddResourceDialog'
import type { TaskResource } from '@/types/taskResource'

export function TaskWidget() {
  const {
    tasks,
    projects,
    isLoading,
    error,
    quickAddOpen,
    fetchTasks,
    fetchProjects,
    createTask,
    toggleTaskDone,
    setQuickAddOpen,
    clearError,
  } = useTaskStore()

  const { vikunja } = useSettingsStore()
  const { linkTask, start, currentTaskId } = usePomodoroStore()
  const { setPomodoroExpanded } = useUIStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Task resources UI state
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [addResourceTaskId, setAddResourceTaskId] = useState<number | null>(null)
  const [resourceRefreshKey, setResourceRefreshKey] = useState(0)

  const isConfigured = vikunjaService.isConfigured()

  // Claim a task for pomodoro - links it, starts timer, and opens resources
  const handleClaimTask = async (taskId: number, taskTitle: string) => {
    linkTask(taskId.toString(), taskTitle)
    start()
    setPomodoroExpanded(true)

    // Auto-open all resources for this task
    await openAllResourcesForTask(taskId.toString())
  }

  // Open a single resource as a tab
  const handleOpenResource = (resource: TaskResource) => {
    openResourceAsTab(resource, resource.vikunja_task_id)
  }

  // Toggle resource expansion for a task
  const toggleTaskExpanded = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  // Fetch tasks and projects on mount
  useEffect(() => {
    if (isConfigured) {
      fetchTasks()
      fetchProjects()
    }
  }, [isConfigured, fetchTasks, fetchProjects])

  // Handle quick add submit
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !projects.length) return

    setIsSubmitting(true)
    try {
      // Use the first project as default (or could add project selector)
      await createTask({
        title: newTaskTitle.trim(),
        project_id: projects[0].id,
      })
      setNewTaskTitle('')
      setQuickAddOpen(false)
    } catch {
      // Error is handled in the store
    } finally {
      setIsSubmitting(false)
    }
  }

  // Not configured state
  if (!isConfigured) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-medium">Tasks</h3>
        <p className="text-sm text-muted-foreground">
          Configure Vikunja in Settings to see your tasks.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b pl-8 pr-4 py-3">
        <h3 className="font-medium">Tasks</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => fetchTasks()}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
          {vikunja.iframeUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => window.open(vikunja.iframeUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setQuickAddOpen(!quickAddOpen)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Add Form */}
      {quickAddOpen && (
        <form onSubmit={handleQuickAdd} className="border-b px-4 py-2">
          <div className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a task..."
              className="h-8 text-sm"
              autoFocus
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newTaskTitle.trim() || isSubmitting || !projects.length}
            >
              Add
            </Button>
          </div>
          {!projects.length && (
            <p className="mt-1 text-xs text-muted-foreground">
              No projects found. Create a project in Vikunja first.
            </p>
          )}
        </form>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="flex-1">{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Task List */}
      <div className="max-h-[400px] overflow-y-auto">
        {tasks.length === 0 && !isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No tasks. Click + to add one.
          </div>
        ) : (
          <ul className="divide-y">
            {tasks.slice(0, 10).map((task) => {
              const isClaimedTask = currentTaskId === task.id.toString()
              const isExpanded = expandedTaskId === task.id
              return (
                <li
                  key={task.id}
                  className={cn(
                    isClaimedTask && 'bg-red-500/10 border-l-2 border-red-500'
                  )}
                >
                  <div className="group flex items-start gap-3 px-4 py-2 hover:bg-muted/50">
                    {/* Expand/collapse button */}
                    <button
                      onClick={() => toggleTaskExpanded(task.id)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={() => toggleTaskDone(task.id, true)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary"
                    >
                      {task.done ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-sm',
                          task.done && 'text-muted-foreground line-through'
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.priority > 0 && (
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-xs font-medium',
                              getPriorityColor(task.priority)
                            )}
                          >
                            {getPriorityLabel(task.priority)}
                          </span>
                        )}
                        {task.due_date && (
                          <span
                            className={cn(
                              'flex items-center gap-1 text-xs',
                              getDueDateColor(task.due_date)
                            )}
                          >
                            <Calendar className="h-3 w-3" />
                            {formatDueDate(task.due_date)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add resource button */}
                    <button
                      onClick={() => setAddResourceTaskId(task.id)}
                      className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                      title="Add resource"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>

                    {/* Claim task for pomodoro button */}
                    {!task.done && (
                      <button
                        onClick={() => handleClaimTask(task.id, task.title)}
                        className={cn(
                          'mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                          isClaimedTask
                            ? 'text-red-500 opacity-100'
                            : 'text-muted-foreground hover:text-red-500'
                        )}
                        title={isClaimedTask ? 'Currently focused' : 'Start pomodoro with this task'}
                      >
                        <Timer className={cn('h-4 w-4', isClaimedTask && 'animate-pulse')} />
                      </button>
                    )}
                  </div>

                  {/* Expanded resources section */}
                  {isExpanded && (
                    <div className="ml-8 px-4 pb-2">
                      <TaskResourceList
                        key={`${task.id}-${resourceRefreshKey}`}
                        taskId={task.id.toString()}
                        onOpenResource={handleOpenResource}
                        className="text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-7 text-xs text-muted-foreground"
                        onClick={() => setAddResourceTaskId(task.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add resource
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {tasks.length > 10 && (
        <div className="border-t px-4 py-2 text-center text-xs text-muted-foreground">
          +{tasks.length - 10} more tasks
        </div>
      )}

      {/* Add Resource Dialog */}
      <AddResourceDialog
        open={addResourceTaskId !== null}
        onOpenChange={(open) => !open && setAddResourceTaskId(null)}
        taskId={addResourceTaskId?.toString() || ''}
        onResourceAdded={() => setResourceRefreshKey((k) => k + 1)}
      />
    </div>
  )
}

export default TaskWidget
