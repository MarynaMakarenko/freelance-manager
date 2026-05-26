'use client'

import { useQuery } from '@tanstack/react-query'
import { FolderKanban, DollarSign, Clock, AlertCircle, Calendar } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import ProjectCard from '@/components/ProjectCard'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

interface OverviewData {
  activeProjects: number
  clientsCount: number
  expectedIncome: number
  hoursThisMonth: number
  upcomingDeadlines: Array<{
    id: string
    name: string
    deadline: string
    client?: { name: string } | null
    status: string
    budget: number
    description?: string | null
  }>
}

interface Project {
  id: string
  name: string
  description?: string | null
  budget: number
  status: string
  deadline?: string | null
  client?: { name: string; company?: string | null } | null
  _count?: { tasks: number }
}

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => apiRequest<OverviewData>('/api/analytics/overview'),
  })

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects-recent'],
    queryFn: () => apiRequest<Project[]>('/api/projects'),
  })

  const recentProjects = projects?.slice(0, 5) || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Your freelance business at a glance</p>
      </div>

      {/* Stats */}
      {overviewLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Active Projects"
            value={overview?.activeProjects || 0}
            icon={<FolderKanban size={22} />}
            color="blue"
          />
          <StatsCard
            title="Expected Income"
            value={`$${(overview?.expectedIncome || 0).toLocaleString()}`}
            icon={<DollarSign size={22} />}
            color="green"
            description="From sent & draft invoices"
          />
          <StatsCard
            title="Upcoming Deadlines"
            value={overview?.upcomingDeadlines.length || 0}
            icon={<AlertCircle size={22} />}
            color="yellow"
            description="Next 7 days"
          />
          <StatsCard
            title="Hours This Month"
            value={`${overview?.hoursThisMonth || 0}h`}
            icon={<Clock size={22} />}
            color="purple"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Projects</h2>
          </div>
          {projectsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FolderKanban size={40} className="mx-auto mb-3 opacity-30" />
              <p>No projects yet. Create your first project!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h2>
          </div>
          {overviewLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (overview?.upcomingDeadlines.length || 0) === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overview?.upcomingDeadlines.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{project.name}</p>
                      {project.client && (
                        <p className="text-xs text-slate-500 mt-0.5">{project.client.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-orange-600">
                        {new Date(project.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
