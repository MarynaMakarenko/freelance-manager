interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
