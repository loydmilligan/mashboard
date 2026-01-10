import { create } from 'zustand'
import { vikunjaService } from '@/services/vikunja'
import type { VikunjaTask, VikunjaProject, CreateTaskInput } from '@/services/vikunja'

interface TaskState {
  // Data
  tasks: VikunjaTask[]
  projects: VikunjaProject[]
  selectedProjectId: number | null

  // UI state
  isLoading: boolean
  error: string | null
  quickAddOpen: boolean

  // Actions
  fetchTasks: () => Promise<void>
  fetchProjects: () => Promise<void>
  setSelectedProject: (projectId: number | null) => void
  createTask: (input: CreateTaskInput) => Promise<VikunjaTask>
  toggleTaskDone: (taskId: number, done: boolean) => Promise<void>
  deleteTask: (taskId: number) => Promise<void>
  setQuickAddOpen: (open: boolean) => void
  clearError: () => void
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  // Initial state
  tasks: [],
  projects: [],
  selectedProjectId: null,
  isLoading: false,
  error: null,
  quickAddOpen: false,

  // Actions
  fetchTasks: async () => {
    if (!vikunjaService.isConfigured()) {
      set({ error: 'Vikunja not configured' })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const tasks = await vikunjaService.getAllTasks({
        per_page: 50,
        sort_by: 'due_date',
        order_by: 'asc',
      })
      // Filter out done tasks and sort by priority then due date
      const activeTasks = tasks
        .filter((t) => !t.done)
        .sort((a, b) => {
          // Higher priority first (5 is highest)
          if (b.priority !== a.priority) {
            return b.priority - a.priority
          }
          // Then by due date (null dates last)
          if (a.due_date && b.due_date) {
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          }
          if (a.due_date) return -1
          if (b.due_date) return 1
          return 0
        })
      set({ tasks: activeTasks, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        isLoading: false,
      })
    }
  },

  fetchProjects: async () => {
    if (!vikunjaService.isConfigured()) {
      return
    }

    try {
      const projects = await vikunjaService.getProjects()
      set({ projects: projects.filter((p) => !p.is_archived) })
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  },

  setSelectedProject: (projectId) => {
    set({ selectedProjectId: projectId })
  },

  createTask: async (input) => {
    set({ isLoading: true, error: null })
    try {
      const task = await vikunjaService.createTask(input)
      // Refresh tasks after creation
      await get().fetchTasks()
      set({ isLoading: false })
      return task
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create task',
        isLoading: false,
      })
      throw error
    }
  },

  toggleTaskDone: async (taskId, done) => {
    try {
      await vikunjaService.toggleTaskDone(taskId, done)
      // Optimistically update the UI
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }))
    } catch (error) {
      // Revert on error by refetching
      await get().fetchTasks()
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
      })
    }
  },

  deleteTask: async (taskId) => {
    try {
      await vikunjaService.deleteTask(taskId)
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete task',
      })
    }
  },

  setQuickAddOpen: (open) => {
    set({ quickAddOpen: open })
  },

  clearError: () => {
    set({ error: null })
  },
}))

// Helper functions
export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 5:
      return 'DO NOW'
    case 4:
      return 'Urgent'
    case 3:
      return 'High'
    case 2:
      return 'Medium'
    case 1:
      return 'Low'
    default:
      return ''
  }
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 5:
      return 'text-red-500 bg-red-500/10'
    case 4:
      return 'text-orange-500 bg-orange-500/10'
    case 3:
      return 'text-yellow-500 bg-yellow-500/10'
    case 2:
      return 'text-blue-500 bg-blue-500/10'
    case 1:
      return 'text-gray-500 bg-gray-500/10'
    default:
      return ''
  }
}

export function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null

  const date = new Date(dueDate)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (dueDay.getTime() === today.getTime()) {
    return 'Today'
  }
  if (dueDay.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  }
  if (dueDay < today) {
    const daysOverdue = Math.floor((today.getTime() - dueDay.getTime()) / (1000 * 60 * 60 * 24))
    return `${daysOverdue}d overdue`
  }

  // Format as short date
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function getDueDateColor(dueDate: string | null): string {
  if (!dueDate) return ''

  const date = new Date(dueDate)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (dueDay < today) {
    return 'text-red-500' // Overdue
  }
  if (dueDay.getTime() === today.getTime()) {
    return 'text-orange-500' // Due today
  }
  return 'text-muted-foreground'
}
