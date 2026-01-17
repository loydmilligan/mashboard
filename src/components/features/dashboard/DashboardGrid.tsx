import { ChevronDown, ChevronRight, CheckSquare, FileText, Target, Server, Newspaper } from 'lucide-react'
import { ServerStatusWidget } from './widgets/ServerStatusWidget'
import { TaskWidget } from '@/components/features/tasks/TaskWidget'
import { HabitWidget } from '@/components/features/habits/HabitWidget'
import { NotesWidget } from '@/components/features/notes/NotesWidget'
import { BriefingWidget } from '@/components/features/better-brain/BriefingWidget'
import { useLayoutStore, type DashboardWidgetId } from '@/stores/layoutStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/lib/utils'

interface CollapsibleWidgetProps {
  id: DashboardWidgetId
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function CollapsibleWidget({ id, title, icon, children }: CollapsibleWidgetProps) {
  const { dashboardWidgets, toggleDashboardWidget } = useLayoutStore()
  const collapsed = dashboardWidgets[id]?.collapsed ?? false

  if (collapsed) {
    // Collapsed: show minimal header
    return (
      <button
        onClick={() => toggleDashboardWidget(id)}
        className={cn(
          'flex w-full items-center gap-2 px-4 py-2.5 rounded-lg border bg-card',
          'text-sm font-medium text-muted-foreground',
          'hover:bg-muted/50 hover:text-foreground',
          'transition-colors'
        )}
      >
        <ChevronRight className="h-4 w-4" />
        {icon}
        <span>{title}</span>
      </button>
    )
  }

  // Expanded: show full widget with collapse button overlay
  return (
    <div className="relative">
      <button
        onClick={() => toggleDashboardWidget(id)}
        className="absolute left-2 top-2.5 z-10 p-0.5 rounded hover:bg-muted/50 transition-colors"
        title={`Collapse ${title}`}
      >
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {children}
    </div>
  )
}

export function DashboardGrid() {
  const { servicesEnabled } = useSettingsStore()

  return (
    <div className="space-y-2">
      <CollapsibleWidget id="tasks" title="Tasks" icon={<CheckSquare className="h-4 w-4" />}>
        <TaskWidget />
      </CollapsibleWidget>

      <CollapsibleWidget id="notes" title="Notes" icon={<FileText className="h-4 w-4" />}>
        <NotesWidget />
      </CollapsibleWidget>

      <CollapsibleWidget id="habits" title="Habits" icon={<Target className="h-4 w-4" />}>
        <HabitWidget />
      </CollapsibleWidget>

      {servicesEnabled.betterBrain && (
        <CollapsibleWidget id="briefing" title="Daily Briefing" icon={<Newspaper className="h-4 w-4" />}>
          <BriefingWidget />
        </CollapsibleWidget>
      )}

      <CollapsibleWidget id="serverStatus" title="Server Status" icon={<Server className="h-4 w-4" />}>
        <ServerStatusWidget />
      </CollapsibleWidget>
    </div>
  )
}
