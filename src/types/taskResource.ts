// Task Resource Types
// Defines the different types of resources that can be attached to tasks

export type ResourceType =
  | 'weblink'      // Iframe-embeddable URLs
  | 'notemark'     // Notes from NoteMark system
  | 'file'         // Images, code, txt, csv, markdown
  | 'pdf'          // PDF documents
  | 'spreadsheet'  // XLS/XLSX/CSV files
  | 'audio'        // Music/audio files
  | 'youtube'      // YouTube video embeds
  | 'ssh'          // Termix SSH connections (including WSL)

// Config structures for each resource type
export interface WeblinkConfig {
  url: string
}

export interface NotemarkConfig {
  noteId: string
  notePath?: string
}

export interface FileConfig {
  storageKey: string
  originalName: string
  mimeType: string
  sizeBytes: number
}

export interface PdfConfig {
  storageKey: string
  originalName: string
}

export interface SpreadsheetConfig {
  storageKey: string
  originalName: string
  sheetName?: string
}

export interface AudioConfig {
  storageKey?: string
  url?: string
  originalName?: string
}

export interface YoutubeConfig {
  videoId: string
  startTime?: number
}

export interface SshConfig {
  connectionId?: string  // Termix connection ID if saved
  host: string
  port: number
  username: string
}

export type ResourceConfig =
  | WeblinkConfig
  | NotemarkConfig
  | FileConfig
  | PdfConfig
  | SpreadsheetConfig
  | AudioConfig
  | YoutubeConfig
  | SshConfig

// Main Task Resource interface
export interface TaskResource {
  id: number
  vikunja_task_id: string
  resource_type: ResourceType
  title: string
  config: ResourceConfig
  sort_order: number
  created_at: string
  updated_at: string
}

// Create/Update payload
export interface CreateTaskResourcePayload {
  resource_type: ResourceType
  title: string
  config: ResourceConfig
  sort_order?: number
}

export interface UpdateTaskResourcePayload {
  resource_type?: ResourceType
  title?: string
  config?: ResourceConfig
  sort_order?: number
}

// Uploaded file metadata
export interface UploadedFile {
  id: number
  storage_key: string
  original_name: string
  mime_type: string
  size_bytes: number
  file_path: string
  created_at: string
  url: string
}

// Helper to get icon for resource type
export function getResourceTypeIcon(type: ResourceType): string {
  const icons: Record<ResourceType, string> = {
    weblink: 'Globe',
    notemark: 'FileText',
    file: 'File',
    pdf: 'FileText',
    spreadsheet: 'Table',
    audio: 'Music',
    youtube: 'Youtube',
    ssh: 'Terminal',
  }
  return icons[type] || 'File'
}

// Helper to get display label for resource type
export function getResourceTypeLabel(type: ResourceType): string {
  const labels: Record<ResourceType, string> = {
    weblink: 'Web Link',
    notemark: 'Note',
    file: 'File',
    pdf: 'PDF',
    spreadsheet: 'Spreadsheet',
    audio: 'Audio',
    youtube: 'YouTube',
    ssh: 'SSH/Terminal',
  }
  return labels[type] || type
}

// Helper to extract YouTube video ID from URL
export function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
