interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  )
}

export function getStatusBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
    ACTIVE: 'info',
    COMPLETED: 'success',
    ON_HOLD: 'warning',
    CANCELLED: 'danger',
    TODO: 'default',
    IN_PROGRESS: 'info',
    DONE: 'success',
    DRAFT: 'default',
    SENT: 'info',
    PAID: 'success',
    OVERDUE: 'danger',
  }
  return map[status] || 'default'
}
