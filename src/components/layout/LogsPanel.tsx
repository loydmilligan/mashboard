import { useRef, useCallback } from 'react'
import { ChevronDown, ScrollText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { ServiceIframe } from '@/components/shared/ServiceIframe'
import { cn } from '@/lib/utils'

const LOGS_MIN_HEIGHT = 200
const LOGS_MAX_HEIGHT_VH = 90

export function LogsPanel() {
  const { logsPanelOpen, logsPanelHeight, toggleLogsPanel, setLogsPanelHeight } = useUIStore()
  const dozzleUrl = useSettingsStore((s) => s.dozzle.baseUrl)
  const dozzleEnabled = useSettingsStore((s) => s.servicesEnabled.dozzle)

  const panelRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true
      startY.current = e.clientY
      startHeight.current = logsPanelHeight
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return
        const deltaY = startY.current - e.clientY
        const newHeight = Math.min(
          Math.max(startHeight.current + deltaY, LOGS_MIN_HEIGHT),
          window.innerHeight * (LOGS_MAX_HEIGHT_VH / 100)
        )
        setLogsPanelHeight(newHeight)
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
    [logsPanelHeight, setLogsPanelHeight]
  )

  // Don't render if disabled
  if (!dozzleEnabled) {
    return null
  }

  // Ensure URL ends with / for proper iframe loading
  const iframeSrc = dozzleUrl ? (dozzleUrl.endsWith('/') ? dozzleUrl : `${dozzleUrl}/`) : null

  return (
    <div
      ref={panelRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 flex flex-col border-t border-border bg-background transition-transform duration-200',
        logsPanelOpen ? 'translate-y-0' : 'translate-y-full'
      )}
      style={{ height: logsPanelOpen ? logsPanelHeight : 0 }}
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
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Container Logs</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleLogsPanel} className="h-6 w-6">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ServiceIframe
          src={iframeSrc}
          title="Dozzle"
          className="h-full"
          placeholder="Dozzle URL not configured (Settings → Services)"
        />
      </div>
    </div>
  )
}
