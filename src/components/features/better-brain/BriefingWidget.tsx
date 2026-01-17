import { useEffect } from 'react'
import { useBetterBrainStore } from '@/stores/betterBrainStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Newspaper, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function BriefingWidget() {
  const {
    latestBriefing,
    isLoadingBriefing,
    isGeneratingBriefing,
    briefingError,
    isHealthy,
    fetchLatestBriefing,
    generateBriefing,
    checkHealth,
  } = useBetterBrainStore()

  useEffect(() => {
    checkHealth().then((healthy) => {
      if (healthy) {
        fetchLatestBriefing()
      }
    })
  }, [])

  if (!isHealthy) {
    return (
      <Card className="h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Newspaper className="h-4 w-4" />
            Daily Briefing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">Better Brain unavailable</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Newspaper className="h-4 w-4" />
          Daily Briefing
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => generateBriefing()}
          disabled={isGeneratingBriefing || isLoadingBriefing}
          className="h-7 w-7 p-0"
        >
          <RefreshCw
            className={cn('h-4 w-4', (isGeneratingBriefing || isLoadingBriefing) && 'animate-spin')}
          />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {briefingError ? (
          <div className="text-sm text-muted-foreground text-center py-4">{briefingError}</div>
        ) : latestBriefing ? (
          <div className="space-y-3">
            {/* Timestamp */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(latestBriefing.generated_at)}
              {latestBriefing.content_json && (
                <span className="ml-2">
                  ({latestBriefing.content_json.item_count} items)
                </span>
              )}
            </div>

            {/* Markdown Content - rendered as simple text with basic formatting */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
              {latestBriefing.content_markdown.split('\n').map((line, i) => {
                // Handle headers
                if (line.startsWith('### ')) {
                  return (
                    <h4 key={i} className="text-sm font-semibold mt-3 mb-1">
                      {line.replace('### ', '')}
                    </h4>
                  )
                }
                if (line.startsWith('## ')) {
                  return (
                    <h3 key={i} className="text-sm font-bold mt-3 mb-1">
                      {line.replace('## ', '')}
                    </h3>
                  )
                }
                if (line.startsWith('# ')) {
                  return (
                    <h2 key={i} className="text-base font-bold mt-2 mb-2">
                      {line.replace('# ', '')}
                    </h2>
                  )
                }
                // Handle list items
                if (line.startsWith('- ')) {
                  const content = line.replace('- ', '')
                  // Parse markdown links
                  const linkMatch = content.match(/\[([^\]]+)\]\(([^)]+)\)/)
                  if (linkMatch) {
                    const before = content.substring(0, linkMatch.index)
                    const after = content.substring((linkMatch.index || 0) + linkMatch[0].length)
                    return (
                      <div key={i} className="flex gap-1 text-sm my-1">
                        <span className="text-muted-foreground">•</span>
                        <span>
                          {before}
                          <a
                            href={linkMatch[2]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {linkMatch[1]}
                          </a>
                          {after}
                        </span>
                      </div>
                    )
                  }
                  return (
                    <div key={i} className="flex gap-1 text-sm my-1">
                      <span className="text-muted-foreground">•</span>
                      <span>{content}</span>
                    </div>
                  )
                }
                // Handle bold text (What to Focus On)
                if (line.startsWith('**')) {
                  return (
                    <p key={i} className="text-sm font-semibold mt-3">
                      {line.replace(/\*\*/g, '')}
                    </p>
                  )
                }
                // Regular text
                if (line.trim()) {
                  return (
                    <p key={i} className="text-sm my-1">
                      {line}
                    </p>
                  )
                }
                return null
              })}
            </div>
          </div>
        ) : isLoadingBriefing ? (
          <div className="text-sm text-muted-foreground text-center py-4">Loading briefing...</div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No briefing available
            <Button
              variant="link"
              size="sm"
              onClick={() => generateBriefing()}
              className="block mx-auto mt-2"
            >
              Generate one now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
