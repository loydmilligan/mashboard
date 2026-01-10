import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

export function QuickLinksList() {
  const { linkGroups, toggleGroupCollapsed, addLink, addLinkGroup } = useWorkflowStore()
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null)
  const [newLinkName, setNewLinkName] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')

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
              {group.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 rounded px-2 py-1 text-sm',
                    'hover:bg-muted/50 hover:text-primary'
                  )}
                >
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  {link.name}
                </a>
              ))}

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
    </div>
  )
}
