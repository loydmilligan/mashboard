import { useState, useEffect, useCallback } from 'react'
import { Code2, Loader2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'
import { bytestashService } from '@/services/bytestash'
import { SnippetList } from './SnippetList'
import { SnippetView } from './SnippetView'
import type { Snippet } from '@/types/snippet'

export function SnippetsPopover() {
  const { snippetsPopoverOpen, setSnippetsPopoverOpen } = useUIStore()
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null)
  const [loading, setLoading] = useState(false)

  // Reset view when popover closes
  useEffect(() => {
    if (!snippetsPopoverOpen) {
      setSelectedSnippet(null)
    }
  }, [snippetsPopoverOpen])

  const handleSelectSnippet = useCallback(async (snippetId: string) => {
    setLoading(true)
    try {
      const snippet = await bytestashService.getSnippet(snippetId)
      setSelectedSnippet(snippet)
    } catch (err) {
      console.error('Failed to load snippet:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleBack = () => {
    setSelectedSnippet(null)
  }

  return (
    <Popover open={snippetsPopoverOpen} onOpenChange={setSnippetsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Code2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0"
        align="end"
        sideOffset={8}
      >
        <div className="flex h-[500px] flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-semibold">Snippets</h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : selectedSnippet ? (
              <SnippetView snippet={selectedSnippet} onBack={handleBack} />
            ) : (
              <SnippetList onSelect={handleSelectSnippet} />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
