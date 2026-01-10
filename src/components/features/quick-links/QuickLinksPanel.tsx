import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  Copy,
  FolderOutput,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
import { useWorkflowStore } from '@/stores/workflowStore'
import type { QuickLink, LinkGroup } from '@/types/workflow'

interface LinkEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  link?: QuickLink | null
  onSave: (link: Omit<QuickLink, 'id'>) => void
}

function LinkEditor({ open, onOpenChange, link, onSave }: LinkEditorProps) {
  const [name, setName] = useState(link?.name || '')
  const [url, setUrl] = useState(link?.url || '')

  const handleSave = () => {
    if (name.trim() && url.trim()) {
      onSave({ name: name.trim(), url: url.trim() })
      onOpenChange(false)
      setName('')
      setUrl('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{link ? 'Edit Link' : 'Add Link'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="link-name">Name</Label>
            <Input
              id="link-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="GitHub"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !url.trim()}>
            {link ? 'Save' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface LinkGroupSectionProps {
  group: LinkGroup
  allGroups: LinkGroup[]
  onToggle: () => void
  onAddLink: () => void
  onEditLink: (link: QuickLink) => void
  onDeleteLink: (linkId: string) => void
  onMoveLink: (linkId: string, toGroupId: string) => void
}

function LinkGroupSection({
  group,
  allGroups,
  onToggle,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onMoveLink,
}: LinkGroupSectionProps) {
  const otherGroups = allGroups.filter((g) => g.id !== group.id)

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted/50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {group.collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{group.name}</span>
          <span className="text-xs text-muted-foreground">({group.links.length})</span>
        </div>
      </button>

      {/* Links */}
      {!group.collapsed && (
        <div className="border-t border-border px-2 py-2">
          {group.links.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">No links in this group</p>
          ) : (
            <ul className="space-y-1">
              {group.links.map((link) => (
                <ContextMenu key={link.id}>
                  <ContextMenuTrigger asChild>
                    <li className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted cursor-default">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center gap-2 text-sm hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        {link.name}
                      </a>
                    </li>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => onEditLink(link)}>
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
                              onClick={() => onMoveLink(link.id, g.id)}
                            >
                              {g.name}
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                    )}
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => onDeleteLink(link.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </ul>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-xs"
            onClick={onAddLink}
          >
            <Plus className="mr-2 h-3 w-3" />
            Add link
          </Button>
        </div>
      )}
    </div>
  )
}

export function QuickLinksPanel() {
  const { linkGroups, toggleGroupCollapsed, addLink, updateLink, deleteLink, addLinkGroup, moveLink } =
    useWorkflowStore()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)

  const handleAddLink = (groupId: string) => {
    setActiveGroupId(groupId)
    setEditingLink(null)
    setEditorOpen(true)
  }

  const handleEditLink = (groupId: string, link: QuickLink) => {
    setActiveGroupId(groupId)
    setEditingLink(link)
    setEditorOpen(true)
  }

  const handleSaveLink = (data: Omit<QuickLink, 'id'>) => {
    if (!activeGroupId) return

    if (editingLink) {
      updateLink(activeGroupId, editingLink.id, data)
    } else {
      addLink(activeGroupId, data)
    }
  }

  const handleDeleteLink = (groupId: string, linkId: string) => {
    deleteLink(groupId, linkId)
  }

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addLinkGroup(newGroupName.trim())
      setNewGroupName('')
      setShowNewGroup(false)
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">Quick Links</h2>
        <Button variant="outline" size="sm" onClick={() => setShowNewGroup(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Group
        </Button>
      </div>

      {/* New group input */}
      {showNewGroup && (
        <div className="mb-4 flex gap-2">
          <Input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
          />
          <Button size="sm" onClick={handleAddGroup} disabled={!newGroupName.trim()}>
            Add
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowNewGroup(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {linkGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            No link groups yet. Create one to organize your bookmarks.
          </p>
          <Button variant="default" size="sm" onClick={() => setShowNewGroup(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {linkGroups.map((group) => (
            <LinkGroupSection
              key={group.id}
              group={group}
              allGroups={linkGroups}
              onToggle={() => toggleGroupCollapsed(group.id)}
              onAddLink={() => handleAddLink(group.id)}
              onEditLink={(link) => handleEditLink(group.id, link)}
              onDeleteLink={(linkId) => handleDeleteLink(group.id, linkId)}
              onMoveLink={(linkId, toGroupId) => moveLink(group.id, linkId, toGroupId)}
            />
          ))}
        </div>
      )}

      <LinkEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        link={editingLink}
        onSave={handleSaveLink}
      />
    </section>
  )
}
