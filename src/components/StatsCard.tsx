import Card from './ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendPositive?: boolean
  description?: string
  color?: 'blue' | 'green' | 'yellow' | 'purple'
}

const iconColors = {
  blue: 'text-[#0066CC]',
  green: 'text-[#34C759]',
  yellow: 'text-[#FF9500]',
  purple: 'text-[#AF52DE]',
}

export default function StatsCard({ title, value, icon, trend, trendPositive, description, color = 'blue' }: StatsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <span className={`${iconColors[color]}`}>{icon}</span>
      </div>
      <p className="text-[28px] font-bold text-[#1D1D1F] leading-none tracking-tight mb-1">{value}</p>
      <p className="text-[13px] font-medium text-[#6E6E73]">{title}</p>
      {trend && (
        <p className={`text-[12px] mt-1 font-medium ${trendPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
          {trend}
        </p>
      )}
      {description && !trend && (
        <p className="text-[12px] text-[#AEAEB2] mt-0.5">{description}</p>
      )}
    </Card>
  )
}
