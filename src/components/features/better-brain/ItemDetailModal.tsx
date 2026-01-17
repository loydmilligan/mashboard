import { ExternalLink, X, Box, Github, Youtube, Newspaper, Tag, User, Building, Globe, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { BBItemDetail, ContentType } from '@/types/betterBrain'
import { cn } from '@/lib/utils'

interface ItemDetailModalProps {
  item: BBItemDetail
  onClose: () => void
}

const contentTypeConfig: Record<ContentType, { icon: typeof Box; label: string; color: string }> = {
  model: { icon: Box, label: '3D Model', color: 'bg-purple-500/10 text-purple-500' },
  repo: { icon: Github, label: 'Repository', color: 'bg-blue-500/10 text-blue-500' },
  video: { icon: Youtube, label: 'Video', color: 'bg-red-500/10 text-red-500' },
  news: { icon: Newspaper, label: 'News', color: 'bg-green-500/10 text-green-500' },
}

const entityTypeIcons = {
  person: User,
  organization: Building,
  country: Globe,
  topic: Hash,
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const config = contentTypeConfig[item.content_type] || contentTypeConfig.news
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl max-h-[85vh] translate-x-[-50%] translate-y-[-50%] bg-background border rounded-lg shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className={cn('text-xs', config.color)}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              {item.source && (
                <span className="text-xs text-muted-foreground">{item.source}</span>
              )}
              <Badge
                variant={item.status === 'processed' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {item.status}
              </Badge>
            </div>
            <h2 className="text-lg font-semibold">{item.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Thumbnail */}
            {item.thumbnail_url && (
              <div className="w-full max-h-48 rounded overflow-hidden bg-muted">
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Summary */}
            {item.summary && (
              <div>
                <h3 className="text-sm font-medium mb-1">Summary</h3>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
              </div>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Entities */}
            {item.entities && item.entities.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Entities</h3>
                <div className="flex flex-wrap gap-1">
                  {item.entities.map((entity) => {
                    const EntityIcon = entityTypeIcons[entity.entity_type] || Hash
                    return (
                      <Badge
                        key={entity.id}
                        variant="secondary"
                        className={cn(
                          'text-xs',
                          entity.sentiment === 'positive' && 'border-green-500/50',
                          entity.sentiment === 'negative' && 'border-red-500/50'
                        )}
                      >
                        <EntityIcon className="h-3 w-3 mr-1" />
                        {entity.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Metadata */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Metadata</h3>
                <div className="bg-muted rounded p-2 text-xs font-mono overflow-auto max-h-32">
                  <pre>{JSON.stringify(item.metadata, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Ingested: {new Date(item.ingested_at).toLocaleString()}</div>
              {item.processed_at && (
                <div>Processed: {new Date(item.processed_at).toLocaleString()}</div>
              )}
              {item.published_at && (
                <div>Published: {new Date(item.published_at).toLocaleString()}</div>
              )}
            </div>

            {/* Error message if any */}
            {item.error_message && (
              <div className="bg-destructive/10 text-destructive rounded p-2 text-sm">
                {item.error_message}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-xs text-muted-foreground">ID: {item.id}</span>
          <Button asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Original
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
