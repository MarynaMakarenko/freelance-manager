interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export default function Card({ children, className = '', onClick, hover }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] ${
        onClick || hover ? 'cursor-pointer transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)] hover:border-black/10' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
