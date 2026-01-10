import type { PinnedNote } from '@/types/pinnedNotes'

interface PinnedNoteCardProps {
  note: PinnedNote
  onClick: () => void
}

export function PinnedNoteCard({ note, onClick }: PinnedNoteCardProps) {
  return (
    <button
      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted-foreground hover:bg-muted/50"
      onClick={onClick}
    >
      <span className="text-2xl">{note.emoji}</span>
      <span className="text-sm font-medium">{note.name}</span>
    </button>
  )
}
