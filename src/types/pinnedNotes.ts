export interface PinnedNote {
  id: string
  name: string
  emoji: string
  notepadId: string
}

export const DEFAULT_PINNED_NOTES: PinnedNote[] = [
  { id: '1', name: 'Ideas', emoji: '💡', notepadId: 'ideas' },
  { id: '2', name: 'Projects', emoji: '📁', notepadId: 'projects' },
  { id: '3', name: 'Shopping List', emoji: '🛒', notepadId: 'shopping-list' },
  { id: '4', name: 'Gift Ideas', emoji: '🎁', notepadId: 'gift-ideas' },
  { id: '5', name: 'Research Topics', emoji: '🔬', notepadId: 'research-topics' },
]
