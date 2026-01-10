import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Workflow } from '@/types/workflow'
import { WORKFLOW_COLORS, WORKFLOW_ICONS } from '@/types/workflow'

interface WorkflowEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow?: Workflow | null
  onSave: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function WorkflowEditor({ open, onOpenChange, workflow, onSave }: WorkflowEditorProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('layers')
  const [color, setColor] = useState('#3b82f6')
  const [urls, setUrls] = useState<string[]>([''])

  // Reset form when workflow changes
  useEffect(() => {
    if (workflow) {
      setName(workflow.name)
      setDescription(workflow.description || '')
      setIcon(workflow.icon || 'layers')
      setColor(workflow.color || '#3b82f6')
      setUrls(workflow.urls.length > 0 ? workflow.urls : [''])
    } else {
      setName('')
      setDescription('')
      setIcon('layers')
      setColor('#3b82f6')
      setUrls([''])
    }
  }, [workflow, open])

  const handleAddUrl = () => {
    setUrls([...urls, ''])
  }

  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index))
  }

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  const handleSave = () => {
    const validUrls = urls.filter((url) => url.trim() !== '')
    if (name.trim() && validUrls.length > 0) {
      onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        urls: validUrls,
      })
      onOpenChange(false)
    }
  }

  const isValid = name.trim() && urls.some((url) => url.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{workflow ? 'Edit Workflow' : 'New Workflow'}</DialogTitle>
          <DialogDescription>
            {workflow
              ? 'Update your workflow details and URLs.'
              : 'Create a workflow to launch multiple URLs at once.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Morning Routine"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Start the day"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {WORKFLOW_COLORS.map((c) => (
                <button
                  key={c}
                  className={cn(
                    'h-8 w-8 rounded-full transition-transform hover:scale-110',
                    color === c && 'ring-2 ring-offset-2 ring-offset-background'
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-1">
              {WORKFLOW_ICONS.map((i) => (
                <button
                  key={i}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md border transition-colors',
                    icon === i
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  )}
                  onClick={() => setIcon(i)}
                >
                  <span className="text-xs capitalize">{i.slice(0, 2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-2">
            <Label>URLs</Label>
            <div className="space-y-2">
              {urls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1"
                  />
                  {urls.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveUrl(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddUrl}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add URL
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {workflow ? 'Save Changes' : 'Create Workflow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
