import { WorkflowGrid } from '@/components/features/workflows/WorkflowGrid'
import { QuickLinksPanel } from '@/components/features/quick-links/QuickLinksPanel'
import { PinnedNotesGrid } from '@/components/features/pinned-notes/PinnedNotesGrid'
import { ServerStatusGrid } from '@/components/features/server-status/ServerStatusGrid'

export function MainContent() {
  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Workflows section */}
        <WorkflowGrid />

        {/* Pinned Notes section */}
        <PinnedNotesGrid />

        {/* Two-column grid for Server Status and Quick Links */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Server Status section */}
          <ServerStatusGrid />

          {/* Quick Links section */}
          <QuickLinksPanel />
        </div>
      </div>
    </main>
  )
}
