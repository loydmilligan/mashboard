import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Workflow, LinkGroup, QuickLink } from '@/types/workflow'
import { DEFAULT_WORKFLOWS, DEFAULT_LINK_GROUPS } from '@/types/workflow'
import { STORAGE_KEYS } from '@/lib/constants'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface WorkflowState {
  workflows: Workflow[]
  linkGroups: LinkGroup[]

  // Workflow actions
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateWorkflow: (id: string, updates: Partial<Omit<Workflow, 'id' | 'createdAt'>>) => void
  deleteWorkflow: (id: string) => void
  launchWorkflow: (id: string) => void
  reorderWorkflows: (workflowIds: string[]) => void

  // Link group actions
  addLinkGroup: (name: string) => void
  updateLinkGroup: (id: string, updates: Partial<Omit<LinkGroup, 'id'>>) => void
  deleteLinkGroup: (id: string) => void
  toggleGroupCollapsed: (id: string) => void

  // Link actions
  addLink: (groupId: string, link: Omit<QuickLink, 'id'>) => void
  updateLink: (groupId: string, linkId: string, updates: Partial<Omit<QuickLink, 'id'>>) => void
  deleteLink: (groupId: string, linkId: string) => void
  moveLink: (fromGroupId: string, linkId: string, toGroupId: string) => void

  // Reset
  resetToDefaults: () => void
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: DEFAULT_WORKFLOWS,
      linkGroups: DEFAULT_LINK_GROUPS,

      addWorkflow: (workflow) => {
        const newWorkflow: Workflow = {
          ...workflow,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({
          workflows: [...state.workflows, newWorkflow],
        }))
      },

      updateWorkflow: (id, updates) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: Date.now() } : w
          ),
        }))
      },

      deleteWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
        }))
      },

      launchWorkflow: (id) => {
        const workflow = get().workflows.find((w) => w.id === id)
        if (workflow) {
          workflow.urls.forEach((url) => {
            window.open(url, '_blank', 'noopener,noreferrer')
          })
        }
      },

      reorderWorkflows: (workflowIds) => {
        set((state) => {
          const workflowMap = new Map(state.workflows.map((w) => [w.id, w]))
          const reordered = workflowIds
            .map((id) => workflowMap.get(id))
            .filter((w): w is Workflow => w !== undefined)
          return { workflows: reordered }
        })
      },

      addLinkGroup: (name) => {
        const newGroup: LinkGroup = {
          id: generateId(),
          name,
          links: [],
        }
        set((state) => ({
          linkGroups: [...state.linkGroups, newGroup],
        }))
      },

      updateLinkGroup: (id, updates) => {
        set((state) => ({
          linkGroups: state.linkGroups.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }))
      },

      deleteLinkGroup: (id) => {
        set((state) => ({
          linkGroups: state.linkGroups.filter((g) => g.id !== id),
        }))
      },

      toggleGroupCollapsed: (id) => {
        set((state) => ({
          linkGroups: state.linkGroups.map((g) =>
            g.id === id ? { ...g, collapsed: !g.collapsed } : g
          ),
        }))
      },

      addLink: (groupId, link) => {
        const newLink: QuickLink = {
          ...link,
          id: generateId(),
        }
        set((state) => ({
          linkGroups: state.linkGroups.map((g) =>
            g.id === groupId ? { ...g, links: [...g.links, newLink] } : g
          ),
        }))
      },

      updateLink: (groupId, linkId, updates) => {
        set((state) => ({
          linkGroups: state.linkGroups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  links: g.links.map((l) =>
                    l.id === linkId ? { ...l, ...updates } : l
                  ),
                }
              : g
          ),
        }))
      },

      deleteLink: (groupId, linkId) => {
        set((state) => ({
          linkGroups: state.linkGroups.map((g) =>
            g.id === groupId
              ? { ...g, links: g.links.filter((l) => l.id !== linkId) }
              : g
          ),
        }))
      },

      moveLink: (fromGroupId, linkId, toGroupId) => {
        if (fromGroupId === toGroupId) return

        set((state) => {
          const fromGroup = state.linkGroups.find((g) => g.id === fromGroupId)
          const link = fromGroup?.links.find((l) => l.id === linkId)
          if (!link) return state

          return {
            linkGroups: state.linkGroups.map((g) => {
              if (g.id === fromGroupId) {
                return { ...g, links: g.links.filter((l) => l.id !== linkId) }
              }
              if (g.id === toGroupId) {
                return { ...g, links: [...g.links, link] }
              }
              return g
            }),
          }
        })
      },

      resetToDefaults: () => {
        set({
          workflows: DEFAULT_WORKFLOWS,
          linkGroups: DEFAULT_LINK_GROUPS,
        })
      },
    }),
    {
      name: STORAGE_KEYS.WORKFLOWS,
    }
  )
)
