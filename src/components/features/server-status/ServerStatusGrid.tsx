import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Server, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { termixService } from '@/services/termix'
import { ServerStatusCard } from './ServerStatusCard'
import type { ServerInfo } from '@/types/termix'

const POLL_INTERVAL = 60000 // 60 seconds

export function ServerStatusGrid() {
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchServers = useCallback(async () => {
    if (!termixService.isConfigured()) {
      setLoading(false)
      setError(null)
      setServers([])
      return
    }

    try {
      setError(null)
      const data = await termixService.getAllServerInfo()
      setServers(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch servers')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch and polling
  useEffect(() => {
    fetchServers()

    const interval = setInterval(fetchServers, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchServers])

  // Pause polling when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchServers()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchServers])

  const handleRefresh = () => {
    setLoading(true)
    fetchServers()
  }

  // Not configured state
  if (!termixService.isConfigured()) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-medium text-foreground">Server Status</h2>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Server className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Termix not configured
          </p>
          <p className="text-xs text-muted-foreground">
            Add your Termix URL and token in Settings
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-foreground">Server Status</h2>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <AlertCircle className="mb-4 h-8 w-8 text-destructive" />
          <p className="mb-2 text-sm font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : servers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
          <Server className="mb-4 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No servers found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerStatusCard key={server.host.id} server={server} />
          ))}
        </div>
      )}
    </section>
  )
}
