import { useState, useCallback, useEffect, useRef } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ServiceIframeProps {
  src: string | null
  title: string
  className?: string
  placeholder?: string
}

export function ServiceIframe({ src, title, className, placeholder }: ServiceIframeProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [key, setKey] = useState(0)
  const prevSrcRef = useRef(src)

  // Reset loading state when src changes
  useEffect(() => {
    if (src && src !== prevSrcRef.current) {
      setIsLoading(true)
      setHasError(false)
      setKey((k) => k + 1)
    }
    prevSrcRef.current = src
  }, [src])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  const handleRetry = useCallback(() => {
    setIsLoading(true)
    setHasError(false)
    setKey((k) => k + 1)
  }, [])

  // No URL configured
  if (!src) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 bg-muted/30 text-center',
          className
        )}
      >
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {placeholder || `${title} not configured`}
          </p>
          <p className="text-xs text-muted-foreground">
            Configure the URL in Settings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading {title}...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Failed to load {title}</p>
              <p className="text-xs text-muted-foreground">
                Check the URL in Settings or try again
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* iframe */}
      <iframe
        key={key}
        src={src}
        title={title}
        className="h-full w-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  )
}
