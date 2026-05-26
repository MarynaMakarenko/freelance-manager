'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { DollarSign, TrendingUp, FolderKanban, Users } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed']

interface OverviewData {
  activeProjects: number
  clientsCount: number
  expectedIncome: number
  hoursThisMonth: number
}

interface IncomeData {
  timeSeriesData: Array<{ date: string; total: number }>
  clientData: Array<{ name: string; total: number }>
}

interface ProjectDistribution {
  status: string
  count: number
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | '90days'>('monthly')

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => apiRequest<OverviewData>('/api/analytics/overview'),
  })

  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['analytics-income', period],
    queryFn: () => apiRequest<IncomeData>(`/api/analytics/income?period=${period}`),
  })

  const { data: projectDist = [], isLoading: distLoading } = useQuery({
    queryKey: ['analytics-projects'],
    queryFn: () => apiRequest<ProjectDistribution[]>('/api/analytics/projects'),
  })

  const pieData = projectDist.map((d) => ({
    name: STATUS_LABELS[d.status] || d.status,
    value: d.count,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Track your business performance over time</p>
      </div>

      {/* Summary cards */}
      {overviewLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title="Active Projects" value={overview?.activeProjects || 0} icon={<FolderKanban size={22} />} color="blue" />
          <StatsCard title="Total Clients" value={overview?.clientsCount || 0} icon={<Users size={22} />} color="purple" />
          <StatsCard title="Expected Income" value={`$${(overview?.expectedIncome || 0).toLocaleString()}`} icon={<DollarSign size={22} />} color="green" />
          <StatsCard title="Hours This Month" value={`${overview?.hoursThisMonth || 0}h`} icon={<TrendingUp size={22} />} color="yellow" />
        </div>
      )}

      {/* Income over time */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Income Over Time</h2>
          <div className="flex gap-2">
            {(['weekly', 'monthly', '90days'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  period === p
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p === 'weekly' ? '7 days' : p === 'monthly' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
        </div>

        {incomeLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (incomeData?.timeSeriesData?.length || 0) === 0 ? (
          <div className="flex justify-center items-center py-16 text-slate-400">
            <p>No income data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={incomeData?.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Income']}
                labelFormatter={(l) => new Date(l).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Income by client */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Income by Client</h2>
          {incomeLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (incomeData?.clientData?.length || 0) === 0 ? (
            <div className="flex justify-center items-center py-12 text-slate-400">
              <p>No client data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeData?.clientData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
                <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Income']} />
                <Bar dataKey="total" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Project status distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Project Status Distribution</h2>
          {distLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : pieData.length === 0 ? (
            <div className="flex justify-center items-center py-12 text-slate-400">
              <p>No projects yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  )
}
