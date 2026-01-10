import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Lightbulb,
  BookOpen,
  Zap,
  FileText,
  Plus,
  Save,
  Eye,
  Edit3,
  Clock,
  RefreshCw,
  X,
  Columns,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUIStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useNoteMarkStore } from '@/stores/notemarkStore'
import { notemarkService } from '@/services/notemark'
import { cn } from '@/lib/utils'

// Icon mapping for configured notes
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb,
  BookOpen,
  Zap,
  FileText,
}

// Global function to open a note from anywhere
declare global {
  interface Window {
    openNote?: (noteId: string) => void
  }
}

type ViewMode = 'edit' | 'preview' | 'split'

// Markdown preview component with syntax highlighting
interface MarkdownPreviewProps {
  content: string
  className?: string
}

function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div className={cn('prose prose-sm prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && !className
            return isInline ? (
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm" {...props}>
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                style={oneDark}
                language={match?.[1] || 'text'}
                PreTag="div"
                className="rounded-md text-sm !my-2"
                customStyle={{ margin: 0, fontSize: '0.875rem' }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
          // Better table styling
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border-collapse border border-border">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                {children}
              </th>
            )
          },
          td({ children }) {
            return <td className="border border-border px-3 py-2">{children}</td>
          },
          // Better blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
                {children}
              </blockquote>
            )
          },
          // Better links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                {children}
              </a>
            )
          },
          // Checkbox support for task lists
          input({ type, checked, ...props }) {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 h-4 w-4 rounded border-border"
                  {...props}
                />
              )
            }
            return <input type={type} {...props} />
          },
        }}
      >
        {content || '*No content*'}
      </ReactMarkdown>
    </div>
  )
}

