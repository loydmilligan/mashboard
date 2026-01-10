import { useEffect, useCallback, useState, useRef } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Link2,
  X,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  usePomodoroStore,
  formatTime,
  getPhaseDisplayName,
} from '@/stores/pomodoroStore'
import { useTaskStore } from '@/stores/taskStore'
import { cn } from '@/lib/utils'
import { SHORTCUTS, getShortcutDisplay } from '@/lib/keyboardShortcuts'

interface HeaderPomodoroProps {
  expanded: boolean
  onToggle: () => void
}

export function HeaderPomodoro({ expanded, onToggle }: HeaderPomodoroProps) {
  const {
    status,
    phase,
    timeRemaining,
    sessionsCompleted,
    todaySessions,
    currentTaskId,
    currentTaskTitle,
    start,
    pause,
    resume,
    reset,
    skip,
    tick,
    linkTask,
    unlinkTask,
  } = usePomodoroStore()

  const { tasks } = useTaskStore()
  const [showTaskPicker, setShowTaskPicker] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (expanded) onToggle()
      }
    }

    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [expanded, onToggle])

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
    work: {
      bg: 'bg-red-500/15',
      border: 'border-red-500/40',
      text: 'text-red-400',
      progress: 'bg-red-500',
      hoverBg: 'hover:bg-red-500/25',
    },
    shortBreak: {
      bg: 'bg-green-500/15',
      border: 'border-green-500/40',
      text: 'text-green-400',
      progress: 'bg-green-500',
      hoverBg: 'hover:bg-green-500/25',
    },
    longBreak: {
      bg: 'bg-blue-500/15',
      border: 'border-blue-500/40',
      text: 'text-blue-400',
      progress: 'bg-blue-500',
      hoverBg: 'hover:bg-blue-500/25',
    },
  }

  const colors = phaseColors[phase]

  // Calculate progress percentage
  const totalTime =
    phase === 'work'
      ? 25 * 60
      : phase === 'shortBreak'
        ? 5 * 60
        : 15 * 60
  const progress = ((totalTime - timeRemaining) / totalTime) * 100

  const shortcutDisplay = getShortcutDisplay(SHORTCUTS.POMODORO)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Header Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 border transition-all',
          colors.bg,
          colors.border,
          colors.text,
          colors.hoverBg,
          'px-2 h-8'
        )}
        title={`Pomodoro Timer (${shortcutDisplay})`}
      >
        <Timer className="h-4 w-4" />
        <span className="font-mono text-sm font-medium">
          {formatTime(timeRemaining)}
        </span>
        {status === 'running' && (
          <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
        )}
        <span className="hidden sm:inline text-[10px] opacity-50 ml-1 font-sans">
          {shortcutDisplay}
        </span>
      </Button>

      {/* Expanded Dropdown */}
      {expanded && (
        <div
          className={cn(
            'absolute top-full left-0 mt-2 w-72 rounded-lg border shadow-lg backdrop-blur-sm z-50',
            colors.bg,
            colors.border,
            'bg-background/95'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-inherit px-3 py-2">
            <span className={cn('text-xs font-medium uppercase tracking-wide', colors.text)}>
              {getPhaseDisplayName(phase)}
            </span>
            <span className="text-xs text-muted-foreground">
              {todaySessions} today
            </span>
          </div>

          {/* Timer Display */}
          <div className="px-3 py-4 text-center">
            <div className={cn('font-mono text-4xl font-bold tracking-tight', colors.text)}>
              {formatTime(timeRemaining)}
            </div>
            {/* Linked Task */}
            {currentTaskTitle ? (
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="truncate text-xs text-muted-foreground max-w-[200px]">
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
                className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto"
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
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full transition-all duration-1000', colors.progress)}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 border-t border-inherit px-3 py-3">
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-9 w-9', colors.hoverBg)}
              onClick={reset}
              disabled={status === 'idle' && timeRemaining === totalTime}
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={cn('h-11 w-11', colors.border, colors.hoverBg)}
              onClick={handlePlayPause}
              title={status === 'running' ? 'Pause' : 'Start'}
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
              className={cn('h-9 w-9', colors.hoverBg)}
              onClick={skip}
              title="Skip"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Session Indicators */}
          <div className="flex justify-center gap-1.5 border-t border-inherit px-3 py-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-colors',
                  i < sessionsCompleted % 4
                    ? colors.progress
                    : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HeaderPomodoro
