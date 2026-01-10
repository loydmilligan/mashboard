import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'
import type { PinnedNote } from '@/types/pinnedNotes'
import { DEFAULT_PINNED_NOTES } from '@/types/pinnedNotes'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface PinnedNotesState {
  pinnedNotes: PinnedNote[]

  // Actions
  addPinnedNote: (note: Omit<PinnedNote, 'id'>) => void
  updatePinnedNote: (id: string, updates: Partial<Omit<PinnedNote, 'id'>>) => void
  deletePinnedNote: (id: string) => void
  reorderPinnedNotes: (noteIds: string[]) => void
  resetToDefaults: () => void
}

export const usePinnedNotesStore = create<PinnedNotesState>()(
  persist(
    (set) => ({
      pinnedNotes: DEFAULT_PINNED_NOTES,

      addPinnedNote: (note) => {
        const newNote: PinnedNote = {
          ...note,
          id: generateId(),
        }
        set((state) => ({
          pinnedNotes: [...state.pinnedNotes, newNote],
        }))
      },

      updatePinnedNote: (id, updates) => {
        set((state) => ({
          pinnedNotes: state.pinnedNotes.map((note) =>
            note.id === id ? { ...note, ...updates } : note
          ),
        }))
      },

      deletePinnedNote: (id) => {
        set((state) => ({
          pinnedNotes: state.pinnedNotes.filter((note) => note.id !== id),
        }))
      },

      reorderPinnedNotes: (noteIds) => {
        set((state) => {
          const noteMap = new Map(state.pinnedNotes.map((n) => [n.id, n]))
          const reordered = noteIds
            .map((id) => noteMap.get(id))
            .filter((n): n is PinnedNote => n !== undefined)
          return { pinnedNotes: reordered }
        })
      },

      resetToDefaults: () => {
        set({ pinnedNotes: DEFAULT_PINNED_NOTES })
      },
    }),
    {
      name: STORAGE_KEYS.PINNED_NOTES,
    }
  )
)
