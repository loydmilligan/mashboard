import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS, POMODORO } from '@/lib/constants'

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'
export type PomodoroStatus = 'idle' | 'running' | 'paused'

interface PomodoroState {
  // Timer state
  status: PomodoroStatus
  phase: PomodoroPhase
  timeRemaining: number
  sessionsCompleted: number

  // Current task (optional link)
  currentTaskId?: string
  currentTaskTitle?: string

  // History (local cache, syncs with API)
  todaySessions: number

  // Settings
  minimized: boolean

  // Actions
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  skip: () => void
  tick: () => void
  setMinimized: (minimized: boolean) => void
  linkTask: (taskId: string, taskTitle: string) => void
  unlinkTask: () => void
  completeSession: () => void
}

function getNextPhase(
  currentPhase: PomodoroPhase,
  sessionsCompleted: number
): PomodoroPhase {
  if (currentPhase === 'work') {
    // After work, take a break
    if ((sessionsCompleted + 1) % POMODORO.SESSIONS_BEFORE_LONG_BREAK === 0) {
      return 'longBreak'
    }
    return 'shortBreak'
  }
  // After any break, go back to work
  return 'work'
}

function getPhaseDuration(phase: PomodoroPhase): number {
  switch (phase) {
    case 'work':
      return POMODORO.WORK_DURATION
    case 'shortBreak':
      return POMODORO.SHORT_BREAK
    case 'longBreak':
      return POMODORO.LONG_BREAK
  }
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      // Initial state
      status: 'idle',
      phase: 'work',
      timeRemaining: POMODORO.WORK_DURATION,
      sessionsCompleted: 0,
      currentTaskId: undefined,
      currentTaskTitle: undefined,
      todaySessions: 0,
      minimized: false,

      // Actions
      start: () => {
        set({ status: 'running' })
      },

      pause: () => {
        set({ status: 'paused' })
      },

      resume: () => {
        set({ status: 'running' })
      },

      reset: () => {
        const { phase } = get()
        set({
          status: 'idle',
          timeRemaining: getPhaseDuration(phase),
        })
      },

      skip: () => {
        const { phase, sessionsCompleted } = get()
        const nextPhase = getNextPhase(phase, sessionsCompleted)
        set({
          status: 'idle',
          phase: nextPhase,
          timeRemaining: getPhaseDuration(nextPhase),
        })
      },

      tick: () => {
        const { timeRemaining, status } = get()
        if (status !== 'running') return

        if (timeRemaining <= 1) {
          // Timer completed
          get().completeSession()
        } else {
          set({ timeRemaining: timeRemaining - 1 })
        }
      },

      setMinimized: (minimized) => {
        set({ minimized })
      },

      linkTask: (taskId, taskTitle) => {
        set({ currentTaskId: taskId, currentTaskTitle: taskTitle })
      },

      unlinkTask: () => {
        set({ currentTaskId: undefined, currentTaskTitle: undefined })
      },

      completeSession: () => {
        const { phase, sessionsCompleted } = get()
        const nextPhase = getNextPhase(phase, sessionsCompleted)
        const newSessionsCompleted =
          phase === 'work' ? sessionsCompleted + 1 : sessionsCompleted

        // Send browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const title =
            phase === 'work' ? 'Pomodoro Complete!' : 'Break Over!'
          const body =
            phase === 'work'
              ? `Time for a ${nextPhase === 'longBreak' ? 'long' : 'short'} break!`
              : 'Ready to focus again?'
          new Notification(title, { body, icon: '/favicon.ico' })
        }

        set({
          status: 'idle',
          phase: nextPhase,
          timeRemaining: getPhaseDuration(nextPhase),
          sessionsCompleted: newSessionsCompleted,
          todaySessions:
            phase === 'work' ? get().todaySessions + 1 : get().todaySessions,
        })
      },
    }),
    {
      name: STORAGE_KEYS.POMODORO,
      partialize: (state) => ({
        // Persist these values across sessions
        sessionsCompleted: state.sessionsCompleted,
        todaySessions: state.todaySessions,
        minimized: state.minimized,
        // Don't persist running state - always start fresh
      }),
    }
  )
)

// Helper hook to format time
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Helper to get phase display name
export function getPhaseDisplayName(phase: PomodoroPhase): string {
  switch (phase) {
    case 'work':
      return 'Focus'
    case 'shortBreak':
      return 'Short Break'
    case 'longBreak':
      return 'Long Break'
  }
}
