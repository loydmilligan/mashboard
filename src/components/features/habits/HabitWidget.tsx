import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Plus,
  RefreshCw,
  AlertCircle,
  Flame,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useHabitStore,
  shouldShowHabitToday,
  getHabitProgress,
  HABIT_COLORS,
  DAY_NAMES,
} from '@/stores/habitStore'
import { cn } from '@/lib/utils'

export function HabitWidget() {
  const {
    habits,
    todayCompletions,
    isLoading,
    error,
    addHabitOpen,
    fetchHabits,
    fetchTodayCompletions,
    createHabit,
    toggleHabit,
    deleteHabit,
    setAddHabitOpen,
    clearError,
  } = useHabitStore()

  const [newHabitName, setNewHabitName] = useState('')
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0])
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch habits on mount
  useEffect(() => {
    fetchHabits()
    fetchTodayCompletions()
  }, [fetchHabits, fetchTodayCompletions])

  // Filter to today's habits
  const todayHabits = habits.filter(shouldShowHabitToday)
  const progress = getHabitProgress(habits, todayCompletions)

  // Handle add habit submit
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    setIsSubmitting(true)
    try {
      await createHabit({
        name: newHabitName.trim(),
        color: selectedColor,
        target_days: selectedDays,
        frequency: selectedDays.length === 7 ? 'daily' : 'weekly',
      })
      setNewHabitName('')
      setSelectedColor(HABIT_COLORS[0])
      setSelectedDays([0, 1, 2, 3, 4, 5, 6])
    } catch {
      // Error handled in store
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b pl-8 pr-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Habits</h3>
          {progress.total > 0 && (
            <span className="text-xs text-muted-foreground">
              {progress.completed}/{progress.total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              fetchHabits()
              fetchTodayCompletions()
            }}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setAddHabitOpen(!addHabitOpen)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {progress.total > 0 && (
        <div className="px-4 py-2 border-b">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Habit Form */}
      {addHabitOpen && (
        <form onSubmit={handleAddHabit} className="border-b px-4 py-3 space-y-3">
          <Input
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="New habit name..."
            className="h-8 text-sm"
            autoFocus
            disabled={isSubmitting}
          />

          {/* Color Picker */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">Color:</span>
            {HABIT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'h-5 w-5 rounded-full transition-transform',
                  selectedColor === color && 'ring-2 ring-offset-2 ring-offset-background scale-110'
                )}
                style={{
                  backgroundColor: color,
                  '--tw-ring-color': color,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Day Selector */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">Days:</span>
            {DAY_NAMES.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  'h-6 w-6 rounded text-xs font-medium transition-colors',
                  selectedDays.includes(i)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {name[0]}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAddHabitOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!newHabitName.trim() || selectedDays.length === 0 || isSubmitting}
            >
              Add Habit
            </Button>
          </div>
        </form>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="flex-1">{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Habit List */}
      <div className="max-h-[300px] overflow-y-auto">
        {todayHabits.length === 0 && !isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {habits.length === 0
              ? 'No habits yet. Click + to add one.'
              : 'No habits scheduled for today.'}
          </div>
        ) : (
          <ul className="divide-y">
            {todayHabits.map((habit) => {
              const isCompleted = todayCompletions.has(habit.id)
              return (
                <li
                  key={habit.id}
                  className="group flex items-center gap-3 px-4 py-2 hover:bg-muted/50"
                >
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className="shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2
                        className="h-5 w-5"
                        style={{ color: habit.color }}
                      />
                    ) : (
                      <Circle
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        style={{ borderColor: habit.color }}
                      />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm',
                        isCompleted && 'text-muted-foreground line-through'
                      )}
                    >
                      {habit.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteHabit(habit.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Streak/Stats Footer */}
      {progress.total > 0 && progress.completed === progress.total && (
        <div className="border-t px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-medium">All habits complete!</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default HabitWidget
