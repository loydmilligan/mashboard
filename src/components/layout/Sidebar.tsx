import { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
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
  const isDragging = useRef(false)
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

  // Handle resize drag
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!onWidthChange) return

      e.preventDefault()
      isDragging.current = true
      startX.current = e.clientX
      startWidth.current = width
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return

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
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [side, width, onWidthChange]
  )

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
              'absolute top-0 bottom-0 z-10 w-1 cursor-ew-resize group',
              'hover:bg-accent/50 active:bg-accent',
              'transition-colors duration-150',
              side === 'left' ? 'right-0' : 'left-0'
            )}
            onMouseDown={handleResizeMouseDown}
          >
            {/* Visual indicator */}
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 h-12 w-1 rounded-full bg-border',
                'group-hover:bg-muted-foreground group-hover:w-1.5',
                'group-active:bg-primary group-active:w-1.5',
                'transition-all duration-150',
                side === 'left' ? 'right-0' : 'left-0'
              )}
            />
            {/* Larger hit area */}
            <div className="absolute inset-y-0 -left-1 -right-1" />
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
