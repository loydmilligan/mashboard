import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  ExternalLink,
  X,
  Pencil,
  Copy,
  Trash2,
  FolderOutput,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'
import type { QuickLink } from '@/types/workflow'

export function QuickLinksList() {
  const { linkGroups, toggleGroupCollapsed, addLink, addLinkGroup, updateLink, deleteLink, moveLink } =
    useWorkflowStore()
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null)
  const [newLinkName, setNewLinkName] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [editingLink, setEditingLink] = useState<{ groupId: string; link: QuickLink } | null>(null)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')

  const handleEditLink = (groupId: string, link: QuickLink) => {
    setEditingLink({ groupId, link })
    setEditName(link.name)
    setEditUrl(link.url)
  }

  const handleSaveEdit = () => {
    if (editingLink && editName.trim() && editUrl.trim()) {
      updateLink(editingLink.groupId, editingLink.link.id, {
        name: editName.trim(),
        url: editUrl.trim(),
      })
      setEditingLink(null)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addLinkGroup(newGroupName.trim())
      setNewGroupName('')
      setShowNewGroup(false)
    }
  }

  const handleAddLink = (groupId: string) => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      addLink(groupId, { name: newLinkName.trim(), url: newLinkUrl.trim() })
      setNewLinkName('')
      setNewLinkUrl('')
      setAddingToGroup(null)
    }
  }

  return (
    <div className="space-y-1">
      {linkGroups.map((group) => (
        <div key={group.id} className="rounded-md border border-border bg-card/50">
          <button
            className="flex w-full items-center gap-1 px-2 py-1.5 text-left text-sm hover:bg-muted/50"
            onClick={() => toggleGroupCollapsed(group.id)}
          >
            {group.collapsed ? (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            )}
            <span className="flex-1 font-medium">{group.name}</span>
            <span className="text-xs text-muted-foreground">{group.links.length}</span>
          </button>

          {!group.collapsed && (
            <div className="border-t border-border px-1 py-1">
              {group.links.map((link) => {
                const otherGroups = linkGroups.filter((g) => g.id !== group.id)
                return (
                  <ContextMenu key={link.id}>
                    <ContextMenuTrigger asChild>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-2 rounded px-2 py-1 text-sm',
                          'hover:bg-muted/50 hover:text-primary cursor-default'
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        {link.name}
                      </a>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem onClick={() => handleEditLink(group.id, link)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => window.open(link.url, '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in New Tab
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCopyUrl(link.url)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy URL
                      </ContextMenuItem>
                      {otherGroups.length > 0 && (
                        <ContextMenuSub>
                          <ContextMenuSubTrigger>
                            <FolderOutput className="mr-2 h-4 w-4" />
                            Move to...
                          </ContextMenuSubTrigger>
                          <ContextMenuSubContent className="w-40">
                            {otherGroups.map((g) => (
                              <ContextMenuItem
                                key={g.id}
                                onClick={() => moveLink(group.id, link.id, g.id)}
                              >
                                {g.name}
                              </ContextMenuItem>
                            ))}
                          </ContextMenuSubContent>
                        </ContextMenuSub>
                      )}
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => deleteLink(group.id, link.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })}

              {addingToGroup === group.id ? (
                <div className="space-y-1 p-1">
                  <Input
                    placeholder="Name"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <Input
                    placeholder="URL"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="h-7 text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLink(group.id)}
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-6 flex-1 text-xs"
                      onClick={() => handleAddLink(group.id)}
                      disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6"
                      onClick={() => {
                        setAddingToGroup(null)
                        setNewLinkName('')
                        setNewLinkUrl('')
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-full justify-start text-xs text-muted-foreground"
                  onClick={() => setAddingToGroup(group.id)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add link
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      {showNewGroup ? (
        <div className="flex gap-1 p-1">
          <Input
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="h-7 flex-1 text-xs"
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
          />
          <Button size="sm" className="h-7" onClick={handleAddGroup} disabled={!newGroupName.trim()}>
            Add
          </Button>
          <Button variant="ghost" size="sm" className="h-7" onClick={() => setShowNewGroup(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setShowNewGroup(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Group
        </Button>
      )}

      {/* Edit Link Dialog */}
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-link-name">Name</Label>
              <Input
                id="edit-link-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Link name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-link-url">URL</Label>
              <Input
                id="edit-link-url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLink(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim() || !editUrl.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
