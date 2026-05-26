import Link from 'next/link'
import Badge, { getStatusBadgeVariant } from './ui/Badge'
import Card from './ui/Card'
import { Calendar, DollarSign, User } from 'lucide-react'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string | null
    budget: number
    status: string
    deadline?: string | Date | null
    client?: { name: string; company?: string | null } | null
    _count?: { tasks: number }
  }
  currency?: string
}

export default function ProjectCard({ project, currency = 'USD' }: ProjectCardProps) {
  const deadlineDate = project.deadline ? new Date(project.deadline) : null
  const isOverdue = deadlineDate && deadlineDate < new Date() && project.status !== 'COMPLETED'

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{project.description}</p>
            )}
          </div>
          <Badge variant={getStatusBadgeVariant(project.status)} className="ml-2 flex-shrink-0">
            {project.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="space-y-2">
          {project.client && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{project.client.company || project.client.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign size={14} className="text-slate-400 flex-shrink-0" />
            <span>
              {currency} {project.budget.toLocaleString()}
            </span>
          </div>
          {deadlineDate && (
            <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
              <Calendar size={14} className="flex-shrink-0" />
              <span>{deadlineDate.toLocaleDateString()}</span>
              {isOverdue && <span className="text-xs text-red-500">(overdue)</span>}
            </div>
          )}
        </div>

        {project._count && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">{project._count.tasks} tasks</span>
          </div>
        )}
      </Card>
    </Link>
  )
}
