import { useEffect } from 'react'
import { Star, Sparkles, Code, Image, Brain } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useModelsStore } from '@/stores/modelsStore'
import { cn } from '@/lib/utils'
import type { ModelType } from '@/types/models'

interface ModelSelectorProps {
  value: string
  onChange: (model: string) => void
  disabled?: boolean
}

const MODEL_TYPE_ICONS: Record<ModelType, typeof Sparkles> = {
  general: Sparkles,
  coding: Code,
  image: Image,
  reasoning: Brain,
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const { models, isLoading, initialized, fetchModels, getNickname } = useModelsStore()

  // Ensure models are loaded
  useEffect(() => {
    if (!initialized && !isLoading) {
      fetchModels()
    }
  }, [initialized, isLoading, fetchModels])

  // Get the display nickname for current value
  const displayValue = value ? getNickname(value) : undefined

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger className="h-8 w-full text-xs">
        <SelectValue placeholder={isLoading ? 'Loading...' : 'Select model'}>
          {displayValue}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => {
          const TypeIcon = MODEL_TYPE_ICONS[model.model_type] || Sparkles
          return (
            <SelectItem key={model.id} value={model.model_id} className="text-xs">
              <div className="flex items-center gap-2">
                {model.favorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                <TypeIcon className={cn('h-3 w-3', model.favorite ? '' : 'text-muted-foreground')} />
                <span>{model.nickname}</span>
                {!model.supports_streaming && (
                  <span className="text-[10px] text-muted-foreground">(no stream)</span>
                )}
              </div>
            </SelectItem>
          )
        })}
        {models.length === 0 && !isLoading && (
          <SelectItem value="" disabled className="text-xs text-muted-foreground">
            No models configured
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
