import Link from 'next/link'
import Badge, { getStatusBadgeVariant } from './ui/Badge'
import Card from './ui/Card'

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
    <Link href={`/projects/${project.id}`}>
      <Card hover className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-[#1D1D1F] truncate">{project.name}</h3>
            {project.client && (
              <p className="text-[13px] text-[#6E6E73] mt-0.5">{project.client.company || project.client.name}</p>
            )}
          </div>
          <Badge variant={getStatusBadgeVariant(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>

        {project.description && (
          <p className="text-[13px] text-[#6E6E73] line-clamp-2 mb-3">{project.description}</p>
        )}

        <div className="flex items-center gap-4 text-[13px] text-[#6E6E73]">
          <span className="font-medium text-[#1D1D1F]">
            {currency} {project.budget.toLocaleString()}
          </span>
          {deadlineDate && (
            <span className={isOverdue ? 'text-[#FF3B30] font-medium' : ''}>
              {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {isOverdue && ' · overdue'}
            </span>
          )}
          {project._count && (
            <span>{project._count.tasks} tasks</span>
          )}
        </div>
      </Card>
    </Link>
  )
}