export function NotesSidebar() {
  const { notesSidebarOpen, toggleNotesSidebar, setNotesSidebarOpen } = useUIStore()
  const { notemark } = useSettingsStore()
  const {
    recentNotes,
    fetchRecentNotes,
    fetchConfiguredNote,
    updateNoteContent,
    createNote,
  } = useNoteMarkStore()

  // Local state
  const [activeTab, setActiveTab] = useState<string | null>(null) // configuredNote.id or 'recent' or noteId
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showNewNote, setShowNewNote] = useState(false)
  const [newNoteName, setNewNoteName] = useState('')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [selectedNoteName, setSelectedNoteName] = useState<string>('')

  const isConfigured = notemarkService.isConfigured()
  const hasChanges = content !== originalContent

  // Get configured notes with their IDs
  const configuredNotes = notemark.configuredNotes.filter((cn) => cn.noteId)

  // Load note content when tab changes (not on every store update)
  useEffect(() => {
    if (!activeTab || !isConfigured) return

    // Check if it's a configured note
    const configNote = configuredNotes.find((cn) => cn.id === activeTab)
    if (configNote) {
      setIsLoading(true)
      setSelectedNoteId(configNote.noteId)
      setSelectedNoteName(configNote.name)

      // Always fetch fresh content when switching tabs
      fetchConfiguredNote(configNote.id, configNote.noteId).then(() => {
        const loaded = useNoteMarkStore.getState().configuredNoteContents[configNote.id]
        if (loaded?.note) {
          setContent(loaded.note.content)
          setOriginalContent(loaded.note.content)
        }
        setIsLoading(false)
      })
    }
    // Only depend on activeTab - we don't want to reload when configuredNoteContents changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isConfigured])

  // Load a specific note by ID (for recent notes)
  const loadNote = useCallback(async (noteId: string, noteName: string) => {
    setIsLoading(true)
    setSelectedNoteId(noteId)
    setSelectedNoteName(noteName)
    setActiveTab(noteId)

    try {
      const noteContent = await notemarkService.getNoteContent(noteId)
      setContent(noteContent)
      setOriginalContent(noteContent)
    } catch (error) {
      console.error('Failed to load note:', error)
      setContent('')
      setOriginalContent('')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Open a specific note (global function)
  const openNote = useCallback(
    (noteId: string) => {
      // Check if this is a configured note
      const configNote = configuredNotes.find((cn) => cn.noteId === noteId)

      if (configNote) {
        // For configured notes, just set the active tab - the useEffect will load it
        setActiveTab(configNote.id)
      } else {
        // For other notes (recent notes), look up the name and load directly
        const recentNote = recentNotes.find((n) => n.id === noteId)
        const noteName = recentNote?.name || 'Note'
        loadNote(noteId, noteName)
      }

      setNotesSidebarOpen(true)
    },
    [loadNote, setNotesSidebarOpen, recentNotes, configuredNotes]
  )

  // Expose openNote globally
  useEffect(() => {
    window.openNote = openNote
    return () => {
      delete window.openNote
    }
  }, [openNote])

  // Fetch recent notes when sidebar opens
  useEffect(() => {
    if (notesSidebarOpen && isConfigured) {
      fetchRecentNotes()
    }
  }, [notesSidebarOpen, isConfigured, fetchRecentNotes])

  // Save content
  const handleSave = async () => {
    if (!selectedNoteId || !hasChanges) return

    setIsSaving(true)
    try {
      await updateNoteContent(selectedNoteId, content)
      setOriginalContent(content)
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Create new note
  const handleCreateNote = async () => {
    if (!newNoteName.trim() || !notemark.defaultBookId) return

    setIsLoading(true)
    try {
      const note = await createNote(notemark.defaultBookId, newNoteName.trim())
      setNewNoteName('')
      setShowNewNote(false)
      loadNote(note.id, note.name)
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Clear state when sidebar closes
  useEffect(() => {
    if (!notesSidebarOpen) {
      const timer = setTimeout(() => {
        // Don't clear if there are unsaved changes
        if (!hasChanges) {
          setActiveTab(null)
          setSelectedNoteId(null)
          setContent('')
          setOriginalContent('')
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [notesSidebarOpen, hasChanges])

  // Not configured state
  if (!isConfigured) {
    return (
      <Sidebar side="right" open={notesSidebarOpen} onClose={toggleNotesSidebar} title="Notes">
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            Configure NoteMark in Settings to use notes.
          </p>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar side="right" open={notesSidebarOpen} onClose={toggleNotesSidebar} title="Notes">
      <div className="flex h-full flex-col">
        {/* Quick Access Tabs */}
        {configuredNotes.length > 0 && (
          <div className="flex gap-1 border-b p-2">
            {configuredNotes.map((configNote) => {
              const Icon = iconMap[configNote.icon] || FileText
              const isActive = activeTab === configNote.id
              return (
                <Button
                  key={configNote.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn('flex-1 gap-1', isActive && 'ring-1 ring-primary')}
                  onClick={() => setActiveTab(configNote.id)}
                >
                  <Icon className={cn('h-4 w-4', configNote.color)} />
                  <span className="hidden sm:inline text-xs">{configNote.name}</span>
                </Button>
              )
            })}
          </div>
        )}

        {/* Editor Header */}
        {selectedNoteId && (
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-sm font-medium">{selectedNoteName}</span>
              {hasChanges && (
                <span className="text-xs text-amber-500">• unsaved</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* View mode buttons */}
              <div className="flex items-center rounded-md border border-border">
                <Button
                  variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-6 w-6 rounded-r-none border-0"
                  onClick={() => setViewMode('edit')}
                  title="Edit only"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-6 w-6 rounded-none border-0"
                  onClick={() => setViewMode('split')}
                  title="Split view"
                >
                  <Columns className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-6 w-6 rounded-l-none border-0"
                  onClick={() => setViewMode('preview')}
                  title="Preview only"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                title="Save (Ctrl+S)"
              >
                <Save className={cn('h-4 w-4', hasChanges && 'text-amber-500')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setSelectedNoteId(null)
                  setActiveTab(null)
                  setContent('')
                  setOriginalContent('')
                }}
                title="Close note"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : selectedNoteId ? (
            viewMode === 'edit' ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing..."
                className="h-full w-full resize-none rounded-none border-0 p-3 font-mono text-sm focus-visible:ring-0"
              />
            ) : viewMode === 'preview' ? (
              <div className="h-full overflow-y-auto p-3">
                <MarkdownPreview content={content} />
              </div>
            ) : (
              /* Split view - editor on top, preview on bottom */
              <div className="flex h-full flex-col">
                <div className="h-1/2 border-b border-border">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing..."
                    className="h-full w-full resize-none rounded-none border-0 p-3 font-mono text-sm focus-visible:ring-0"
                  />
                </div>
                <div className="h-1/2 overflow-y-auto p-3">
                  <MarkdownPreview content={content} />
                </div>
              </div>
            )
          ) : (
            /* No note selected - show recent notes */
            <div className="flex flex-col h-full">
              {/* New Note Button */}
              <div className="p-3 border-b">
                {showNewNote ? (
                  <div className="flex gap-2">
                    <Input
                      value={newNoteName}
                      onChange={(e) => setNewNoteName(e.target.value)}
                      placeholder="Note name..."
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateNote()
                        if (e.key === 'Escape') setShowNewNote(false)
                      }}
                    />
                    <Button size="sm" onClick={handleCreateNote} disabled={!newNoteName.trim()}>
                      Create
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => setShowNewNote(true)}
                  >
                    <Plus className="h-4 w-4" />
                    New Note
                  </Button>
                )}
              </div>

              {/* Recent Notes List */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recent Notes
                </div>
                {recentNotes.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No recent notes
                  </div>
                ) : (
                  <ul className="divide-y">
                    {recentNotes.map((note) => (
                      <li key={note.id}>
                        <button
                          onClick={() => loadNote(note.id, note.name)}
                          className="w-full flex items-start gap-3 px-3 py-2 hover:bg-muted/50 text-left"
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
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Quick Access Hint */}
              {configuredNotes.length > 0 && (
                <div className="border-t p-3 text-center text-xs text-muted-foreground">
                  Use tabs above for quick access notes
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        {selectedNoteId && (viewMode === 'edit' || viewMode === 'split') && (
          <div className="border-t px-3 py-1.5 text-xs text-muted-foreground flex items-center justify-between">
            <span><kbd className="rounded bg-muted px-1">Ctrl+S</kbd> to save</span>
            {viewMode === 'split' && (
              <span className="text-muted-foreground/60">Live preview</span>
            )}
          </div>
        )}
      </div>
    </Sidebar>
  )
}
