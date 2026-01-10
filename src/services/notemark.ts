import { useSettingsStore } from '@/stores/settingsStore'

// NoteMark API types (camelCase as per OpenAPI spec)
export interface NoteMarkBook {
  id: string
  ownerId: string
  name: string
  slug: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  notes?: NoteMarkNote[] | null
}

export interface NoteMarkNote {
  id: string
  bookId: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  deletedAt?: { Time: string; Valid: boolean } | null
}

export interface NoteMarkNoteWithContent extends NoteMarkNote {
  content: string
}

export interface NoteMarkUser {
  id: string
  username: string
  name: string | null
  createdAt: string
  updatedAt: string
  books?: NoteMarkBook[] | null
}

// Recent note as returned by /api/notes/recent (ValueWithSlug format)
export interface NoteMarkRecentNote {
  id: string
  slug: string
  name: string
  bookId: string
  book_slug: string // for display
  book_name: string // for display
  username: string
  updated_at: string
}

export interface CreateBookInput {
  name: string
  slug: string
  isPublic?: boolean
}

export interface UpdateBookInput {
  name: string
  slug: string
  isPublic: boolean
}

export interface CreateNoteInput {
  name: string
  slug: string
}

export interface UpdateNoteInput {
  name: string
  slug: string
}

// Service singleton
class NoteMarkService {
  private get baseUrl(): string {
    return useSettingsStore.getState().notemark.baseUrl
  }

  private get token(): string {
    return useSettingsStore.getState().notemark.token
  }

  private get username(): string {
    return useSettingsStore.getState().notemark.username
  }

  private get headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    }
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.token)
  }

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================

  async login(username: string, password: string): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    const response = await fetch(`${this.baseUrl}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'password',
        username,
        password,
      }),
    })

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`)
    }

    return response.json()
  }

  // ==========================================================================
  // BOOKS (NOTEBOOKS)
  // ==========================================================================

  async getBooks(): Promise<NoteMarkBook[]> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    // Get books via the slug endpoint (includes books with ?include=books)
    const username = this.username
    if (!username) {
      throw new Error('NoteMark username not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/slug/${username}?include=books`, {
      headers: this.headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid NoteMark token')
      }
      throw new Error(`Failed to fetch books: ${response.statusText}`)
    }

    const user: NoteMarkUser = await response.json()
    return user.books || []
  }

  async getBook(bookId: string): Promise<NoteMarkBook> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/books/${bookId}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch book: ${response.statusText}`)
    }

    return response.json()
  }

  async createBook(data: CreateBookInput): Promise<NoteMarkBook> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/books`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create book: ${response.statusText}`)
    }

    return response.json()
  }

  async updateBook(bookId: string, data: UpdateBookInput): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/books/${bookId}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update book: ${response.statusText}`)
    }
  }

  async deleteBook(bookId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/books/${bookId}`, {
      method: 'DELETE',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to delete book: ${response.statusText}`)
    }
  }

  // ==========================================================================
  // NOTES
  // ==========================================================================

  async getBookNotes(bookId: string, includeDeleted = false): Promise<NoteMarkNote[]> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const params = new URLSearchParams()
    if (includeDeleted) params.set('deleted', 'true')

    const url = `${this.baseUrl}/api/books/${bookId}/notes${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.statusText}`)
    }

    return response.json() || []
  }

  async getRecentNotes(): Promise<NoteMarkRecentNote[]> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/notes/recent`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch recent notes: ${response.statusText}`)
    }

    // API returns ValueWithSlug[] - transform to our format
    const data: Array<{ slug: string; value: NoteMarkNote & { bookSlug?: string; bookName?: string } }> = await response.json() || []

    return data.map((item) => ({
      id: item.value.id,
      slug: item.slug,
      name: item.value.name,
      bookId: item.value.bookId,
      book_slug: item.value.bookSlug || '',
      book_name: item.value.bookName || '',
      username: this.username,
      updated_at: item.value.updatedAt,
    }))
  }

  async getNote(noteId: string): Promise<NoteMarkNote> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/notes/${noteId}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch note: ${response.statusText}`)
    }

    return response.json()
  }

  async getNoteContent(noteId: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/notes/${noteId}/content`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'text/plain',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return '' // No content yet
      }
      throw new Error(`Failed to fetch note content: ${response.statusText}`)
    }

    return response.text()
  }

  async getNoteWithContent(noteId: string): Promise<NoteMarkNoteWithContent> {
    const [note, content] = await Promise.all([
      this.getNote(noteId),
      this.getNoteContent(noteId),
    ])

    return { ...note, content }
  }

  async createNote(bookId: string, data: CreateNoteInput): Promise<NoteMarkNote> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/books/${bookId}/notes`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create note: ${response.statusText}`)
    }

    return response.json()
  }

  async updateNote(noteId: string, data: UpdateNoteInput): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/notes/${noteId}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update note: ${response.statusText}`)
    }
  }

  async updateNoteContent(noteId: string, content: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/notes/${noteId}/content`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/octet-stream',
      },
      body: content,
    })

    if (!response.ok) {
      throw new Error(`Failed to update note content: ${response.statusText}`)
    }
  }

  async deleteNote(noteId: string, permanent = false): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const params = new URLSearchParams()
    if (permanent) params.set('permanent', 'true')

    const url = `${this.baseUrl}/api/notes/${noteId}${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to delete note: ${response.statusText}`)
    }
  }

  async restoreNote(noteId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('NoteMark not configured')
    }

    const response = await fetch(`${this.baseUrl}/api/notes/${noteId}/restore`, {
      method: 'PUT',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to restore note: ${response.statusText}`)
    }
  }
}

// Export singleton instance
export const notemarkService = new NoteMarkService()
