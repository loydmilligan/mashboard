import { useEffect, useState } from 'react'
import {
  Lightbulb,
  BookOpen,
  Zap,
  Plus,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileText,
  Clock,
  Send,
  PanelRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useNoteMarkStore, getQuickNoteTimestamp } from '@/stores/notemarkStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { notemarkService } from '@/services/notemark'
import { cn } from '@/lib/utils'

// Icon mapping for configured notes
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb,
  BookOpen,
  Zap,
  FileText,
}

export function NotesWidget() {
  const {
    recentNotes,
    configuredNoteContents,
    activeConfiguredNoteId,
    quickAddOpen,
    isLoading,
    error,
    fetchRecentNotes,
    fetchAllConfiguredNotes,
    appendToNote,
    createNote,
    setActiveConfiguredNote,
    setQuickAddOpen,
    clearError,
    refresh,
  } = useNoteMarkStore()

  const { notemark } = useSettingsStore()
  const { setNotesSidebarOpen } = useUIStore()
  const [quickInput, setQuickInput] = useState('')
  const [newNoteName, setNewNoteName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isConfigured = notemarkService.isConfigured()

  // Open a note in the sidebar
  const openInSidebar = (noteId: string) => {
    // Use the global openNote function from NotesSidebar
    if (window.openNote) {
      window.openNote(noteId)
    } else {
      // Fallback: just open the sidebar
      setNotesSidebarOpen(true)
    }
  }

  // Fetch data on mount
  useEffect(() => {
    if (isConfigured) {
      fetchRecentNotes()
      fetchAllConfiguredNotes()
    }
  }, [isConfigured, fetchRecentNotes, fetchAllConfiguredNotes])

  // Handle quick append to configured note
  const handleQuickAppend = async (noteId: string) => {
    if (!quickInput.trim()) return

    setIsSubmitting(true)
    try {
      const timestamp = getQuickNoteTimestamp()
      const content = `### ${timestamp}\n${quickInput.trim()}`
      await appendToNote(noteId, content)
      setQuickInput('')
    } catch {
      // Error handled in store
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle new note creation
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteName.trim() || !notemark.defaultBookId) return

    setIsSubmitting(true)
    try {
      await createNote(notemark.defaultBookId, newNoteName.trim())
      setNewNoteName('')
      setQuickAddOpen(false)
    } catch {
      // Error handled in store
    } finally {
      setIsSubmitting(false)
    }
  }

  // Not configured state
  if (!isConfigured) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-medium">Notes</h3>
        <p className="text-sm text-muted-foreground">
          Configure NoteMark in Settings to see your notes.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b pl-8 pr-4 py-3">
        <h3 className="font-medium">Notes</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => refresh()}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
          {notemark.iframeUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => window.open(notemark.iframeUrl, '_blank')}
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
        <form onSubmit={handleCreateNote} className="border-b px-4 py-2">
          <div className="flex gap-2">
            <Input
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              placeholder="New note name..."
              className="h-8 text-sm"
              autoFocus
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newNoteName.trim() || isSubmitting || !notemark.defaultBookId}
            >
              Create
            </Button>
          </div>
          {!notemark.defaultBookId && (
            <p className="mt-1 text-xs text-muted-foreground">
              Set a default book in Settings first.
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

      {/* Configured Notes */}
      <div className="border-b">
        {notemark.configuredNotes.map((configNote) => {
          const Icon = iconMap[configNote.icon] || FileText
          const isActive = activeConfiguredNoteId === configNote.id
          const noteContent = configuredNoteContents[configNote.id]
          const hasNoteId = Boolean(configNote.noteId)

          return (
            <div key={configNote.id} className="border-b last:border-b-0">
              {/* Configured Note Header */}
              <div
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2 transition-colors',
                  hasNoteId && 'hover:bg-muted/50',
                  isActive && 'bg-muted/30',
                  !hasNoteId && 'opacity-50'
                )}
              >
                <button
                  onClick={() => hasNoteId && setActiveConfiguredNote(isActive ? null : configNote.id)}
                  disabled={!hasNoteId}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Icon className={cn('h-5 w-5', configNote.color)} />
                  <span className="flex-1 font-medium text-sm">{configNote.name}</span>
                </button>
                {hasNoteId ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        openInSidebar(configNote.noteId)
                      }}
                      title="Open in sidebar"
                    >
                      <PanelRight className="h-3.5 w-3.5" />
                    </Button>
                    {isActive ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Not configured</span>
                )}
              </div>

              {/* Expanded Content */}
              {isActive && hasNoteId && (
                <div className="border-t bg-muted/20 px-4 py-3">
                  {noteContent?.isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : noteContent?.error ? (
                    <p className="text-sm text-destructive">{noteContent.error}</p>
                  ) : noteContent?.note ? (
                    <div className="space-y-3">
                      {/* Preview (last few lines) */}
                      <div className="max-h-32 overflow-y-auto rounded bg-background/50 p-2 text-sm">
                        <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
                          {noteContent.note.content.slice(-500) || '(empty)'}
                        </pre>
                      </div>

                      {/* Quick input */}
                      <div className="flex gap-2">
                        <Textarea
                          value={quickInput}
                          onChange={(e) => setQuickInput(e.target.value)}
                          placeholder={`Add to ${configNote.name}...`}
                          className="min-h-[60px] text-sm resize-none"
                          disabled={isSubmitting}
                        />
                        <Button
                          size="icon"
                          className="h-[60px] w-10"
                          onClick={() => handleQuickAppend(configNote.noteId)}
                          disabled={!quickInput.trim() || isSubmitting}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Recent Notes */}
      <div className="max-h-[200px] overflow-y-auto">
        <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Recent Notes
        </div>
        {recentNotes.length === 0 ? (
          <div className="px-4 py-4 text-center text-sm text-muted-foreground">
            No recent notes
          </div>
        ) : (
          <ul className="divide-y">
            {recentNotes.slice(0, 5).map((note) => (
              <li
                key={note.id}
                className="group flex items-start gap-3 px-4 py-2 hover:bg-muted/50"
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{note.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{note.book_name}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => openInSidebar(note.id)}
                  title="Open in sidebar"
                >
                  <PanelRight className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {recentNotes.length > 5 && (
        <div className="border-t px-4 py-2 text-center text-xs text-muted-foreground">
          +{recentNotes.length - 5} more notes
        </div>
      )}
    </div>
  )
}

export default NotesWidget
