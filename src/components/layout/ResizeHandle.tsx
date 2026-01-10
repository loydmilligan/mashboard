import { useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ResizeHandleProps {
  onResize: (position: number) => void
  containerRef: React.RefObject<HTMLDivElement>
  className?: string
}

export function ResizeHandle({ onResize, containerRef, className }: ResizeHandleProps) {
  const isDragging = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const position = (e.clientX - rect.left) / rect.width

      onResize(position)
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [onResize, containerRef])

  return (
    <div
      className={cn(
        'group relative flex w-1 cursor-col-resize items-center justify-center',
        'hover:bg-accent/50 active:bg-accent',
        'transition-colors duration-150',
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Visual handle indicator */}
      <div
        className={cn(
          'absolute h-12 w-1 rounded-full bg-border',
          'group-hover:bg-muted-foreground group-hover:w-1.5',
          'group-active:bg-primary group-active:w-1.5',
          'transition-all duration-150'
        )}
      />
      {/* Larger hit area */}
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  )
}
