import { useSettingsStore } from '@/stores/settingsStore'

// Vikunja API types
export interface VikunjaProject {
  id: number
  title: string
  description: string
  identifier: string
  hex_color: string
  is_archived: boolean
  created: string
  updated: string
}

export interface VikunjaTask {
  id: number
  title: string
  description: string
  done: boolean
  done_at: string | null
  due_date: string | null
  priority: number // 0 = unset, 1 = low, 2 = medium, 3 = high, 4 = urgent, 5 = DO NOW
  project_id: number
  created: string
  updated: string
  position: number
  percent_done: number
  is_favorite: boolean
}

export interface VikunjaLabel {
  id: number
  title: string
  hex_color: string
  created: string
  updated: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  project_id: number
  due_date?: string
  priority?: number
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  done?: boolean
  due_date?: string | null
  priority?: number
}

class VikunjaService {
  private get baseUrl(): string {
    // Remove trailing slash to prevent double slashes in URLs
    const url = useSettingsStore.getState().vikunja.baseUrl
    return url.endsWith('/') ? url.slice(0, -1) : url
  }

  private get token(): string {
    return useSettingsStore.getState().vikunja.token
  }

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    }
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.token)
  }

  // ==========================================================================
  // PROJECTS
  // ==========================================================================

  async getProjects(): Promise<VikunjaProject[]> {
    if (!this.isConfigured()) {
      throw new Error('Vikunja not configured')
    }

    const response = await fetch(`${this.baseUrl}/projects`, {
      headers: this.headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Vikunja token')
      }
      throw new Error(`Failed to fetch projects: ${response.statusText}`)
    }

    return response.json()
  }

  async getProject(id: number): Promise<VikunjaProject> {
    if (!this.isConfigured()) {
      throw new Error('Vikunja not configured')
    }

    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`)
    }

    return response.json()
  }

  // ==========================================================================
  // TASKS
  // ==========================================================================

  async getAllTasks(params?: {
    page?: number
    per_page?: number
    filter_by?: string[]
    filter_value?: string[]
    filter_comparator?: string[]
    sort_by?: string
    order_by?: 'asc' | 'desc'
  }): Promise<VikunjaTask[]> {
    if (!this.isConfigured()) {
      throw new Error('Vikunja not configured')
    }

    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by)
    if (params?.order_by) searchParams.set('order_by', params.order_by)

    const url = `${this.baseUrl}/tasks/all${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await fetch(url, {
      headers: this.headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Vikunja token')
      }
      throw new Error(`Failed to fetch tasks: ${response.statusText}`)
    }

    return response.json()
  }

  async getProjectTasks(projectId: number): Promise<VikunjaTask[]> {
    if (!this.isConfigured()) {
      throw new Error('Vikunja not configured')
    }

    const response = await fetch(`${this.baseUrl}/projects/${projectId}/tasks`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch project tasks: ${response.statusText}`)
    }

    return response.json()
  }

  async getTask(id: number): Promise<VikunjaTask> {
    if (!this.isConfigured()) {
      throw new Error('Vikunja not configured')
    }

    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch task: ${response.statusText}`)
    }

    return response.json()
  }

  async createTask(input: CreateTaskInput): Promise<VikunjaTask> {
    if (!this.isConfigured()) {
      throw new Error('Vikunja not configured')
    }

    const response = await fetch(`${this.baseUrl}/projects/${input.project_id}/tasks`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`)
    }

    return response.json()
  }

  async updateTask(id: number, input: UpdateTaskInput): Promise<VikunjaTask> {
    if (!this.isConfigured()) {
      throw new Error('Vikunja not configured')
    }

    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`)
    }

    return response.json()
  }

  async toggleTaskDone(id: number, done: boolean): Promise<VikunjaTask> {
    return this.updateTask(id, { done })
  }

  async deleteTask(id: number): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Vikunja not configured')
    }

    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`)
    }
  }

  // ==========================================================================
  // LABELS
  // ==========================================================================

  async getLabels(): Promise<VikunjaLabel[]> {
    if (!this.isConfigured()) {
      throw new Error('Vikunja not configured')
    }

    const response = await fetch(`${this.baseUrl}/labels`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch labels: ${response.statusText}`)
    }

    return response.json()
  }
}

export const vikunjaService = new VikunjaService()
