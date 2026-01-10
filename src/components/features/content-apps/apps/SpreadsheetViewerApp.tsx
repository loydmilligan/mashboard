import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SpreadsheetViewerAppProps {
  url: string
  originalName?: string
  sheetName?: string
}

// Simple CSV parser (handles basic cases)
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"'
        i++ // Skip next quote
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentCell += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentRow.push(currentCell)
        currentCell = ''
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentCell)
        rows.push(currentRow)
        currentRow = []
        currentCell = ''
        if (char === '\r') i++ // Skip \n in \r\n
      } else if (char !== '\r') {
        currentCell += char
      }
    }
  }

  // Don't forget last cell/row
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell)
    rows.push(currentRow)
  }

  return rows
}

export function SpreadsheetViewerApp({ url, originalName, sheetName }: SpreadsheetViewerAppProps) {
  const [data, setData] = useState<string[][] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isCSV = originalName?.toLowerCase().endsWith('.csv')
  const isExcel = originalName?.toLowerCase().match(/\.(xlsx?|xls)$/)

  useEffect(() => {
    if (!url) {
      setError('No URL provided')
      setLoading(false)
      return
    }

    // For CSV files, fetch and parse
    if (isCSV) {
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load file: ${res.statusText}`)
          return res.text()
        })
        .then((text) => {
          const parsed = parseCSV(text)
          setData(parsed)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message)
          setLoading(false)
        })
    } else if (isExcel) {
      // For Excel files, show a message (would need xlsx library for full support)
      setError('Excel files (.xls, .xlsx) require additional setup. Download to view locally.')
      setLoading(false)
    } else {
      setError('Unsupported spreadsheet format')
      setLoading(false)
    }
  }, [url, isCSV, isExcel])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = originalName || 'spreadsheet.csv'
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
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
          <span className="text-sm text-muted-foreground truncate flex-1">
            {originalName || 'Spreadsheet'}
            {sheetName && <span className="ml-2 text-xs opacity-60">({sheetName})</span>}
          </span>
          <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 text-center">
          {error}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No data found in spreadsheet
      </div>
    )
  }

  // Assume first row is headers
  const headers = data[0]
  const rows = data.slice(1)

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <span className="text-sm text-muted-foreground truncate flex-1">
          {originalName || 'Spreadsheet'}
          {sheetName && <span className="ml-2 text-xs opacity-60">({sheetName})</span>}
          <span className="ml-2 text-xs opacity-60">
            ({rows.length} rows, {headers.length} columns)
          </span>
        </span>
        <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-muted">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="border border-border px-3 py-2 text-left font-medium"
                >
                  {header || `Column ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-muted/50">
                {headers.map((_, colIndex) => (
                  <td key={colIndex} className="border border-border px-3 py-2">
                    {row[colIndex] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
