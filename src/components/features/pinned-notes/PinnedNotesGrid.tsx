import { Plus, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePinnedNotesStore } from '@/stores/pinnedNotesStore'
import { PinnedNoteCard } from './PinnedNoteCard'

export function PinnedNotesGrid() {
  const { pinnedNotes } = usePinnedNotesStore()

  const handleNoteClick = (notepadId: string) => {
    // Use global openNote function exposed by NotesSidebar
    if (window.openNote) {
      window.openNote(notepadId)
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">Pinned Notes</h2>
      </div>

      {pinnedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <StickyNote className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            No pinned notes yet. Add some in Settings.
          </p>
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {pinnedNotes.map((note) => (
            <PinnedNoteCard
              key={note.id}
              note={note}
              onClick={() => handleNoteClick(note.notepadId)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
