import { useEffect, useCallback, useState } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Minimize2,
  Maximize2,
  Link2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  usePomodoroStore,
  formatTime,
  getPhaseDisplayName,
} from '@/stores/pomodoroStore'
import { useTaskStore } from '@/stores/taskStore'
import { cn } from '@/lib/utils'

export function PomodoroWidget() {
  const {
    status,
    phase,
    timeRemaining,
    sessionsCompleted,
    todaySessions,
    minimized,
    currentTaskId,
    currentTaskTitle,
    start,
    pause,
    resume,
    reset,
    skip,
    tick,
    setMinimized,
    linkTask,
    unlinkTask,
  } = usePomodoroStore()

  const { tasks } = useTaskStore()
  const [showTaskPicker, setShowTaskPicker] = useState(false)

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Timer tick effect
  useEffect(() => {
    if (status !== 'running') return

    const interval = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(interval)
  }, [status, tick])

  const handlePlayPause = useCallback(() => {
    if (status === 'idle') {
      start()
    } else if (status === 'running') {
      pause()
    } else {
      resume()
    }
  }, [status, start, pause, resume])

  // Phase colors
  const phaseColors = {
    work: 'bg-red-500/10 border-red-500/30 text-red-400',
    shortBreak: 'bg-green-500/10 border-green-500/30 text-green-400',
    longBreak: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  }

  const progressColors = {
    work: 'bg-red-500',
    shortBreak: 'bg-green-500',
    longBreak: 'bg-blue-500',
  }

  // Calculate progress percentage
  const totalTime =
    phase === 'work'
      ? 25 * 60
      : phase === 'shortBreak'
        ? 5 * 60
        : 15 * 60
  const progress = ((totalTime - timeRemaining) / totalTime) * 100

  if (minimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMinimized(false)}
          className={cn(
            'flex items-center gap-2 border',
            phaseColors[phase]
          )}
        >
          <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
          {status === 'running' && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
          )}
          <Maximize2 className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        className={cn(
          'w-64 rounded-lg border bg-background/95 shadow-lg backdrop-blur-sm',
          phaseColors[phase]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-inherit px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wide opacity-70">
            {getPhaseDisplayName(phase)}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-50">
              {todaySessions} today
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setMinimized(true)}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="px-3 py-4 text-center">
          <div className="font-mono text-4xl font-bold tracking-tight">
            {formatTime(timeRemaining)}
          </div>
          {/* Linked Task */}
          {currentTaskTitle ? (
            <div className="mt-1 flex items-center justify-center gap-1">
              <span className="truncate text-xs opacity-60 max-w-[180px]">
                {currentTaskTitle}
              </span>
              <button
                onClick={unlinkTask}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTaskPicker(!showTaskPicker)}
              className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link2 className="h-3 w-3" />
              Link task
            </button>
          )}
        </div>

        {/* Task Picker */}
        {showTaskPicker && !currentTaskId && tasks.length > 0 && (
          <div className="border-t border-inherit px-2 py-2 max-h-32 overflow-y-auto">
            {tasks.slice(0, 5).map((task) => (
              <button
                key={task.id}
                onClick={() => {
                  linkTask(task.id.toString(), task.title)
                  setShowTaskPicker(false)
                }}
                className="w-full truncate rounded px-2 py-1 text-left text-xs hover:bg-muted/50"
              >
                {task.title}
              </button>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="px-3 pb-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full transition-all duration-1000', progressColors[phase])}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-1 border-t border-inherit px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={reset}
            disabled={status === 'idle' && timeRemaining === totalTime}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={handlePlayPause}
          >
            {status === 'running' ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={skip}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Session Indicators */}
        <div className="flex justify-center gap-1 border-t border-inherit px-3 py-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-2 rounded-full',
                i < sessionsCompleted % 4
                  ? progressColors[phase]
                  : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PomodoroWidget
