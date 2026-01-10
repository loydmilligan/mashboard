import { useState, useRef } from 'react'
import { Search, Command, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useContentStore } from '@/stores/contentStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import { SHORTCUTS, getShortcutDisplay } from '@/lib/keyboardShortcuts'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { openTab, setActiveTab, openTabs } = useContentStore()
  const searxngBaseUrl = useSettingsStore((s) => s.searxng.baseUrl)
  const { setCommandPaletteOpen } = useUIStore()

  const isConfigured = !!searxngBaseUrl

  const handleSearch = () => {
    if (!query.trim() || !isConfigured) return

    // Check if there's already a search tab open, update it instead of creating new
    const existingSearchTab = openTabs.find((t) => t.appType === 'searxng')
    if (existingSearchTab) {
      // Update existing search tab with new query
      useContentStore.getState().updateTabProps(existingSearchTab.id, { query: query.trim() })
      setActiveTab(existingSearchTab.id)
    } else {
      // Open new search tab
      const tabId = openTab({
        appType: 'searxng',
        title: `Search: ${query.trim()}`,
        props: { query: query.trim() },
      })
      setActiveTab(tabId)
    }

    setQuery('')
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    } else if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  // Global shortcuts are now handled by GlobalKeyboardShortcuts component
  // Mod+E opens SearXNG in the content area

  return (
    <div className="relative flex w-full max-w-md items-center gap-2">
      <div
        className={cn(
          'flex h-9 flex-1 items-center gap-2 rounded-md border bg-secondary px-3 transition-all',
          isFocused ? 'border-primary ring-1 ring-primary' : 'border-input',
          !isConfigured && 'opacity-50'
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={isConfigured ? 'Search with SearXNG...' : 'SearXNG not configured'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={!isConfigured}
          className="h-7 flex-1 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={() => setQuery('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          {getShortcutDisplay(SHORTCUTS.SEARCH)}
        </kbd>
      </div>

      {/* Command palette button */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={() => setCommandPaletteOpen(true)}
      >
        <Command className="h-4 w-4" />
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          {getShortcutDisplay(SHORTCUTS.COMMAND_PALETTE)}
        </kbd>
      </Button>
    </div>
  )
}
