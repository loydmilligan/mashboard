import { ChevronDown, ChevronRight, Zap, Link, LayoutDashboard } from 'lucide-react'
import { useLayoutStore } from '@/stores/layoutStore'
import { cn } from '@/lib/utils'
import { ToolsList } from '@/components/features/tools/ToolsList'
import { QuickLinksList } from '@/components/features/quick-links/QuickLinksList'
import { DashboardGrid } from '@/components/features/dashboard/DashboardGrid'

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  collapsed: boolean
  onToggle: () => void
  children: React.ReactNode
  className?: string
}

function CollapsibleSection({
  title,
  icon,
  collapsed,
  onToggle,
  children,
  className,
}: CollapsibleSectionProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'text-sm font-medium text-muted-foreground',
          'hover:bg-muted/50 hover:text-foreground',
          'transition-colors'
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        {icon}
        <span>{title}</span>
      </button>
      {!collapsed && (
        <div className="flex-1 overflow-auto px-2 pb-2">
          {children}
        </div>
      )}
    </div>
  )
}

export function LeftPanel() {
  const { leftPanelSections, toggleSection } = useLayoutStore()

  return (
    <div className="flex h-full flex-col border-r border-border bg-background">
      {/* Tools Section */}
      <CollapsibleSection
        title="Tools"
        icon={<Zap className="h-4 w-4" />}
        collapsed={leftPanelSections.tools.collapsed}
        onToggle={() => toggleSection('tools')}
        className="border-b border-border"
      >
        <ToolsList />
      </CollapsibleSection>

      {/* Quick Links Section */}
      <CollapsibleSection
        title="Quick Links"
        icon={<Link className="h-4 w-4" />}
        collapsed={leftPanelSections.quickLinks.collapsed}
        onToggle={() => toggleSection('quickLinks')}
        className="border-b border-border"
      >
        <QuickLinksList />
      </CollapsibleSection>

      {/* Dashboard Section */}
      <CollapsibleSection
        title="Dashboard"
        icon={<LayoutDashboard className="h-4 w-4" />}
        collapsed={leftPanelSections.dashboard.collapsed}
        onToggle={() => toggleSection('dashboard')}
        className="flex-1"
      >
        <DashboardGrid />
      </CollapsibleSection>
    </div>
  )
}
