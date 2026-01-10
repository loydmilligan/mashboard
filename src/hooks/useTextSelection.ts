import { useState, useEffect, useCallback } from 'react'

interface UseTextSelectionResult {
  selectedText: string
  hasSelection: boolean
  clearSelection: () => void
}

/**
 * Hook to track text selection in the document.
 * Note: This only works for text in the main document, not inside cross-origin iframes.
 */
export function useTextSelection(): UseTextSelectionResult {
  const [selectedText, setSelectedText] = useState('')

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim() || ''
      setSelectedText(text)
    }

    // Listen for selection changes
    document.addEventListener('selectionchange', handleSelectionChange)

    // Also check on mouseup for better responsiveness
    document.addEventListener('mouseup', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleSelectionChange)
    }
  }, [])

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    setSelectedText('')
  }, [])

  return {
    selectedText,
    hasSelection: selectedText.length > 0,
    clearSelection,
  }
}

export default useTextSelection
