import { useState, useEffect, useCallback } from 'react'
import { Search, Code2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { bytestashService } from '@/services/bytestash'
import type { SnippetSearchResult } from '@/types/snippet'

interface SnippetListProps {
  onSelect: (snippetId: string) => void
}

export function SnippetList({ onSelect }: SnippetListProps) {
  const [query, setQuery] = useState('')
  const [snippets, setSnippets] = useState<SnippetSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchSnippets = useCallback(async (searchQuery: string) => {
    if (!bytestashService.isConfigured()) {
      setError('ByteStash not configured')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await bytestashService.searchSnippets(searchQuery)
      setSnippets(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search snippets')
      setSnippets([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchSnippets(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchSnippets])

  // Initial load
  useEffect(() => {
    searchSnippets('')
  }, [searchSnippets])

  if (!bytestashService.isConfigured()) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Code2 className="mb-4 h-8 w-8 text-muted-foreground" />
        <p className="mb-1 text-sm font-medium text-muted-foreground">
          ByteStash not configured
        </p>
        <p className="text-xs text-muted-foreground">
          Add your ByteStash URL and API key in Settings
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search snippets..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-destructive">{error}</div>
        ) : snippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Code2 className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {query ? 'No snippets found' : 'No snippets yet'}
            </p>
          </div>
        ) : (
          <ul>
            {snippets.map((snippet) => (
              <li key={snippet.id}>
                <button
                  className="w-full border-b border-border p-3 text-left transition-colors hover:bg-muted/50"
                  onClick={() => onSelect(snippet.id)}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-medium">{snippet.title}</span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                      {snippet.language}
                    </span>
                  </div>
                  {snippet.description && (
                    <p className="mb-1 truncate text-sm text-muted-foreground">
                      {snippet.description}
                    </p>
                  )}
                  {snippet.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {snippet.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {cat}
                        </span>
                      ))}
                      {snippet.categories.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{snippet.categories.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
