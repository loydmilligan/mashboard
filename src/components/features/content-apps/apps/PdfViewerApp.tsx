import { Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PdfViewerAppProps {
  url: string
  originalName?: string
}

export function PdfViewerApp({ url, originalName }: PdfViewerAppProps) {
  if (!url) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No PDF URL provided
      </div>
    )
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = originalName || 'document.pdf'
    link.click()
  }

  const handleOpenInNewTab = () => {
    window.open(url, '_blank')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <span className="text-sm text-muted-foreground truncate flex-1">
          {originalName || 'PDF Document'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenInNewTab}
          title="Open in new tab"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* PDF embed - uses browser's built-in PDF viewer */}
      <div className="flex-1">
        <iframe
          src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
          title={originalName || 'PDF Document'}
          className="h-full w-full border-0"
        />
      </div>
    </div>
  )
}
