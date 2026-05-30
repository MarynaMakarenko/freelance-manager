'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Play, CheckCircle, Clock, FileText } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Badge, { getStatusBadgeVariant } from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

interface TimeSession {
  id: string
  duration?: number | null
  startedAt: string
  endedAt?: string | null
}

interface Task {
  id: string
  name: string
  description?: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  timeSessions: TimeSession[]
}

interface InvoiceItem {
  amount: number
}

interface Invoice {
  id: string
  number: string
  status: string
  items: InvoiceItem[]
  createdAt: string
}

interface Project {
  id: string
  name: string
  description?: string | null
  budget: number
  status: string
  deadline?: string | null
  notes?: string | null
  isArchived: boolean
  client?: { name: string; company?: string | null; email?: string | null } | null
  tasks: Task[]
  invoices: Invoice[]
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [taskName, setTaskName] = useState('')
  const [taskDesc, setTaskDesc] = useState('')

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', params.id],
    queryFn: () => apiRequest<Project>(`/api/projects/${params.id}`),
  })

  const addTaskMutation = useMutation({
    mutationFn: (data: { name: string; description: string; projectId: string }) =>
      apiRequest('/api/tasks', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', params.id] })
      setIsAddTaskOpen(false)
      setTaskName('')
      setTaskDesc('')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/api/tasks/${id}`, { method: 'PUT', body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', params.id] }),
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', params.id] }),
  })

  const startTimerMutation = useMutation({
    mutationFn: (taskId: string) => apiRequest('/api/timer/start', { method: 'POST', body: { taskId } }),
    onSuccess: () => router.push('/timer'),
  })

  const archiveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/projects/${params.id}`, { method: 'PUT', body: { isArchived: !project?.isArchived } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', params.id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/projects/${params.id}`, { method: 'DELETE' }),
    onSuccess: () => router.push('/projects'),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-[14px] text-[#6E6E73]">Project not found</p>
        <Link href="/projects" className="text-[#0066CC] hover:underline mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    )
  }

  const totalTimeSeconds = project.tasks.reduce((sum, task) => {
    return sum + task.timeSessions.reduce((s, ts) => s + (ts.duration || 0), 0)
  }, 0)

  const tasksByStatus = {
    TODO: project.tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: project.tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: project.tasks.filter((t) => t.status === 'DONE'),
  }

  const statusCycle: Record<string, 'TODO' | 'IN_PROGRESS' | 'DONE'> = {
    TODO: 'IN_PROGRESS',
    IN_PROGRESS: 'DONE',
    DONE: 'TODO',
  }

  const handleDeleteProject = () => {
    if (confirm(`Delete project "${project.name}"? All tasks and time sessions will be deleted.`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/projects"
            className="p-2 rounded-[8px] text-[#AEAEB2] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors mt-1"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">{project.name}</h1>
              <Badge variant={getStatusBadgeVariant(project.status)} size="md">
                {project.status.replace('_', ' ')}
              </Badge>
              {project.isArchived && <Badge variant="warning">Archived</Badge>}
            </div>
            {project.client && (
              <p className="text-[15px] text-[#6E6E73] mt-1">
                {project.client.company || project.client.name}
              </p>
            )}
            {project.description && (
              <p className="text-[14px] text-[#6E6E73] mt-2 max-w-2xl">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => archiveMutation.mutate()}
            loading={archiveMutation.isPending}
          >
            {project.isArchived ? 'Unarchive' : 'Archive'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteProject}
            loading={deleteMutation.isPending}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-black/[0.06] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] p-4">
          <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider mb-1">Budget</p>
          <p className="text-[18px] font-bold text-[#1D1D1F]">${project.budget.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-black/[0.06] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] p-4">
          <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider mb-1">Deadline</p>
          <p className="text-[18px] font-bold text-[#1D1D1F]">
            {project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}
          </p>
        </div>
        <div className="bg-white border border-black/[0.06] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] p-4">
          <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider mb-1">Time Tracked</p>
          <p className="text-[18px] font-bold text-[#1D1D1F]">
            {totalTimeSeconds > 0 ? formatDuration(totalTimeSeconds) : '—'}
          </p>
        </div>
        <div className="bg-white border border-black/[0.06] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] p-4">
          <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider mb-1">Tasks</p>
          <p className="text-[18px] font-bold text-[#1D1D1F]">{project.tasks.length}</p>
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F]">Tasks</h2>
          <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
            <Plus size={14} />
            Add Task
          </Button>
        </div>

        {project.tasks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-black/[0.08] rounded-xl">
            <CheckCircle size={32} className="mx-auto mb-2 text-[#AEAEB2] opacity-30" />
            <p className="text-[14px] text-[#6E6E73]">No tasks yet. Add your first task.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((status) => {
              const statusTasks = tasksByStatus[status]
              if (statusTasks.length === 0) return null
              return (
                <div key={status}>
                  <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider mb-2">
                    {status.replace('_', ' ')} ({statusTasks.length})
                  </p>
                  <div className="space-y-2">
                    {statusTasks.map((task) => {
                      const taskTime = task.timeSessions.reduce((s, ts) => s + (ts.duration || 0), 0)
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 bg-white border border-black/[0.06] rounded-xl px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                        >
                          <button
                            onClick={() => updateTaskMutation.mutate({ id: task.id, status: statusCycle[task.status] })}
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.status === 'DONE'
                                ? 'border-[#34C759] bg-[#34C759] text-white'
                                : task.status === 'IN_PROGRESS'
                                ? 'border-[#0066CC] bg-[#0066CC]/10'
                                : 'border-black/[0.2] hover:border-[#0066CC]'
                            }`}
                          >
                            {task.status === 'DONE' && <CheckCircle size={12} />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[14px] font-medium ${task.status === 'DONE' ? 'line-through text-[#AEAEB2]' : 'text-[#1D1D1F]'}`}>
                              {task.name}
                            </p>
                            {task.description && (
                              <p className="text-[12px] text-[#6E6E73] truncate">{task.description}</p>
                            )}
                          </div>
                          {taskTime > 0 && (
                            <div className="flex items-center gap-1 text-[12px] text-[#6E6E73]">
                              <Clock size={12} />
                              {formatDuration(taskTime)}
                            </div>
                          )}
                          <button
                            onClick={() => startTimerMutation.mutate(task.id)}
                            disabled={startTimerMutation.isPending}
                            className="p-1.5 text-[#AEAEB2] hover:text-[#34C759] hover:bg-[#34C759]/8 rounded-[8px] transition-colors"
                            title="Start timer"
                          >
                            <Play size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this task?')) deleteTaskMutation.mutate(task.id)
                            }}
                            className="p-1.5 text-[#AEAEB2] hover:text-[#FF3B30] hover:bg-[#FF3B30]/8 rounded-[8px] transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Invoices */}
      {project.invoices.length > 0 && (
        <div>
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">Linked Invoices</h2>
          <div className="space-y-2">
            {project.invoices.map((invoice) => {
              const total = invoice.items.reduce((s, i) => s + i.amount, 0)
              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between bg-white border border-black/[0.06] rounded-xl px-4 py-3 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-[#AEAEB2]" />
                    <span className="text-[14px] font-medium text-[#1D1D1F]">#{invoice.number}</span>
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                  </div>
                  <span className="text-[14px] font-medium text-[#1D1D1F]">${total.toFixed(2)}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} title="Add Task">
        <div className="space-y-4">
          <Input
            label="Task Name *"
            placeholder="Design mockups"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Description</label>
            <textarea
              className="w-full bg-[#F5F5F7] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1D1D1F] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0066CC]/30 transition-all resize-none"
              rows={3}
              placeholder="Optional description..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            loading={addTaskMutation.isPending}
            disabled={!taskName.trim()}
            onClick={() => addTaskMutation.mutate({ name: taskName, description: taskDesc, projectId: project.id })}
          >
            Add Task
          </Button>
        </div>
      </Modal>
    </div>
  )
}
