import { useContentStore } from '@/stores/contentStore'
import type { AppType, AppProps } from '@/stores/contentStore'
import type {
  TaskResource,
  WeblinkConfig,
  NotemarkConfig,
  FileConfig,
  PdfConfig,
  SpreadsheetConfig,
  AudioConfig,
  YoutubeConfig,
  SshConfig,
} from '@/types/taskResource'
import { taskResourcesService } from '@/services/taskResources'

/**
 * Maps a task resource to an AppType and props for opening as a content tab
 */
export function resourceToTabConfig(resource: TaskResource): {
  appType: AppType
  title: string
  props: AppProps
} | null {
  const config = resource.config

  switch (resource.resource_type) {
    case 'weblink': {
      const c = config as WeblinkConfig
      return {
        appType: 'webview',
        title: resource.title,
        props: { url: c.url },
      }
    }

    case 'notemark': {
      const c = config as NotemarkConfig
      return {
        appType: 'notemark-viewer',
        title: resource.title,
        props: { noteId: c.noteId, notePath: c.notePath },
      }
    }

    case 'file': {
      const c = config as FileConfig
      const url = taskResourcesService.getFileUrl(c.storageKey)

      // Determine viewer based on MIME type
      if (c.mimeType.startsWith('image/')) {
        return {
          appType: 'image-viewer',
          title: resource.title,
          props: { url, originalName: c.originalName },
        }
      }

      // Default to code viewer for text files
      return {
        appType: 'code-viewer',
        title: resource.title,
        props: { url, originalName: c.originalName },
      }
    }

    case 'pdf': {
      const c = config as PdfConfig
      const url = taskResourcesService.getFileUrl(c.storageKey)
      return {
        appType: 'pdf-viewer',
        title: resource.title,
        props: { url, originalName: c.originalName },
      }
    }

    case 'spreadsheet': {
      const c = config as SpreadsheetConfig
      const url = taskResourcesService.getFileUrl(c.storageKey)
      return {
        appType: 'spreadsheet-viewer',
        title: resource.title,
        props: { url, originalName: c.originalName, sheetName: c.sheetName },
      }
    }

    case 'audio': {
      const c = config as AudioConfig
      const url = c.url || (c.storageKey ? taskResourcesService.getFileUrl(c.storageKey) : '')
      return {
        appType: 'audio-player',
        title: resource.title,
        props: { url, originalName: c.originalName },
      }
    }

    case 'youtube': {
      const c = config as YoutubeConfig
      return {
        appType: 'youtube',
        title: resource.title,
        props: { videoId: c.videoId, startTime: c.startTime },
      }
    }

    case 'ssh': {
      const c = config as SshConfig
      return {
        appType: 'termix',
        title: resource.title,
        props: {
          connectionId: c.connectionId,
          host: c.host,
          port: c.port,
          username: c.username,
        },
      }
    }

    default:
      return null
  }
}

/**
 * Opens a single task resource as a content tab
 */
export function openResourceAsTab(
  resource: TaskResource,
  vikunjaTaskId?: string
): string | null {
  const tabConfig = resourceToTabConfig(resource)
  if (!tabConfig) return null

  const { openTab, findTabByResourceId } = useContentStore.getState()

  // Check if this resource is already open
  const existingTab = findTabByResourceId(resource.id)
  if (existingTab) {
    useContentStore.getState().setActiveTab(existingTab.id)
    return existingTab.id
  }

  // Open new tab
  return openTab({
    ...tabConfig,
    taskResourceId: resource.id,
    vikunjaTaskId,
  })
}

/**
 * Opens all resources for a task as tabs
 */
export async function openAllResourcesForTask(taskId: string): Promise<string[]> {
  try {
    const resources = await taskResourcesService.getResourcesForTask(taskId)
    const tabIds: string[] = []

    for (const resource of resources) {
      const tabId = openResourceAsTab(resource, taskId)
      if (tabId) {
        tabIds.push(tabId)
      }
    }

    return tabIds
  } catch (error) {
    console.error('Failed to open resources for task:', error)
    return []
  }
}
