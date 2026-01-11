import { useState, useCallback } from 'react'
import { Copy, Search } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useContentStore } from '@/stores/contentStore'

interface TextSelectionContextMenuProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wraps content with a context menu that provides text selection actions.
 * Captures selected text when menu opens to preserve it during interaction.
 *
 * Note: This only works for text in the main document, not inside cross-origin iframes.
 */
export function TextSelectionContextMenu({
  children,
  className,
}: TextSelectionContextMenuProps) {
  const [capturedText, setCapturedText] = useState('')
  const { openTab } = useContentStore()

  // Capture the selected text when the context menu opens
  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      const selection = window.getSelection()
      const text = selection?.toString().trim() || ''
      setCapturedText(text)
    }
  }, [])

  const handleCopy = useCallback(() => {
    if (capturedText) {
      navigator.clipboard.writeText(capturedText)
    }
  }, [capturedText])

  const handleSearchInSearXNG = useCallback(() => {
    if (capturedText) {
      openTab({
        appType: 'searxng',
        title: `Search: ${capturedText.slice(0, 30)}${capturedText.length > 30 ? '...' : ''}`,
        props: { query: capturedText },
      })
      // Clear the text selection
      window.getSelection()?.removeAllRanges()
    }
  }, [capturedText, openTab])

  const hasSelection = capturedText.length > 0

  return (
    <ContextMenu onOpenChange={handleOpenChange}>
      <ContextMenuTrigger asChild className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={handleCopy} disabled={!hasSelection}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleSearchInSearXNG} disabled={!hasSelection}>
          <Search className="mr-2 h-4 w-4" />
          Search in SearXNG
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default TextSelectionContextMenu
