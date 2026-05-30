'use client'

import { useQuery } from '@tanstack/react-query'
import { FolderKanban, DollarSign, Clock, AlertCircle, Calendar } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import ProjectCard from '@/components/ProjectCard'
import Spinner from '@/components/ui/Spinner'
import Card from '@/components/ui/Card'
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
        <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">Overview</h1>
        <p className="text-[15px] text-[#6E6E73] mt-1">Your freelance business at a glance</p>
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
            <h2 className="text-[17px] font-semibold text-[#1D1D1F]">Recent Projects</h2>
          </div>
          {projectsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban size={40} className="mx-auto mb-3 text-[#AEAEB2]" />
              <p className="text-[14px] text-[#6E6E73]">No projects yet. Create your first project!</p>
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
            <h2 className="text-[17px] font-semibold text-[#1D1D1F]">Upcoming Deadlines</h2>
          </div>
          {overviewLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (overview?.upcomingDeadlines.length || 0) === 0 ? (
            <div className="text-center py-12">
              <Calendar size={40} className="mx-auto mb-3 text-[#AEAEB2]" />
              <p className="text-[14px] text-[#6E6E73]">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overview?.upcomingDeadlines.map((project) => (
                <Card key={project.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[14px] font-medium text-[#1D1D1F]">{project.name}</p>
                      {project.client && (
                        <p className="text-[12px] text-[#6E6E73] mt-0.5">{project.client.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-medium text-[#FF9500]">
                        {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
