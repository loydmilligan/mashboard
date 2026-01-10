import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Server, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { termixService } from '@/services/termix'
import type { ServerInfo } from '@/types/termix'
import { cn } from '@/lib/utils'

const POLL_INTERVAL = 60000 // 60 seconds

export function ServerStatusWidget() {
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServers = useCallback(async () => {
    if (!termixService.isConfigured()) {
      setLoading(false)
      setServers([])
      return
    }

    try {
      setError(null)
      const data = await termixService.getAllServerInfo()
      setServers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServers()
    const interval = setInterval(fetchServers, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchServers])

  // Not configured state
  if (!termixService.isConfigured()) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card/50 p-3 text-center">
        <Server className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Termix not configured</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-destructive">{error}</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={fetchServers}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1 rounded-lg border bg-card p-3 pl-8">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Servers</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          onClick={fetchServers}
          disabled={loading}
        >
          <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
        </Button>
      </div>

      {servers.length === 0 ? (
        <p className="text-xs text-muted-foreground">No servers</p>
      ) : (
        <div className="space-y-1">
          {servers.map((server) => (
            <div
              key={server.host.id}
              className="flex items-center gap-2 rounded-md bg-card/50 px-2 py-1.5"
            >
              <Circle
                className={cn(
                  'h-2 w-2 fill-current',
                  server.status.online ? 'text-green-500' : 'text-red-500'
                )}
              />
              <span className="flex-1 truncate text-xs">{server.host.name}</span>
              <span className="text-xs text-muted-foreground">
                {server.status.online ? 'Online' : 'Offline'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
