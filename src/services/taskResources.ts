// Task Resources Service
// Handles communication with the Mashboard API for task resources and file uploads

import type {
  TaskResource,
  CreateTaskResourcePayload,
  UpdateTaskResourcePayload,
  UploadedFile,
} from '@/types/taskResource'

class TaskResourcesService {
  private get baseUrl(): string {
    // Use the same origin when proxied, or fallback to direct API
    return '/api/mashboard'
  }

  // ============================================================================
  // TASK RESOURCES
  // ============================================================================

  /**
   * Get all resources for a task
   */
  async getResourcesForTask(taskId: string): Promise<TaskResource[]> {
    const response = await fetch(`${this.baseUrl}/task-resources/${taskId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch task resources: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * Create a new resource for a task
   */
  async createResource(
    taskId: string,
    payload: CreateTaskResourcePayload
  ): Promise<TaskResource> {
    const response = await fetch(`${this.baseUrl}/task-resources/${taskId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error(`Failed to create task resource: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * Update an existing resource
   */
  async updateResource(
    taskId: string,
    resourceId: number,
    payload: UpdateTaskResourcePayload
  ): Promise<TaskResource> {
    const response = await fetch(
      `${this.baseUrl}/task-resources/${taskId}/${resourceId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    if (!response.ok) {
      throw new Error(`Failed to update task resource: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * Delete a resource
   */
  async deleteResource(taskId: string, resourceId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/task-resources/${taskId}/${resourceId}`,
      { method: 'DELETE' }
    )
    if (!response.ok) {
      throw new Error(`Failed to delete task resource: ${response.statusText}`)
    }
  }

  /**
   * Reorder resources for a task
   */
  async reorderResources(
    taskId: string,
    resourceIds: number[]
  ): Promise<TaskResource[]> {
    const response = await fetch(
      `${this.baseUrl}/task-resources/${taskId}/reorder`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceIds }),
      }
    )
    if (!response.ok) {
      throw new Error(`Failed to reorder task resources: ${response.statusText}`)
    }
    return response.json()
  }

  // ============================================================================
  // FILE UPLOADS
  // ============================================================================

  /**
   * Upload a file
   */
  async uploadFile(file: File): Promise<UploadedFile> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * Get file URL
   */
  getFileUrl(storageKey: string): string {
    return `${this.baseUrl}/files/${storageKey}`
  }

  /**
   * Get file metadata
   */
  async getFileMeta(storageKey: string): Promise<UploadedFile> {
    const response = await fetch(`${this.baseUrl}/files/${storageKey}/meta`)
    if (!response.ok) {
      throw new Error(`Failed to fetch file metadata: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * Delete a file
   */
  async deleteFile(storageKey: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/files/${storageKey}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`)
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Determine resource type from file MIME type
   */
  getResourceTypeFromMime(mimeType: string): 'file' | 'pdf' | 'spreadsheet' | 'audio' {
    if (mimeType === 'application/pdf') return 'pdf'
    if (
      mimeType.includes('spreadsheet') ||
      mimeType.includes('excel') ||
      mimeType === 'text/csv'
    ) {
      return 'spreadsheet'
    }
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'file'
  }

  /**
   * Check if a URL is embeddable in an iframe
   * Note: This is a heuristic - actual embedding depends on the site's CSP
   */
  isLikelyEmbeddable(url: string): boolean {
    // YouTube, Vimeo, etc. are embeddable
    const embeddablePatterns = [
      /youtube\.com/,
      /youtu\.be/,
      /vimeo\.com/,
      /soundcloud\.com/,
      /spotify\.com/,
      /codepen\.io/,
      /codesandbox\.io/,
      /figma\.com/,
      /notion\.so/,
      /docs\.google\.com/,
    ]
    return embeddablePatterns.some((pattern) => pattern.test(url))
  }
}

export const taskResourcesService = new TaskResourcesService()
