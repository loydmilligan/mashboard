import { useState } from 'react'
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { bytestashService } from '@/services/bytestash'
import type { Snippet } from '@/types/snippet'

interface SnippetViewProps {
  snippet: Snippet
  onBack: () => void
}

export function SnippetView({ snippet, onBack }: SnippetViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border p-3">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 truncate">
          <h3 className="truncate font-medium">{snippet.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          asChild
        >
          <a
            href={bytestashService.getByteStashUrl(snippet.id)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Description and tags */}
      {(snippet.description || snippet.categories.length > 0) && (
        <div className="border-b border-border p-3">
          {snippet.description && (
            <p className="mb-2 text-sm text-muted-foreground">{snippet.description}</p>
          )}
          {snippet.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {snippet.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fragments */}
      <div className="flex-1 overflow-auto">
        {snippet.fragments.map((fragment, index) => (
          <div key={fragment.id} className="border-b border-border last:border-0">
            {/* Fragment header */}
            <div className="flex items-center justify-between bg-muted/30 px-3 py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{fragment.file_name}</span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                  {fragment.language}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCopy(fragment.code, index)}
              >
                {copiedIndex === index ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            {/* Code */}
            <pre className="overflow-x-auto p-3 text-sm">
              <code>{fragment.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
