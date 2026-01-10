export interface Host {
  id: string
  name: string
  hostname: string
  description?: string
}

export interface HostStatus {
  hostId: string
  online: boolean
  lastSeen: number | null
}

export interface HostMetrics {
  hostId: string
  cpu: number // percentage 0-100
  memory: {
    used: number // bytes
    total: number // bytes
    percentage: number
  }
  disk: {
    used: number // bytes
    total: number // bytes
    percentage: number
  }
}

export interface ServerInfo {
  host: Host
  status: HostStatus
  metrics?: HostMetrics
}
