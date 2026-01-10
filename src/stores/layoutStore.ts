import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'

interface LeftPanelSection {
  collapsed: boolean
}

export type DashboardWidgetId = 'tasks' | 'notes' | 'habits' | 'serverStatus'

interface LayoutState {
  // Split position as percentage (0.4 = 40%)
  splitPosition: number

  // Left panel section states
  leftPanelSections: {
    tools: LeftPanelSection
    quickLinks: LeftPanelSection
    dashboard: LeftPanelSection
  }

  // Dashboard widget collapse states
  dashboardWidgets: Record<DashboardWidgetId, { collapsed: boolean }>

  // Actions
  setSplitPosition: (position: number) => void
  toggleSection: (section: 'tools' | 'quickLinks' | 'dashboard') => void
  toggleDashboardWidget: (widgetId: DashboardWidgetId) => void
  resetLayout: () => void
}

const DEFAULT_SPLIT_POSITION = 0.4 // 40% left, 60% right

const defaultSections = {
  tools: { collapsed: false },
  quickLinks: { collapsed: false },
  dashboard: { collapsed: false },
}

const defaultDashboardWidgets: Record<DashboardWidgetId, { collapsed: boolean }> = {
  tasks: { collapsed: false },
  notes: { collapsed: false },
  habits: { collapsed: false },
  serverStatus: { collapsed: false },
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      splitPosition: DEFAULT_SPLIT_POSITION,
      leftPanelSections: defaultSections,
      dashboardWidgets: defaultDashboardWidgets,

      setSplitPosition: (position) => {
        // Clamp between 20% and 60%
        const clamped = Math.min(Math.max(position, 0.2), 0.6)
        set({ splitPosition: clamped })
      },

      toggleSection: (section) => {
        set((state) => ({
          leftPanelSections: {
            ...state.leftPanelSections,
            [section]: {
              collapsed: !state.leftPanelSections[section].collapsed,
            },
          },
        }))
      },

      toggleDashboardWidget: (widgetId) => {
        set((state) => ({
          dashboardWidgets: {
            ...state.dashboardWidgets,
            [widgetId]: {
              collapsed: !state.dashboardWidgets[widgetId].collapsed,
            },
          },
        }))
      },

      resetLayout: () => {
        set({
          splitPosition: DEFAULT_SPLIT_POSITION,
          leftPanelSections: defaultSections,
          dashboardWidgets: defaultDashboardWidgets,
        })
      },
    }),
    {
      name: STORAGE_KEYS.LAYOUT || 'mashb0ard-layout',
    }
  )
)
