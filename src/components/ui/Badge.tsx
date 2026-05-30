interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-[#F5F5F7] text-[#6E6E73]',
    success: 'bg-[#34C759]/12 text-[#1a7a35]',
    warning: 'bg-[#FF9500]/12 text-[#b36a00]',
    danger: 'bg-[#FF3B30]/10 text-[#cc2e24]',
    info: 'bg-[#0066CC]/10 text-[#0055AA]',
    purple: 'bg-[#AF52DE]/12 text-[#7b3aa3]',
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-[13px] px-2.5 py-1',
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
