import { useRef, useCallback } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { ServiceIframe } from '@/components/shared/ServiceIframe'
import { cn } from '@/lib/utils'
import { LAYOUT } from '@/lib/constants'

export function TerminalPanel() {
  const { terminalPanelOpen, terminalPanelHeight, toggleTerminalPanel, setTerminalPanelHeight } =
    useUIStore()
  const termixIframeUrl = useSettingsStore((s) => s.termix.iframeUrl)

  const panelRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true
      startY.current = e.clientY
      startHeight.current = terminalPanelHeight
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return
        const deltaY = startY.current - e.clientY
        const newHeight = Math.min(
          Math.max(startHeight.current + deltaY, LAYOUT.TERMINAL_MIN_HEIGHT),
          window.innerHeight * (LAYOUT.TERMINAL_MAX_HEIGHT_VH / 100)
        )
        setTerminalPanelHeight(newHeight)
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
    [terminalPanelHeight, setTerminalPanelHeight]
  )

  return (
    <div
      ref={panelRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 flex flex-col border-t border-border bg-background transition-transform duration-200',
        terminalPanelOpen ? 'translate-y-0' : 'translate-y-full'
      )}
      style={{ height: terminalPanelOpen ? terminalPanelHeight : 0 }}
    >
      {/* Drag handle */}
      <div
        className="group flex h-8 shrink-0 cursor-ns-resize items-center justify-center border-b border-border hover:bg-muted"
        onMouseDown={handleMouseDown}
      >
        <div className="h-1 w-12 rounded-full bg-border transition-colors group-hover:bg-muted-foreground" />
      </div>

      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="text-sm font-medium">Terminal</span>
        <Button variant="ghost" size="icon" onClick={toggleTerminalPanel} className="h-6 w-6">
          {terminalPanelOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ServiceIframe
          src={termixIframeUrl || null}
          title="Termix"
          className="h-full"
          placeholder="Termix iframe URL not configured (Settings → API Keys)"
        />
      </div>
    </div>
  )
}
