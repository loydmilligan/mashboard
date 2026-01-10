import { useState } from 'react'
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageViewerAppProps {
  url: string
  originalName?: string
}

export function ImageViewerApp({ url, originalName }: ImageViewerAppProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  if (!url) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No image URL provided
      </div>
    )
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = originalName || 'image'
    link.click()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <span className="text-sm text-muted-foreground truncate flex-1">
          {originalName || 'Image'}
        </span>
        <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleRotate} title="Rotate">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Image container */}
      <div className="flex-1 overflow-auto bg-muted/10 flex items-center justify-center p-4">
        <img
          src={url}
          alt={originalName || 'Image'}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          draggable={false}
        />
      </div>
    </div>
  )
}
