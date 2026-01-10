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
import { useTextSelection } from '@/hooks/useTextSelection'

interface TextSelectionContextMenuProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wraps content with a context menu that provides text selection actions.
 * Actions are only enabled when text is selected.
 *
 * Note: This only works for text in the main document, not inside cross-origin iframes.
 */
export function TextSelectionContextMenu({
  children,
  className,
}: TextSelectionContextMenuProps) {
  const { selectedText, hasSelection, clearSelection } = useTextSelection()
  const { openTab } = useContentStore()

  const handleCopy = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText)
    }
  }

  const handleSearchInSearXNG = () => {
    if (selectedText) {
      openTab({
        appType: 'searxng',
        title: `Search: ${selectedText.slice(0, 30)}${selectedText.length > 30 ? '...' : ''}`,
        props: { query: selectedText },
      })
      clearSelection()
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleCopy} disabled={!hasSelection}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleSearchInSearXNG} disabled={!hasSelection}>
          <Search className="mr-2 h-4 w-4" />
          Search in SearXNG
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default TextSelectionContextMenu
