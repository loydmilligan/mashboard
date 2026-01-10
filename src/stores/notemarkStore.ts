import { create } from 'zustand'
import { notemarkService } from '@/services/notemark'
import type {
  NoteMarkBook,
  NoteMarkNote,
  NoteMarkNoteWithContent,
  NoteMarkRecentNote,
} from '@/services/notemark'

interface ConfiguredNoteContent {
  id: string // matches configuredNote.id
  note: NoteMarkNoteWithContent | null
  isLoading: boolean
  error: string | null
}

interface NoteMarkState {
  // Data
  books: NoteMarkBook[]
  recentNotes: NoteMarkRecentNote[]
  configuredNoteContents: Record<string, ConfiguredNoteContent>
  selectedNote: NoteMarkNoteWithContent | null

  // UI State
  isLoading: boolean
  error: string | null
  activeConfiguredNoteId: string | null // Which configured note is expanded
  quickAddOpen: boolean

  // Actions
  fetchBooks: () => Promise<void>
  fetchRecentNotes: () => Promise<void>
  fetchConfiguredNote: (configId: string, noteId: string) => Promise<void>
  fetchAllConfiguredNotes: () => Promise<void>
  selectNote: (noteId: string) => Promise<void>
  clearSelectedNote: () => void
  createNote: (bookId: string, name: string, content?: string) => Promise<NoteMarkNote>
  updateNoteContent: (noteId: string, content: string) => Promise<void>
  appendToNote: (noteId: string, content: string) => Promise<void>
  setActiveConfiguredNote: (id: string | null) => void
  setQuickAddOpen: (open: boolean) => void
  clearError: () => void
  refresh: () => Promise<void>
}

export const useNoteMarkStore = create<NoteMarkState>((set, get) => ({
  // Initial state
  books: [],
  recentNotes: [],
  configuredNoteContents: {},
  selectedNote: null,
  isLoading: false,
  error: null,
  activeConfiguredNoteId: null,
  quickAddOpen: false,

  fetchBooks: async () => {
    set({ isLoading: true, error: null })
    try {
      const books = await notemarkService.getBooks()
      set({ books, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch books',
        isLoading: false,
      })
    }
  },

  fetchRecentNotes: async () => {
    try {
      const recentNotes = await notemarkService.getRecentNotes()
      set({ recentNotes })
    } catch (error) {
      console.error('Failed to fetch recent notes:', error)
    }
  },

  fetchConfiguredNote: async (configId: string, noteId: string) => {
    if (!noteId) return

    // Set loading state for this specific configured note
    set((state) => ({
      configuredNoteContents: {
        ...state.configuredNoteContents,
        [configId]: {
          id: configId,
          note: state.configuredNoteContents[configId]?.note || null,
          isLoading: true,
          error: null,
        },
      },
    }))

    try {
      const note = await notemarkService.getNoteWithContent(noteId)
      set((state) => ({
        configuredNoteContents: {
          ...state.configuredNoteContents,
          [configId]: {
            id: configId,
            note,
            isLoading: false,
            error: null,
          },
        },
      }))
    } catch (error) {
      set((state) => ({
        configuredNoteContents: {
          ...state.configuredNoteContents,
          [configId]: {
            id: configId,
            note: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch note',
          },
        },
      }))
    }
  },

  fetchAllConfiguredNotes: async () => {
    // This will be called by the widget to load all configured notes
    // Note: useSettingsStore is imported at runtime to get current state
    // This is safe because both stores are already loaded by the time this is called
    const { useSettingsStore } = await import('@/stores/settingsStore')
    const configuredNotes = useSettingsStore.getState().notemark.configuredNotes

    // Fetch all configured notes in parallel
    const fetchPromises = configuredNotes
      .filter((cn) => cn.noteId) // Only fetch if noteId is configured
      .map((cn) => get().fetchConfiguredNote(cn.id, cn.noteId))

    await Promise.all(fetchPromises)
  },

  selectNote: async (noteId: string) => {
    set({ isLoading: true, error: null })
    try {
      const note = await notemarkService.getNoteWithContent(noteId)
      set({ selectedNote: note, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch note',
        isLoading: false,
      })
    }
  },

  clearSelectedNote: () => {
    set({ selectedNote: null })
  },

  createNote: async (bookId: string, name: string, content?: string) => {
    set({ isLoading: true, error: null })
    try {
      // Generate slug from name (lowercase, replace spaces with hyphens, remove special chars)
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const note = await notemarkService.createNote(bookId, { name, slug })

      // If content provided, update it
      if (content) {
        await notemarkService.updateNoteContent(note.id, content)
      }

      // Refresh recent notes
      get().fetchRecentNotes()

      set({ isLoading: false })
      return note
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create note',
        isLoading: false,
      })
      throw error
    }
  },

  updateNoteContent: async (noteId: string, content: string) => {
    try {
      await notemarkService.updateNoteContent(noteId, content)

      // Update selected note if it's the same
      const { selectedNote } = get()
      if (selectedNote?.id === noteId) {
        set({ selectedNote: { ...selectedNote, content } })
      }

      // Update configured note content if applicable
      const { configuredNoteContents } = get()
      const updatedContents = { ...configuredNoteContents }
      for (const [configId, configContent] of Object.entries(updatedContents)) {
        if (configContent.note?.id === noteId) {
          updatedContents[configId] = {
            ...configContent,
            note: { ...configContent.note, content },
          }
        }
      }
      set({ configuredNoteContents: updatedContents })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update note',
      })
      throw error
    }
  },

  appendToNote: async (noteId: string, content: string) => {
    try {
      // Get current content
      const currentContent = await notemarkService.getNoteContent(noteId)
      const newContent = currentContent ? `${currentContent}\n\n${content}` : content

      await notemarkService.updateNoteContent(noteId, newContent)

      // Update local state
      const { configuredNoteContents, selectedNote } = get()

      if (selectedNote?.id === noteId) {
        set({ selectedNote: { ...selectedNote, content: newContent } })
      }

      // Update configured note content if applicable
      const updatedContents = { ...configuredNoteContents }
      for (const [configId, configContent] of Object.entries(updatedContents)) {
        if (configContent.note?.id === noteId) {
          updatedContents[configId] = {
            ...configContent,
            note: { ...configContent.note, content: newContent },
          }
        }
      }
      set({ configuredNoteContents: updatedContents })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to append to note',
      })
      throw error
    }
  },

  setActiveConfiguredNote: (id: string | null) => {
    set({ activeConfiguredNoteId: id })
  },

  setQuickAddOpen: (open: boolean) => {
    set({ quickAddOpen: open })
  },

  clearError: () => {
    set({ error: null })
  },

  refresh: async () => {
    const { fetchBooks, fetchRecentNotes, fetchAllConfiguredNotes } = get()
    await Promise.all([fetchBooks(), fetchRecentNotes(), fetchAllConfiguredNotes()])
  },
}))

// Helper to get a formatted timestamp for quick notes
export function getQuickNoteTimestamp(): string {
  return new Date().toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
