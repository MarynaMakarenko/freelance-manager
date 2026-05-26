'use client'

import { useEffect, useState } from 'react'
import { Square } from 'lucide-react'
import Button from './ui/Button'

interface ActiveSession {
  id: string
  startedAt: string
  task: {
    id: string
    name: string
    project: { id: string; name: string }
  }
}

interface TimerWidgetProps {
  activeSession: ActiveSession | null
  onStop: () => void
  isLoading?: boolean
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function TimerWidget({ activeSession, onStop, isLoading }: TimerWidgetProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!activeSession) {
      // reset asynchronously to avoid synchronous setState in effect warning
      const t = setTimeout(() => setElapsed(0), 0)
      return () => clearTimeout(t)
    }

    const start = new Date(activeSession.startedAt).getTime()
    const tick = () => {
      const now = Date.now()
      setElapsed(Math.floor((now - start) / 1000))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [activeSession])

  if (!activeSession) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="w-3 h-3 rounded-full bg-slate-300" />
        <span className="text-sm text-slate-500">No active timer</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        <div>
          <p className="text-sm font-semibold text-slate-900">{activeSession.task.name}</p>
          <p className="text-xs text-slate-500">{activeSession.task.project.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-2xl font-mono font-bold text-blue-700">{formatDuration(elapsed)}</span>
        <Button
          variant="danger"
          size="sm"
          onClick={onStop}
          loading={isLoading}
        >
          <Square size={14} />
          Stop
        </Button>
      </div>
    </div>
  )
}
