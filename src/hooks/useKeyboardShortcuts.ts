import { useEffect, useCallback, useRef } from 'react'

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /** The key to listen for (e.g., 'k', '/', 'Enter', 'Escape') */
  key: string
  /** Use platform modifier (Cmd on Mac, Ctrl on Windows/Linux) */
  mod?: boolean
  /** Require Shift key */
  shift?: boolean
  /** Require Alt/Option key */
  alt?: boolean
  /** Action to execute when shortcut is triggered */
  action: () => void
  /** Optional description for accessibility/documentation */
  description?: string
  /** Prevent default browser behavior (default: true) */
  preventDefault?: boolean
  /** Disable this shortcut temporarily */
  disabled?: boolean
}

/**
 * Detect if we're on macOS
 */
export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0
}

/**
 * Get the platform-specific modifier key name
 */
export function getModifierKeyName(): string {
  return isMac() ? '⌘' : 'Ctrl'
}

/**
 * Format a shortcut for display (e.g., "⌘K" or "Ctrl+K")
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action'>): string {
  const parts: string[] = []
  const mac = isMac()

  if (shortcut.mod) {
    parts.push(mac ? '⌘' : 'Ctrl')
  }
  if (shortcut.shift) {
    parts.push(mac ? '⇧' : 'Shift')
  }
  if (shortcut.alt) {
    parts.push(mac ? '⌥' : 'Alt')
  }

  // Format the key nicely
  let keyDisplay = shortcut.key.toUpperCase()
  if (shortcut.key === ' ') keyDisplay = 'Space'
  if (shortcut.key === 'Escape') keyDisplay = 'Esc'
  if (shortcut.key === 'ArrowUp') keyDisplay = '↑'
  if (shortcut.key === 'ArrowDown') keyDisplay = '↓'
  if (shortcut.key === 'ArrowLeft') keyDisplay = '←'
  if (shortcut.key === 'ArrowRight') keyDisplay = '→'

  parts.push(keyDisplay)

  // Mac uses no separator, Windows/Linux uses '+'
  return mac ? parts.join('') : parts.join('+')
}

/**
 * Check if a keyboard event matches a shortcut configuration
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  if (shortcut.disabled) return false

  // Check modifier key (Cmd on Mac, Ctrl on Windows/Linux)
  const modifierPressed = isMac() ? event.metaKey : event.ctrlKey
  if (shortcut.mod && !modifierPressed) return false
  if (!shortcut.mod && modifierPressed) return false

  // Check shift key
  if (shortcut.shift && !event.shiftKey) return false
  if (!shortcut.shift && event.shiftKey && shortcut.mod) return false // Prevent ⌘⇧K matching ⌘K

  // Check alt key
  if (shortcut.alt && !event.altKey) return false
  if (!shortcut.alt && event.altKey && shortcut.mod) return false

  // Check the key (case-insensitive for letter keys)
  const eventKey = event.key.toLowerCase()
  const shortcutKey = shortcut.key.toLowerCase()

  return eventKey === shortcutKey
}

/**
 * Check if event target is an input element where shortcuts should be ignored
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false

  const tagName = target.tagName.toLowerCase()
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select'
  const isContentEditable = target.isContentEditable

  return isInput || isContentEditable
}

export interface UseKeyboardShortcutsOptions {
  /** Ignore shortcuts when focus is on input elements (default: true for mod shortcuts, false otherwise) */
  ignoreInputs?: boolean
  /** Enable/disable all shortcuts (default: true) */
  enabled?: boolean
}

/**
 * Hook for registering keyboard shortcuts
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: 'k', mod: true, action: () => openCommandPalette() },
 *   { key: '/', mod: true, action: () => openAIChat() },
 *   { key: 'Escape', action: () => closeOverlay() },
 * ])
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true } = options

  // Store shortcuts in a ref to avoid recreating the handler
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  const optionsRef = useRef(options)
  optionsRef.current = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const currentShortcuts = shortcutsRef.current
    const currentOptions = optionsRef.current

    for (const shortcut of currentShortcuts) {
      if (matchesShortcut(event, shortcut)) {
        // Check if we should ignore inputs
        const shouldIgnoreInputs = currentOptions.ignoreInputs ?? shortcut.mod ?? false

        if (shouldIgnoreInputs && isInputElement(event.target)) {
          continue
        }

        // Prevent default unless explicitly disabled
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
        }

        shortcut.action()
        return // Only trigger one shortcut per event
      }
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}

export default useKeyboardShortcuts
