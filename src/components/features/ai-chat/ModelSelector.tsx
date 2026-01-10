import { useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettingsStore } from '@/stores/settingsStore'
import { AVAILABLE_MODELS } from '@/types/chat'

interface ModelSelectorProps {
  value: string
  onChange: (model: string) => void
  disabled?: boolean
}

function parseCustomModels(customModels: string): { id: string; name: string }[] {
  if (!customModels.trim()) return []

  const models = customModels
    .split(/[\n,]/)
    .map((m) => m.trim())
    .filter((m) => m.length > 0)

  return models.map((id) => {
    const parts = id.split('/')
    const name = parts[parts.length - 1] || id
    return { id, name }
  })
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const { ai } = useSettingsStore()

  const availableModels = useMemo(() => {
    const custom = parseCustomModels(ai.customModels || '')
    return custom.length > 0 ? custom : AVAILABLE_MODELS
  }, [ai.customModels])

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-full text-xs">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {availableModels.map((model) => (
          <SelectItem key={model.id} value={model.id} className="text-xs">
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
