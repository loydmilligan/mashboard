import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUIStore } from '@/stores/uiStore'
import { ApiKeysSection } from './ApiKeysSection'
import { AiPrefsSection } from './AiPrefsSection'
import { AppearanceSection } from './AppearanceSection'
import { DataSection } from './DataSection'

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen } = useUIStore()

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys, preferences, and appearance.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api-keys" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="ai-prefs">AI</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
            <TabsContent value="api-keys" className="mt-0">
              <ApiKeysSection />
            </TabsContent>

            <TabsContent value="ai-prefs" className="mt-0">
              <AiPrefsSection />
            </TabsContent>

            <TabsContent value="appearance" className="mt-0">
              <AppearanceSection />
            </TabsContent>

            <TabsContent value="data" className="mt-0">
              <DataSection />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
