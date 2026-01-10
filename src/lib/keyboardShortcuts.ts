import { formatShortcut } from '@/hooks/useKeyboardShortcuts'

/**
 * Shortcut definition without action (for registry)
 */
export interface ShortcutDefinition {
  /** Unique identifier for this shortcut */
  id: string
  /** The key to listen for */
  key: string
  /** Use platform modifier (Cmd on Mac, Ctrl on Windows/Linux) */
  mod?: boolean
  /** Require Shift key */
  shift?: boolean
  /** Require Alt/Option key */
  alt?: boolean
  /** Human-readable description */
  description: string
}

/**
 * All keyboard shortcuts in the app
 * This is the single source of truth for shortcut definitions
 *
 * NOTE: Avoid shortcuts that conflict with Vivaldi browser:
 * - Ctrl+/ (status bar), Ctrl+Shift+N (private window), Ctrl+Shift+B (bookmarks bar)
 * - Ctrl+, (settings), Ctrl+` (varies), many Ctrl+Alt combos used by Vivaldi panels
 *
 * Safe Ctrl+Alt combos (not used by Vivaldi):
 * A, D, F, G, J, K, M, O, Q, R, S, T, U, V, W, X, Z
 */
export const SHORTCUTS = {
  // Command palette - Ctrl+K works (Vivaldi uses it for search field but page captures it)
  COMMAND_PALETTE: {
    id: 'command-palette',
    key: 'k',
    mod: true,
    description: 'Open Command Palette',
  },

  // AI and Chat - Ctrl+Alt+A (A for AI/Assistant)
  AI_CHAT: {
    id: 'ai-chat',
    key: 'a',
    mod: true,
    alt: true,
    description: 'Open AI Chat',
  },

  // Notes - Ctrl+Alt+D (D for Dumbpad/notes, avoiding N which Vivaldi uses)
  NOTES: {
    id: 'notes',
    key: 'd',
    mod: true,
    alt: true,
    description: 'Open Notes',
  },

  // Apps
  TERMIX: {
    id: 'termix',
    key: 't',
    mod: true,
    alt: true,
    description: 'Open Termix',
  },
  BYTESTASH: {
    id: 'bytestash',
    key: 's',
    mod: true,
    alt: true,
    description: 'Open ByteStash',
  },
  SEARCH: {
    id: 'search',
    key: 'e',
    mod: true,
    description: 'Focus Search / Open SearXNG',
  },

  // Pomodoro - Ctrl+Alt+P (P for Pomodoro)
  POMODORO: {
    id: 'pomodoro',
    key: 'p',
    mod: true,
    alt: true,
    description: 'Toggle Pomodoro Timer',
  },

  // Settings - Ctrl+Alt+O (O for Options, avoiding , which Vivaldi uses)
  SETTINGS: {
    id: 'settings',
    key: 'o',
    mod: true,
    alt: true,
    description: 'Open Settings',
  },

  // Navigation / Close
  ESCAPE: {
    id: 'escape',
    key: 'Escape',
    description: 'Close overlay / Clear input',
  },
} as const satisfies Record<string, ShortcutDefinition>

/**
 * Type for shortcut IDs
 */
export type ShortcutId = (typeof SHORTCUTS)[keyof typeof SHORTCUTS]['id']

/**
 * Get formatted shortcut display string for a shortcut
 */
export function getShortcutDisplay(shortcut: ShortcutDefinition): string {
  return formatShortcut({
    key: shortcut.key,
    mod: shortcut.mod,
    shift: shortcut.shift,
    alt: shortcut.alt,
  })
}

/**
 * Get shortcut by ID
 */
export function getShortcutById(id: ShortcutId): ShortcutDefinition | undefined {
  return Object.values(SHORTCUTS).find((s) => s.id === id)
}

/**
 * Get all shortcuts as an array
 */
export function getAllShortcuts(): ShortcutDefinition[] {
  return Object.values(SHORTCUTS)
}
