import { useRef } from 'react'
import { useLayoutStore } from '@/stores/layoutStore'
import { ResizeHandle } from './ResizeHandle'
import { cn } from '@/lib/utils'

interface SplitLayoutProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  className?: string
}

export function SplitLayout({ leftPanel, rightPanel, className }: SplitLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { splitPosition, setSplitPosition } = useLayoutStore()

  const leftWidth = `${splitPosition * 100}%`
  const rightWidth = `${(1 - splitPosition) * 100}%`

  return (
    <div
      ref={containerRef}
      className={cn('flex h-full w-full overflow-hidden', className)}
    >
      {/* Left Panel */}
      <div
        className="h-full shrink-0 overflow-hidden"
        style={{ width: leftWidth }}
      >
        {leftPanel}
      </div>

      {/* Resize Handle */}
      <ResizeHandle
        onResize={setSplitPosition}
        containerRef={containerRef}
      />

      {/* Right Panel */}
      <div
        className="h-full min-w-0 flex-1 overflow-hidden"
        style={{ width: rightWidth }}
      >
        {rightPanel}
      </div>
    </div>
  )
}
