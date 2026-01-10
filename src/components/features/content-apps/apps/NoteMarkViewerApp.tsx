import { useState, useEffect } from 'react'
import { ExternalLink, FileText, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { notemarkService, type NoteMarkNote } from '@/services/notemark'
import { useSettingsStore } from '@/stores/settingsStore'

interface NoteMarkViewerAppProps {
  noteId: string
  notePath?: string
}

export function NoteMarkViewerApp({ noteId, notePath }: NoteMarkViewerAppProps) {
  const [note, setNote] = useState<NoteMarkNote | null>(null)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const iframeUrl = useSettingsStore((s) => s.notemark.iframeUrl)
  const isConfigured = notemarkService.isConfigured()

  const fetchNote = async () => {
    if (!isConfigured) {
      setError('NoteMark not configured')
      setLoading(false)
      return
    }

    if (!noteId) {
      setError('No note ID provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const noteData = await notemarkService.getNoteWithContent(noteId)
      setNote(noteData)
      setContent(noteData.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load note')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNote()
  }, [noteId, isConfigured])

  const handleOpenInNoteMark = () => {
    if (iframeUrl && notePath) {
      window.open(`${iframeUrl}${notePath}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading note...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground flex-1">Note</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-destructive p-4">
          {error}
        </div>
      </div>
    )
  }

  // Render markdown content (simple version - just shows as preformatted text)
  // For full markdown rendering, would need a markdown library
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground truncate flex-1">
          {note?.name || 'Note'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchNote}
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        {iframeUrl && notePath && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenInNoteMark}
            title="Open in NoteMark"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {content ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {content}
            </pre>
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-8">
            This note is empty
          </div>
        )}
      </div>
    </div>
  )
}
