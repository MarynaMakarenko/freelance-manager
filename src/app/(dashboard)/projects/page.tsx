'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, FolderKanban, Archive } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ProjectCard from '@/components/ProjectCard'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  description?: string | null
  budget: number
  status: string
  deadline?: string | null
  isArchived: boolean
  client?: { id: string; name: string; company?: string | null } | null
  _count?: { tasks: number }
}

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  clientId: z.string().optional(),
  budget: z.number({ invalid_type_error: 'Must be a number' }).min(0).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiRequest<Client[]>('/api/clients'),
  })

  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (showArchived) params.set('archived', 'true')
    if (statusFilter) params.set('status', statusFilter)
    if (clientFilter) params.set('clientId', clientFilter)
    if (search) params.set('search', search)
    return params.toString()
  }

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', showArchived, statusFilter, clientFilter, search],
    queryFn: () => apiRequest<Project[]>(`/api/projects?${buildQueryString()}`),
  })

  const createMutation = useMutation({
    mutationFn: (data: ProjectFormData) =>
      apiRequest<Project>('/api/projects', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setIsCreateOpen(false)
      reset()
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: 'ACTIVE', budget: 0 },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">{projects.length} {showArchived ? 'archived' : 'active'} projects</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
            showArchived ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Archive size={16} />
          {showArchived ? 'Showing Archived' : 'Show Archived'}
        </button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FolderKanban size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-slate-600">No projects found</p>
          <p className="text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Project" size="lg">
        <form onSubmit={handleSubmit(async (data) => { await createMutation.mutateAsync(data) })} className="space-y-4">
          <Input label="Project Name *" placeholder="Website Redesign" error={errors.name?.message} {...register('name')} />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} placeholder="Project description..." {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" {...register('clientId')}>
                <option value="">No client</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" {...register('status')}>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Budget ($)" type="number" min="0" step="0.01" error={errors.budget?.message} {...register('budget', { valueAsNumber: true })} />
            <Input label="Deadline" type="date" error={errors.deadline?.message} {...register('deadline')} />
          </div>

          {createMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{createMutation.error?.message}</p>
            </div>
          )}

          <Button type="submit" loading={isSubmitting || createMutation.isPending} className="w-full">
            Create Project
          </Button>
        </form>
      </Modal>
    </div>
  )
}
