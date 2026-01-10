import { cn } from '@/lib/utils'
import type { ServerInfo } from '@/types/termix'

interface ServerStatusCardProps {
  server: ServerInfo
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatTimeAgo(timestamp: number | null): string {
  if (!timestamp) return 'Unknown'
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            value > 90 ? 'bg-destructive' : value > 70 ? 'bg-yellow-500' : 'bg-green-500'
          )}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function ServerStatusCard({ server }: ServerStatusCardProps) {
  const { host, status, metrics } = server

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            status.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          )}
        />
        <h3 className="font-medium">{host.name}</h3>
      </div>

      {/* Status */}
      {status.online ? (
        metrics ? (
          <div className="space-y-2">
            <ProgressBar value={metrics.cpu} label="CPU" />
            <ProgressBar value={metrics.memory.percentage} label="Memory" />
            <ProgressBar value={metrics.disk.percentage} label="Disk" />
            <div className="mt-2 text-xs text-muted-foreground">
              {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)} RAM
            </div>
          </div>
        ) : (
          <p className="text-sm text-green-500">Online</p>
        )
      ) : (
        <div className="text-sm text-muted-foreground">
          <span className="text-red-500">Offline</span>
          {status.lastSeen && (
            <span className="ml-2">Last seen: {formatTimeAgo(status.lastSeen)}</span>
          )}
        </div>
      )}
    </div>
  )
}
