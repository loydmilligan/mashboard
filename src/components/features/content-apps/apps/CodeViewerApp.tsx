import { useState, useEffect } from 'react'
import { Copy, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeViewerAppProps {
  url: string
  originalName?: string
  language?: string
}

// Simple language detection from file extension
function detectLanguage(filename?: string): string {
  if (!filename) return 'text'
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    md: 'markdown',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    sql: 'sql',
    txt: 'text',
    csv: 'csv',
  }
  return langMap[ext] || 'text'
}

export function CodeViewerApp({ url, originalName, language }: CodeViewerAppProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const detectedLanguage = language || detectLanguage(originalName)

  useEffect(() => {
    if (!url) {
      setError('No URL provided')
      setLoading(false)
      return
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load file: ${res.statusText}`)
        return res.text()
      })
      .then((text) => {
        setContent(text)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [url])

  const handleCopy = async () => {
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = originalName || 'file.txt'
    link.click()
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <span className="text-sm text-muted-foreground truncate flex-1">
          {originalName || 'File'}
          <span className="ml-2 text-xs opacity-60">({detectedLanguage})</span>
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto bg-muted/5">
        <pre className="p-4 text-sm leading-relaxed">
          <code className={`language-${detectedLanguage}`}>
            {content}
          </code>
        </pre>
      </div>
    </div>
  )
}
