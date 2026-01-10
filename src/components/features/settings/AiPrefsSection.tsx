import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useSettingsStore } from '@/stores/settingsStore'
import { useModelsStore } from '@/stores/modelsStore'
import { ModelsManager } from './ModelsManager'

export function AiPrefsSection() {
  const { ai, setAIPreferences } = useSettingsStore()
  const { models, initialized, isLoading, fetchModels, getNickname } = useModelsStore()

  // Ensure models are loaded
  useEffect(() => {
    if (!initialized && !isLoading) {
      fetchModels()
    }
  }, [initialized, isLoading, fetchModels])

  return (
    <div className="space-y-6">
      {/* AI Models Manager */}
      <ModelsManager />

      <Separator />

      {/* Default Model */}
      <div className="space-y-4">
        <h3 className="font-medium">Default Model</h3>
        <div className="space-y-2">
          <Label htmlFor="default-model">Model for new conversations</Label>
          <Select
            value={ai.defaultModel}
            onValueChange={(value) => setAIPreferences({ defaultModel: value })}
          >
            <SelectTrigger id="default-model">
              <SelectValue placeholder="Select a model">
                {ai.defaultModel ? getNickname(ai.defaultModel) : 'Select a model'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.model_id}>
                  {model.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Summary Model */}
      <div className="space-y-4">
        <h3 className="font-medium">Summary Model</h3>
        <div className="space-y-2">
          <Label htmlFor="summary-model">Model for generating conversation summaries</Label>
          <Select
            value={ai.summaryModel}
            onValueChange={(value) => setAIPreferences({ summaryModel: value })}
          >
            <SelectTrigger id="summary-model">
              <SelectValue placeholder="Select a model">
                {ai.summaryModel ? getNickname(ai.summaryModel) : 'Select a model'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.model_id}>
                  {model.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Used when transferring conversations to new sessions
          </p>
        </div>
      </div>

      <Separator />

      {/* Deep Reasoning */}
      <div className="space-y-4">
        <h3 className="font-medium">Advanced</h3>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="deep-reasoning">Deep Reasoning by Default</Label>
            <p className="text-xs text-muted-foreground">
              Enable extended thinking for complex problems
            </p>
          </div>
          <Switch
            id="deep-reasoning"
            checked={ai.deepReasoningDefault}
            onCheckedChange={(checked) => setAIPreferences({ deepReasoningDefault: checked })}
          />
        </div>
      </div>

      <Separator />

      {/* Quick Switch Info */}
      <div className="space-y-2">
        <h3 className="font-medium">Quick Switch (Mod+1-5)</h3>
        <p className="text-sm text-muted-foreground">
          First 5 models from your list for quick switching:
        </p>
        <ul className="space-y-1 text-sm">
          {models.slice(0, 5).map((model, index) => (
            <li key={model.id} className="flex items-center gap-2">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">
                {index + 1}
              </kbd>
              <span className="font-mono text-xs">{model.model_id}</span>
              <span className="text-muted-foreground">({model.nickname})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
