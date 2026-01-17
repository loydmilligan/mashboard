import { ExternalLink, Box, Github, Youtube, Newspaper } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { BBItem, ContentType } from '@/types/betterBrain'
import { cn } from '@/lib/utils'

interface ItemCardProps {
  item: BBItem
  onClick?: () => void
}

const contentTypeConfig: Record<ContentType, { icon: typeof Box; label: string; color: string }> = {
  model: { icon: Box, label: '3D Model', color: 'bg-purple-500/10 text-purple-500' },
  repo: { icon: Github, label: 'Repository', color: 'bg-blue-500/10 text-blue-500' },
  video: { icon: Youtube, label: 'Video', color: 'bg-red-500/10 text-red-500' },
  news: { icon: Newspaper, label: 'News', color: 'bg-green-500/10 text-green-500' },
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const config = contentTypeConfig[item.content_type] || contentTypeConfig.news
  const Icon = config.icon

  return (
    <Card
      className={cn(
        'p-3 cursor-pointer transition-colors hover:bg-muted/50',
        'flex flex-col gap-2'
      )}
      onClick={onClick}
    >
      {/* Header with type badge and source */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className={cn('text-xs', config.color)}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
        {item.source && (
          <span className="text-xs text-muted-foreground truncate">{item.source}</span>
        )}
      </div>

      {/* Thumbnail if available */}
      {item.thumbnail_url && (
        <div className="w-full h-24 rounded overflow-hidden bg-muted">
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Title */}
      <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>

      {/* Summary if available */}
      {item.summary && (
        <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
      )}

      {/* Footer with time and link */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-muted-foreground">{formatTimeAgo(item.ingested_at)}</span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </Card>
  )
}
