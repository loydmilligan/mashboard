import { useEffect, useRef, useCallback, useState } from 'react'
import { X, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LAYOUT } from '@/lib/constants'

interface SidebarProps {
  side: 'left' | 'right'
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  width?: number
  onWidthChange?: (width: number) => void
}

export function Sidebar({
  side,
  open,
  onClose,
  title,
  children,
  className,
  width = LAYOUT.SIDEBAR_WIDTH,
  onWidthChange,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Focus trap (basic implementation)
  useEffect(() => {
    if (open && sidebarRef.current) {
      sidebarRef.current.focus()
    }
  }, [open])

  // Stop resizing helper
  const stopResizing = useCallback(() => {
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Handle resize drag
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!onWidthChange) return

      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      startX.current = e.clientX
      startWidth.current = width
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    },
    [width, onWidthChange]
  )

  // Global mouse move and up handlers for resizing
  useEffect(() => {
    if (!isResizing || !onWidthChange) return

    const handleMouseMove = (e: MouseEvent) => {
      // For left sidebar, dragging right increases width
      // For right sidebar, dragging left increases width
      const deltaX = e.clientX - startX.current
      const newWidth =
        side === 'left' ? startWidth.current + deltaX : startWidth.current - deltaX

      // Clamp to min/max
      const clampedWidth = Math.min(
        Math.max(newWidth, LAYOUT.SIDEBAR_MIN_WIDTH),
        LAYOUT.SIDEBAR_MAX_WIDTH
      )
      onWidthChange(clampedWidth)
    }

    const handleMouseUp = () => {
      stopResizing()
    }

    // Stop resizing if mouse leaves the window entirely
    const handleMouseLeave = (e: MouseEvent) => {
      // Only stop if mouse actually left the document
      if (e.clientY <= 0 || e.clientX <= 0 ||
          e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        stopResizing()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isResizing, side, onWidthChange, stopResizing])

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        tabIndex={-1}
        className={cn(
          'fixed top-14 z-50 flex h-[calc(100vh-3.5rem)] flex-col border-border bg-background transition-transform duration-200 ease-out',
          side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
          open ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full',
          className
        )}
        style={{ width }}
      >
        {/* Resize handle */}
        {onWidthChange && (
          <div
            className={cn(
              'absolute top-0 bottom-0 z-10 w-4 cursor-ew-resize group',
              'transition-colors duration-150',
              side === 'left' ? '-right-2' : '-left-2',
              isResizing && 'bg-accent/30'
            )}
            onMouseDown={handleResizeMouseDown}
          >
            {/* Visual grip indicator - centered in handle */}
            <div
              className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                'flex items-center justify-center',
                'h-16 w-6 rounded-md',
                'bg-muted/50 border border-border',
                'group-hover:bg-accent group-hover:border-accent-foreground/20',
                'group-active:bg-primary/20 group-active:border-primary',
                'transition-all duration-150',
                isResizing && 'bg-primary/20 border-primary'
              )}
            >
              <GripVertical className={cn(
                'h-5 w-5 text-muted-foreground',
                'group-hover:text-foreground',
                'group-active:text-primary',
                isResizing && 'text-primary'
              )} />
            </div>
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
            <h2 className="font-medium">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close sidebar"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </aside>
    </>
  )
}
