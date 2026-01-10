import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useKeyboardShortcuts,
  matchesShortcut,
  formatShortcut,
  isMac,
  getModifierKeyName,
} from './useKeyboardShortcuts'
import type { KeyboardShortcut } from './useKeyboardShortcuts'

// Helper to create keyboard events
function createKeyboardEvent(
  key: string,
  options: {
    metaKey?: boolean
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
  } = {}
): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key,
    metaKey: options.metaKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    bubbles: true,
    cancelable: true,
  })
}

// Helper to dispatch keyboard event to window
function pressKey(
  key: string,
  options: {
    metaKey?: boolean
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
  } = {}
): void {
  const event = createKeyboardEvent(key, options)
  window.dispatchEvent(event)
}

describe('useKeyboardShortcuts', () => {
  describe('matchesShortcut', () => {
    it('should match simple key press', () => {
      const shortcut: KeyboardShortcut = { key: 'k', action: vi.fn() }
      const event = createKeyboardEvent('k')

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('should not match wrong key', () => {
      const shortcut: KeyboardShortcut = { key: 'k', action: vi.fn() }
      const event = createKeyboardEvent('j')

      expect(matchesShortcut(event, shortcut)).toBe(false)
    })

    it('should match case-insensitively', () => {
      const shortcut: KeyboardShortcut = { key: 'K', action: vi.fn() }
      const event = createKeyboardEvent('k')

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('should match mod+key on Mac (metaKey)', () => {
      // Mock isMac to return true
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')

      const shortcut: KeyboardShortcut = { key: 'k', mod: true, action: vi.fn() }
      const event = createKeyboardEvent('k', { metaKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('should match mod+key on Windows/Linux (ctrlKey)', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32')

      const shortcut: KeyboardShortcut = { key: 'k', mod: true, action: vi.fn() }
      const event = createKeyboardEvent('k', { ctrlKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('should not match mod+key without modifier pressed', () => {
      const shortcut: KeyboardShortcut = { key: 'k', mod: true, action: vi.fn() }
      const event = createKeyboardEvent('k')

      expect(matchesShortcut(event, shortcut)).toBe(false)
    })

    it('should match shift+key', () => {
      const shortcut: KeyboardShortcut = { key: 'n', shift: true, action: vi.fn() }
      const event = createKeyboardEvent('n', { shiftKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('should match mod+shift+key', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')

      const shortcut: KeyboardShortcut = {
        key: 'n',
        mod: true,
        shift: true,
        action: vi.fn(),
      }
      const event = createKeyboardEvent('n', { metaKey: true, shiftKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('should not match mod+shift+key when only mod is pressed', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')

      const shortcut: KeyboardShortcut = {
        key: 'n',
        mod: true,
        shift: true,
        action: vi.fn(),
      }
      const event = createKeyboardEvent('n', { metaKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(false)
    })

    it('should match alt+key', () => {
      const shortcut: KeyboardShortcut = { key: 'a', alt: true, action: vi.fn() }
      const event = createKeyboardEvent('a', { altKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('should not match disabled shortcuts', () => {
      const shortcut: KeyboardShortcut = {
        key: 'k',
        action: vi.fn(),
        disabled: true,
      }
      const event = createKeyboardEvent('k')

      expect(matchesShortcut(event, shortcut)).toBe(false)
    })

    it('should match Escape key', () => {
      const shortcut: KeyboardShortcut = { key: 'Escape', action: vi.fn() }
      const event = createKeyboardEvent('Escape')

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('should match Enter key', () => {
      const shortcut: KeyboardShortcut = { key: 'Enter', action: vi.fn() }
      const event = createKeyboardEvent('Enter')

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('should distinguish between mod+k and mod+shift+k', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')

      const modK: KeyboardShortcut = { key: 'k', mod: true, action: vi.fn() }
      const modShiftK: KeyboardShortcut = {
        key: 'k',
        mod: true,
        shift: true,
        action: vi.fn(),
      }

      const eventModK = createKeyboardEvent('k', { metaKey: true })
      const eventModShiftK = createKeyboardEvent('k', {
        metaKey: true,
        shiftKey: true,
      })

      expect(matchesShortcut(eventModK, modK)).toBe(true)
      expect(matchesShortcut(eventModK, modShiftK)).toBe(false)
      expect(matchesShortcut(eventModShiftK, modK)).toBe(false)
      expect(matchesShortcut(eventModShiftK, modShiftK)).toBe(true)
    })
  })

  describe('formatShortcut', () => {
    it('should format simple key', () => {
      expect(formatShortcut({ key: 'k' })).toBe('K')
    })

    it('should format mod+key on Mac', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
      expect(formatShortcut({ key: 'k', mod: true })).toBe('⌘K')
    })

    it('should format mod+key on Windows', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32')
      expect(formatShortcut({ key: 'k', mod: true })).toBe('Ctrl+K')
    })

    it('should format mod+shift+key on Mac', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
      expect(formatShortcut({ key: 'n', mod: true, shift: true })).toBe('⌘⇧N')
    })

    it('should format Escape as Esc', () => {
      expect(formatShortcut({ key: 'Escape' })).toBe('Esc')
    })

    it('should format space key', () => {
      expect(formatShortcut({ key: ' ' })).toBe('Space')
    })

    it('should format arrow keys', () => {
      expect(formatShortcut({ key: 'ArrowUp' })).toBe('↑')
      expect(formatShortcut({ key: 'ArrowDown' })).toBe('↓')
    })
  })

  describe('isMac', () => {
    it('should return true for Mac platform', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
      expect(isMac()).toBe(true)
    })

    it('should return true for MacPPC', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacPPC')
      expect(isMac()).toBe(true)
    })

    it('should return false for Windows', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32')
      expect(isMac()).toBe(false)
    })

    it('should return false for Linux', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Linux x86_64')
      expect(isMac()).toBe(false)
    })
  })

  describe('getModifierKeyName', () => {
    it('should return ⌘ on Mac', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
      expect(getModifierKeyName()).toBe('⌘')
    })

    it('should return Ctrl on Windows', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32')
      expect(getModifierKeyName()).toBe('Ctrl')
    })
  })

  describe('useKeyboardShortcuts hook', () => {
    beforeEach(() => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should call action when shortcut is pressed', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([{ key: 'k', mod: true, action }])
      )

      act(() => {
        pressKey('k', { metaKey: true })
      })

      expect(action).toHaveBeenCalledTimes(1)
    })

    it('should not call action when different key is pressed', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([{ key: 'k', mod: true, action }])
      )

      act(() => {
        pressKey('j', { metaKey: true })
      })

      expect(action).not.toHaveBeenCalled()
    })

    it('should handle multiple shortcuts', () => {
      const actionK = vi.fn()
      const actionJ = vi.fn()
      const actionSlash = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          { key: 'k', mod: true, action: actionK },
          { key: 'j', mod: true, action: actionJ },
          { key: '/', mod: true, action: actionSlash },
        ])
      )

      act(() => {
        pressKey('k', { metaKey: true })
        pressKey('/', { metaKey: true })
      })

      expect(actionK).toHaveBeenCalledTimes(1)
      expect(actionJ).not.toHaveBeenCalled()
      expect(actionSlash).toHaveBeenCalledTimes(1)
    })

    it('should handle Escape key without modifier', () => {
      const action = vi.fn()

      renderHook(() => useKeyboardShortcuts([{ key: 'Escape', action }]))

      act(() => {
        pressKey('Escape')
      })

      expect(action).toHaveBeenCalledTimes(1)
    })

    it('should clean up event listener on unmount', () => {
      const action = vi.fn()

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts([{ key: 'k', mod: true, action }])
      )

      unmount()

      act(() => {
        pressKey('k', { metaKey: true })
      })

      expect(action).not.toHaveBeenCalled()
    })

    it('should not trigger when disabled', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts(
          [{ key: 'k', mod: true, action }],
          { enabled: false }
        )
      )

      act(() => {
        pressKey('k', { metaKey: true })
      })

      expect(action).not.toHaveBeenCalled()
    })

    it('should not trigger disabled shortcuts', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([{ key: 'k', mod: true, action, disabled: true }])
      )

      act(() => {
        pressKey('k', { metaKey: true })
      })

      expect(action).not.toHaveBeenCalled()
    })

    it('should handle mod+shift combinations', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([{ key: 'n', mod: true, shift: true, action }])
      )

      act(() => {
        pressKey('n', { metaKey: true, shiftKey: true })
      })

      expect(action).toHaveBeenCalledTimes(1)
    })

    it('should update shortcuts dynamically', () => {
      const action1 = vi.fn()
      const action2 = vi.fn()

      const { rerender } = renderHook(
        ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
        {
          initialProps: {
            shortcuts: [{ key: 'k', mod: true, action: action1 }],
          },
        }
      )

      act(() => {
        pressKey('k', { metaKey: true })
      })

      expect(action1).toHaveBeenCalledTimes(1)

      rerender({
        shortcuts: [{ key: 'k', mod: true, action: action2 }],
      })

      act(() => {
        pressKey('k', { metaKey: true })
      })

      expect(action1).toHaveBeenCalledTimes(1) // Still 1
      expect(action2).toHaveBeenCalledTimes(1)
    })

    it('should prevent default by default', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([{ key: 'k', mod: true, action }])
      )

      const event = createKeyboardEvent('k', { metaKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      act(() => {
        window.dispatchEvent(event)
      })

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should not prevent default when preventDefault is false', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          { key: 'k', mod: true, action, preventDefault: false },
        ])
      )

      const event = createKeyboardEvent('k', { metaKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      act(() => {
        window.dispatchEvent(event)
      })

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('should only trigger first matching shortcut', () => {
      const action1 = vi.fn()
      const action2 = vi.fn()

      // Both shortcuts match the same key
      renderHook(() =>
        useKeyboardShortcuts([
          { key: 'k', mod: true, action: action1 },
          { key: 'k', mod: true, action: action2 },
        ])
      )

      act(() => {
        pressKey('k', { metaKey: true })
      })

      expect(action1).toHaveBeenCalledTimes(1)
      expect(action2).not.toHaveBeenCalled()
    })
  })
})
