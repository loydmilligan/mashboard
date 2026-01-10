import { useRef, useState } from 'react'
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSettingsStore } from '@/stores/settingsStore'

export function DataSection() {
  const { exportSettings, importSettings, clearAllData } = useSettingsStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleExport = () => {
    const data = exportSettings()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mashb0ard-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const success = importSettings(content)
      setImportStatus(success ? 'success' : 'error')
      setTimeout(() => setImportStatus('idle'), 3000)
    }
    reader.readAsText(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClear = () => {
    clearAllData()
    setShowClearConfirm(false)
    // Reload page to reset all state
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Export */}
      <div className="space-y-4">
        <h3 className="font-medium">Export Settings</h3>
        <p className="text-sm text-muted-foreground">
          Download all your settings as a JSON file. This includes API keys, preferences, and
          appearance settings.
        </p>
        <Button onClick={handleExport} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Export Settings
        </Button>
      </div>

      <Separator />

      {/* Import */}
      <div className="space-y-4">
        <h3 className="font-medium">Import Settings</h3>
        <p className="text-sm text-muted-foreground">
          Restore settings from a previously exported JSON file.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Settings
        </Button>
        {importStatus === 'success' && (
          <p className="text-sm text-green-500">Settings imported successfully!</p>
        )}
        {importStatus === 'error' && (
          <p className="text-sm text-destructive">Failed to import settings. Invalid file format.</p>
        )}
      </div>

      <Separator />

      {/* Clear All Data */}
      <div className="space-y-4">
        <h3 className="font-medium text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Clear all data stored in localStorage including settings, chat history, workflows, and
          pinned notes. This action cannot be undone.
        </p>

        {!showClearConfirm ? (
          <Button
            onClick={() => setShowClearConfirm(true)}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Data
          </Button>
        ) : (
          <div className="space-y-3 rounded-lg border border-destructive bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
              <div className="space-y-1">
                <p className="font-medium text-destructive">Are you sure?</p>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all your data. The page will reload after clearing.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowClearConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleClear} variant="destructive" className="flex-1">
                Yes, Clear Everything
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
