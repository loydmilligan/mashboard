import { useEffect } from 'react'
import { Star, Image, Brain, ZapOff } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useModelsStore } from '@/stores/modelsStore'
import { cn } from '@/lib/utils'
import { getModelProvider, getCostTier } from '@/types/models'

interface ModelSelectorProps {
  value: string
  onChange: (model: string) => void
  disabled?: boolean
}

// Map provider names (from model_id) to icon filenames
const PROVIDER_ICON_MAP: Record<string, string> = {
  anthropic: 'anthropic',
  openai: 'openai',
  google: 'gemini',
  'google-vertex': 'gemini',
  deepseek: 'deepseek',
  mistralai: 'mistral',
  'x-ai': 'xai',
  minimax: 'minimax',
  'black-forest-labs': 'black_forest_labs',
}

// Fallback text badges for providers without icons
const PROVIDER_FALLBACK: Record<string, { abbr: string; color: string; bgColor: string }> = {
  'meta-llama': { abbr: 'M', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  cohere: { abbr: 'C', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  perplexity: { abbr: 'P', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  qwen: { abbr: 'Q', color: 'text-violet-600', bgColor: 'bg-violet-100' },
}

// Provider icon component for compact display
function ProviderBadge({ provider }: { provider: string }) {
  const iconName = PROVIDER_ICON_MAP[provider]

  if (iconName) {
    return (
      <img
        src={`/icons/providers/dark/${iconName}.svg`}
        alt={provider}
        title={provider}
        className="w-3.5 h-3.5"
      />
    )
  }

  // Fallback to text badge
  const fallback = PROVIDER_FALLBACK[provider] || {
    abbr: provider.slice(0, 2).toUpperCase(),
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-4 h-4 rounded text-[8px] font-bold',
        fallback.color,
        fallback.bgColor
      )}
      title={provider}
    >
      {fallback.abbr}
    </span>
  )
}

// Cost indicator for dropdown
function CostBadge({ tier }: { tier: '$' | '$$' | '$$$' | null }) {
  if (!tier) return null

  const colors = {
    '$': 'text-green-500',
    '$$': 'text-yellow-500',
    '$$$': 'text-red-500',
  }

  return (
    <span className={cn('text-[9px] font-medium', colors[tier])} title={`Cost: ${tier}`}>
      {tier}
    </span>
  )
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const { models, isLoading, initialized, fetchModels, getNickname } = useModelsStore()

  // Ensure models are loaded
  useEffect(() => {
    if (!initialized && !isLoading) {
      fetchModels()
    }
  }, [initialized, isLoading, fetchModels])

  // Get the display nickname and provider for current value
  const displayValue = value ? getNickname(value) : undefined
  const currentProvider = value ? getModelProvider(value) : undefined

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger className="h-8 w-full text-xs">
        <SelectValue placeholder={isLoading ? 'Loading...' : 'Select model'}>
          <div className="flex items-center gap-1.5">
            {currentProvider && <ProviderBadge provider={currentProvider} />}
            <span>{displayValue}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => {
          const provider = getModelProvider(model.model_id)
          const costTier = getCostTier(model.pricing_prompt, model.pricing_completion)
          const hasImageInput = model.input_modalities?.includes('image')

          return (
            <SelectItem key={model.id} value={model.model_id} className="text-xs">
              <div className="flex items-center gap-1.5">
                {model.favorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                <ProviderBadge provider={provider} />
                <span className="truncate">{model.nickname}</span>
                <CostBadge tier={costTier} />
                {hasImageInput && (
                  <span title="Vision"><Image className="h-3 w-3 text-blue-500" /></span>
                )}
                {model.supports_deep_reasoning && (
                  <span title="Reasoning"><Brain className="h-3 w-3 text-purple-500" /></span>
                )}
                {!model.supports_streaming && (
                  <span title="No streaming"><ZapOff className="h-2.5 w-2.5 text-muted-foreground" /></span>
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
