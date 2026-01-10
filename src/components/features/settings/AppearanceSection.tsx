import { useEffect } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useSettingsStore } from '@/stores/settingsStore'

export function AppearanceSection() {
  const { appearance, setAppearance, panelTimeouts, setPanelTimeouts } = useSettingsStore()

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement

    if (appearance.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('light', !prefersDark)
    } else {
      root.classList.toggle('light', appearance.theme === 'light')
    }
  }, [appearance.theme])

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="space-y-4">
        <h3 className="font-medium">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setAppearance({ theme: 'dark' })}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
              appearance.theme === 'dark'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <Moon className="h-6 w-6" />
            <span className="text-sm">Dark</span>
          </button>
          <button
            onClick={() => setAppearance({ theme: 'light' })}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
              appearance.theme === 'light'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <Sun className="h-6 w-6" />
            <span className="text-sm">Light</span>
          </button>
          <button
            onClick={() => setAppearance({ theme: 'system' })}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
              appearance.theme === 'system'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <Monitor className="h-6 w-6" />
            <span className="text-sm">System</span>
          </button>
        </div>
      </div>

      <Separator />

      {/* Sidebar Behavior */}
      <div className="space-y-4">
        <h3 className="font-medium">Sidebar Behavior</h3>
        <div className="space-y-2">
          <Label htmlFor="sidebar-behavior">How sidebars interact with main content</Label>
          <Select
            value={appearance.sidebarBehavior}
            onValueChange={(value: 'push' | 'overlay') =>
              setAppearance({ sidebarBehavior: value })
            }
          >
            <SelectTrigger id="sidebar-behavior">
              <SelectValue placeholder="Select behavior" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overlay">Overlay (float over content)</SelectItem>
              <SelectItem value="push">Push (resize content)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {appearance.sidebarBehavior === 'overlay'
              ? 'Sidebars will float over the main content area'
              : 'Sidebars will push the main content to make room'}
          </p>
        </div>
      </div>

      <Separator />

      {/* Panel Auto-Hide Timeouts */}
      <div className="space-y-4">
        <h3 className="font-medium">Panel Auto-Hide</h3>
        <p className="text-sm text-muted-foreground">
          Set how many seconds before each panel automatically closes. Use 0 to disable auto-hide.
        </p>
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="ai-timeout">AI Chat Sidebar</Label>
              <p className="text-xs text-muted-foreground">Left panel</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="ai-timeout"
                type="number"
                min="0"
                max="300"
                value={panelTimeouts.aiSidebar / 1000}
                onChange={(e) => setPanelTimeouts({ aiSidebar: Number(e.target.value) * 1000 })}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">sec</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="notes-timeout">Notes Sidebar</Label>
              <p className="text-xs text-muted-foreground">Right panel</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="notes-timeout"
                type="number"
                min="0"
                max="300"
                value={panelTimeouts.notesSidebar / 1000}
                onChange={(e) => setPanelTimeouts({ notesSidebar: Number(e.target.value) * 1000 })}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">sec</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="terminal-timeout">Terminal Panel</Label>
              <p className="text-xs text-muted-foreground">Bottom panel</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="terminal-timeout"
                type="number"
                min="0"
                max="300"
                value={panelTimeouts.terminalPanel / 1000}
                onChange={(e) => setPanelTimeouts({ terminalPanel: Number(e.target.value) * 1000 })}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">sec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
