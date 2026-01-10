import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Sparkles,
  Code,
  Image,
  Brain,
  GripVertical,
  Zap,
  ZapOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useModelsStore } from '@/stores/modelsStore'
import { cn } from '@/lib/utils'
import type { AIModel, ModelType, CreateAIModelInput } from '@/types/models'

const MODEL_TYPE_ICONS: Record<ModelType, typeof Sparkles> = {
  general: Sparkles,
  coding: Code,
  image: Image,
  reasoning: Brain,
}

const MODEL_TYPE_LABELS: Record<ModelType, string> = {
  general: 'General',
  coding: 'Coding',
  image: 'Image',
  reasoning: 'Reasoning',
}

const EMPTY_FORM: CreateAIModelInput = {
  model_id: '',
  nickname: '',
  description: '',
  tags: [],
  favorite: false,
  model_type: 'general',
  supports_deep_reasoning: false,
  supports_streaming: true,
}

export function ModelsManager() {
  const { models, isLoading, error, initialized, fetchModels, createModel, updateModel, deleteModel, toggleFavorite } = useModelsStore()

  const [showDialog, setShowDialog] = useState(false)
  const [editingModel, setEditingModel] = useState<AIModel | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<AIModel | null>(null)
  const [form, setForm] = useState<CreateAIModelInput>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialized && !isLoading) {
      fetchModels()
    }
  }, [initialized, isLoading, fetchModels])

  const handleOpenCreate = () => {
    setEditingModel(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowDialog(true)
  }

  const handleOpenEdit = (model: AIModel) => {
    setEditingModel(model)
    setForm({
      model_id: model.model_id,
      nickname: model.nickname,
      description: model.description || '',
      tags: model.tags,
      favorite: model.favorite,
      model_type: model.model_type,
      supports_deep_reasoning: model.supports_deep_reasoning,
      supports_streaming: model.supports_streaming,
    })
    setFormError(null)
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!form.model_id.trim() || !form.nickname.trim()) {
      setFormError('Model ID and Nickname are required')
      return
    }

    try {
      if (editingModel) {
        await updateModel(editingModel.id, form)
      } else {
        await createModel(form)
      }
      setShowDialog(false)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save model')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteModel(deleteConfirm.id)
      setDeleteConfirm(null)
    } catch (e) {
      console.error('Failed to delete model:', e)
    }
  }

  const handleToggleFavorite = async (model: AIModel) => {
    try {
      await toggleFavorite(model.id)
    } catch (e) {
      console.error('Failed to toggle favorite:', e)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">AI Models</h3>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Add Model
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading && models.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Loading models...
        </div>
      ) : models.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No models configured. Add one to get started.
        </div>
      ) : (
        <div className="space-y-1">
          {models.map((model) => {
            const TypeIcon = MODEL_TYPE_ICONS[model.model_type] || Sparkles
            return (
              <div
                key={model.id}
                className="flex items-center gap-2 rounded-md border border-border bg-card/50 p-2"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <button
                  onClick={() => handleToggleFavorite(model)}
                  className="p-1 hover:bg-muted/50 rounded"
                >
                  <Star
                    className={cn(
                      'h-4 w-4 transition-colors',
                      model.favorite
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
                <TypeIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{model.nickname}</span>
                    {model.supports_streaming ? (
                      <span title="Supports streaming"><Zap className="h-3 w-3 text-green-500" /></span>
                    ) : (
                      <span title="No streaming"><ZapOff className="h-3 w-3 text-muted-foreground" /></span>
                    )}
                    {model.supports_deep_reasoning && (
                      <span title="Deep reasoning"><Brain className="h-3 w-3 text-purple-500" /></span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {model.model_id}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground px-2">
                  {MODEL_TYPE_LABELS[model.model_type]}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleOpenEdit(model)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteConfirm(model)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingModel ? 'Edit Model' : 'Add Model'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="model-id">Model ID (OpenRouter)</Label>
              <Input
                id="model-id"
                value={form.model_id}
                onChange={(e) => setForm({ ...form, model_id: e.target.value })}
                placeholder="anthropic/claude-sonnet-4"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Exact ID from OpenRouter (e.g., vendor/model-name)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                placeholder="Claude Sonnet 4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Fast and capable general-purpose model"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-type">Type</Label>
              <Select
                value={form.model_type}
                onValueChange={(value: ModelType) => setForm({ ...form, model_type: value })}
              >
                <SelectTrigger id="model-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="reasoning">Reasoning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Supports Streaming</Label>
                <p className="text-xs text-muted-foreground">Real-time response display</p>
              </div>
              <Switch
                checked={form.supports_streaming}
                onCheckedChange={(checked) => setForm({ ...form, supports_streaming: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Deep Reasoning</Label>
                <p className="text-xs text-muted-foreground">Extended thinking capability</p>
              </div>
              <Switch
                checked={form.supports_deep_reasoning}
                onCheckedChange={(checked) => setForm({ ...form, supports_deep_reasoning: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Favorite</Label>
                <p className="text-xs text-muted-foreground">Show at top of list</p>
              </div>
              <Switch
                checked={form.favorite}
                onCheckedChange={(checked) => setForm({ ...form, favorite: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingModel ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open: boolean) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.nickname}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
