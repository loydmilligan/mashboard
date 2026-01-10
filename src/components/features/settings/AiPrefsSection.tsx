import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useSettingsStore } from '@/stores/settingsStore'

const DEFAULT_MODELS = [
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'openai/o1-preview', name: 'o1 Preview' },
  { id: 'openai/o1-mini', name: 'o1 Mini' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash' },
  { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
]

const DEFAULT_SUMMARY_MODELS = [
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Fast)' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Fast)' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash (Fast)' },
]

function parseCustomModels(customModels: string): { id: string; name: string }[] {
  if (!customModels.trim()) return []

  // Support both newline and comma separation
  const models = customModels
    .split(/[\n,]/)
    .map((m) => m.trim())
    .filter((m) => m.length > 0)

  return models.map((id) => {
    // Extract a display name from the model ID (e.g., "anthropic/claude-3" -> "claude-3")
    const parts = id.split('/')
    const name = parts[parts.length - 1] || id
    return { id, name }
  })
}

export function AiPrefsSection() {
  const { ai, setAIPreferences } = useSettingsStore()

  // Use custom models if provided, otherwise use defaults
  const availableModels = useMemo(() => {
    const custom = parseCustomModels(ai.customModels || '')
    return custom.length > 0 ? custom : DEFAULT_MODELS
  }, [ai.customModels])

  // For summary, combine custom with default summary models
  const summaryModels = useMemo(() => {
    const custom = parseCustomModels(ai.customModels || '')
    return custom.length > 0 ? custom : DEFAULT_SUMMARY_MODELS
  }, [ai.customModels])

  return (
    <div className="space-y-6">
      {/* Custom Models Configuration */}
      <div className="space-y-4">
        <h3 className="font-medium">Available Models</h3>
        <div className="space-y-2">
          <Label htmlFor="custom-models">Custom model list (one per line or comma-separated)</Label>
          <Textarea
            id="custom-models"
            placeholder={`Leave empty for defaults, or enter model IDs:\nanthropic/claude-sonnet-4\nopenai/gpt-4o\ngoogle/gemini-2.0-flash`}
            value={ai.customModels || ''}
            onChange={(e) => setAIPreferences({ customModels: e.target.value })}
            className="font-mono text-sm"
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available
            {!ai.customModels?.trim() && ' (using defaults)'}
          </p>
        </div>
      </div>

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
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
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
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {summaryModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
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

      {/* Favorite Models Info */}
      <div className="space-y-2">
        <h3 className="font-medium">Quick Switch (Mod+1-5)</h3>
        <p className="text-sm text-muted-foreground">
          First 5 models from your list for quick switching:
        </p>
        <ul className="space-y-1 text-sm">
          {availableModels.slice(0, 5).map((model, index) => (
            <li key={model.id} className="flex items-center gap-2">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">
                {index + 1}
              </kbd>
              <span className="font-mono text-xs">{model.id}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
