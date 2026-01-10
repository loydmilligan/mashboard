import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkflowStore } from '@/stores/workflowStore'
import { WorkflowCard } from './WorkflowCard'
import { WorkflowEditor } from './WorkflowEditor'
import type { Workflow } from '@/types/workflow'

export function WorkflowGrid() {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow, launchWorkflow } =
    useWorkflowStore()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow)
    setEditorOpen(true)
  }

  const handleNew = () => {
    setEditingWorkflow(null)
    setEditorOpen(true)
  }

  const handleSave = (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingWorkflow) {
      updateWorkflow(editingWorkflow.id, data)
    } else {
      addWorkflow(data)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(id)
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">Workflows</h2>
        <Button variant="outline" size="sm" onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            No workflows yet. Create one to launch multiple URLs at once.
          </p>
          <Button variant="default" size="sm" onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create Workflow
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onLaunch={() => launchWorkflow(workflow.id)}
              onEdit={() => handleEdit(workflow)}
              onDelete={() => handleDelete(workflow.id)}
            />
          ))}
        </div>
      )}

      <WorkflowEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        workflow={editingWorkflow}
        onSave={handleSave}
      />
    </section>
  )
}
