import { create } from 'zustand'
import { habitsService } from '@/services/habits'
import type { Habit, CreateHabitInput } from '@/services/habits'

interface HabitState {
  // Data
  habits: Habit[]
  todayCompletions: Set<number> // Set of habit IDs completed today

  // UI state
  isLoading: boolean
  error: string | null
  addHabitOpen: boolean

  // Actions
  fetchHabits: () => Promise<void>
  fetchTodayCompletions: () => Promise<void>
  createHabit: (input: CreateHabitInput) => Promise<Habit>
  toggleHabit: (habitId: number) => Promise<void>
  deleteHabit: (habitId: number) => Promise<void>
  archiveHabit: (habitId: number) => Promise<void>
  setAddHabitOpen: (open: boolean) => void
  clearError: () => void
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export const useHabitStore = create<HabitState>()((set, get) => ({
  // Initial state
  habits: [],
  todayCompletions: new Set(),
  isLoading: false,
  error: null,
  addHabitOpen: false,

  // Actions
  fetchHabits: async () => {
    set({ isLoading: true, error: null })
    try {
      const habits = await habitsService.getHabits()
      set({ habits, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch habits',
        isLoading: false,
      })
    }
  },

  fetchTodayCompletions: async () => {
    try {
      const today = getTodayString()
      const completions = await habitsService.getCompletions({
        start: today,
        end: today,
      })
      const completedIds = new Set(completions.map((c) => c.habit_id))
      set({ todayCompletions: completedIds })
    } catch (error) {
      console.error('Failed to fetch today completions:', error)
    }
  },

  createHabit: async (input) => {
    set({ isLoading: true, error: null })
    try {
      const habit = await habitsService.createHabit(input)
      set((state) => ({
        habits: [habit, ...state.habits],
        isLoading: false,
        addHabitOpen: false,
      }))
      return habit
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create habit',
        isLoading: false,
      })
      throw error
    }
  },

  toggleHabit: async (habitId) => {
    const { todayCompletions } = get()
    const isCompleted = todayCompletions.has(habitId)

    // Optimistic update
    const newCompletions = new Set(todayCompletions)
    if (isCompleted) {
      newCompletions.delete(habitId)
    } else {
      newCompletions.add(habitId)
    }
    set({ todayCompletions: newCompletions })

    try {
      if (isCompleted) {
        await habitsService.uncompleteHabit(habitId)
      } else {
        await habitsService.completeHabit(habitId)
      }
    } catch (error) {
      // Revert on error
      set({ todayCompletions })
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle habit',
      })
    }
  },

  deleteHabit: async (habitId) => {
    try {
      await habitsService.deleteHabit(habitId)
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== habitId),
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete habit',
      })
    }
  },

  archiveHabit: async (habitId) => {
    try {
      await habitsService.updateHabit(habitId, { archived: true })
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== habitId),
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to archive habit',
      })
    }
  },

  setAddHabitOpen: (open) => {
    set({ addHabitOpen: open })
  },

  clearError: () => {
    set({ error: null })
  },
}))

// Helper functions
export function shouldShowHabitToday(habit: Habit): boolean {
  const today = new Date().getDay() // 0-6
  return habit.target_days.includes(today)
}

export function getHabitProgress(
  habits: Habit[],
  completions: Set<number>
): { completed: number; total: number; percentage: number } {
  const todayHabits = habits.filter(shouldShowHabitToday)
  const completed = todayHabits.filter((h) => completions.has(h.id)).length
  const total = todayHabits.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  return { completed, total, percentage }
}

export const HABIT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
]

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
