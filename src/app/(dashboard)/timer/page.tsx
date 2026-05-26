'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Clock } from 'lucide-react'
import TimerWidget from '@/components/TimerWidget'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

interface Project {
  id: string
  name: string
  tasks: Array<{ id: string; name: string }>
}

interface ActiveSession {
  id: string
  startedAt: string
  task: {
    id: string
    name: string
    project: { id: string; name: string }
  }
}

interface TimeSession {
  id: string
  startedAt: string
  endedAt?: string | null
  duration?: number | null
  task: {
    id: string
    name: string
    project: { id: string; name: string }
  }
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function TimerPage() {
  const queryClient = useQueryClient()
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-with-tasks'],
    queryFn: async () => {
      const projs = await apiRequest<Array<{ id: string; name: string }>>('/api/projects')
      const withTasks = await Promise.all(
        projs.slice(0, 20).map(async (p) => {
          try {
            const tasks = await apiRequest<Array<{ id: string; name: string }>>(`/api/tasks?projectId=${p.id}`)
            return { ...p, tasks }
          } catch {
            return { ...p, tasks: [] }
          }
        })
      )
      return withTasks.filter((p) => p.tasks.length > 0)
    },
  })

  const { data: activeSession, isLoading: activeLoading } = useQuery({
    queryKey: ['active-session'],
    queryFn: () => apiRequest<ActiveSession | null>('/api/timer/active'),
    refetchInterval: 5000,
  })

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => apiRequest<TimeSession[]>('/api/timer/sessions'),
  })

  const startMutation = useMutation({
    mutationFn: (taskId: string) =>
      apiRequest('/api/timer/start', { method: 'POST', body: { taskId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const stopMutation = useMutation({
    mutationFn: () => apiRequest('/api/timer/stop', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/timer/sessions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })

  const selectedProject = (projects as Project[]).find((p) => p.id === selectedProjectId)
  const availableTasks = selectedProject?.tasks || []

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId)
    setSelectedTaskId('')
  }

  const handleStart = () => {
    if (selectedTaskId) {
      startMutation.mutate(selectedTaskId)
    }
  }

  const completedSessions = sessions.filter((s) => s.endedAt)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Time Tracker</h1>
        <p className="text-slate-500 mt-1">Track time spent on your projects and tasks</p>
      </div>

      {/* Active timer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Timer</h2>

        {activeLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : activeSession ? (
          <TimerWidget
            activeSession={activeSession}
            onStop={() => stopMutation.mutate()}
            isLoading={stopMutation.isPending}
          />
        ) : (
          <div className="space-y-4">
            <TimerWidget activeSession={null} onStop={() => {}} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select project...</option>
                  {(projects as Project[]).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  disabled={!selectedProjectId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50"
                >
                  <option value="">Select task...</option>
                  {availableTasks.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={handleStart}
              disabled={!selectedTaskId}
              loading={startMutation.isPending}
              className="w-full"
              size="lg"
            >
              <Clock size={18} />
              Start Timer
            </Button>

            {startMutation.isError && (
              <p className="text-sm text-red-600">{startMutation.error?.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Session History */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Session History</h2>

        {sessionsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : completedSessions.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p>No completed sessions yet</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Task</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Duration</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{session.task.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{session.task.project.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(session.startedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-blue-700">
                        {formatDuration(session.duration)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          if (confirm('Delete this session?')) deleteMutation.mutate(session.id)
                        }}
                        className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
