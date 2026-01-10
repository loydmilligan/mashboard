// Habits API service - connects to mashboard-api

export interface Habit {
  id: number
  name: string
  description: string | null
  frequency: 'daily' | 'weekly'
  target_days: number[] // 0-6, where 0 is Sunday
  color: string
  icon: string | null
  archived: boolean
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: number
  habit_id: number
  completed_at: string
  notes: string | null
  created_at: string
  habit_name?: string
  habit_color?: string
}

export interface HabitStreak {
  current: number
  longest: number
  totalCompletions: number
}

export interface CreateHabitInput {
  name: string
  description?: string
  frequency?: 'daily' | 'weekly'
  target_days?: number[]
  color?: string
  icon?: string
}

export interface UpdateHabitInput {
  name?: string
  description?: string
  frequency?: 'daily' | 'weekly'
  target_days?: number[]
  color?: string
  icon?: string
  archived?: boolean
}

class HabitsService {
  private get baseUrl(): string {
    // Use the proxy path for the mashboard API
    return '/api/mashboard'
  }

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    }
  }

  // ==========================================================================
  // HABITS
  // ==========================================================================

  async getHabits(includeArchived = false): Promise<Habit[]> {
    const url = `${this.baseUrl}/habits${includeArchived ? '?includeArchived=true' : ''}`
    const response = await fetch(url, { headers: this.headers })

    if (!response.ok) {
      throw new Error(`Failed to fetch habits: ${response.statusText}`)
    }

    return response.json()
  }

  async createHabit(input: CreateHabitInput): Promise<Habit> {
    const response = await fetch(`${this.baseUrl}/habits`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error(`Failed to create habit: ${response.statusText}`)
    }

    return response.json()
  }

  async updateHabit(id: number, input: UpdateHabitInput): Promise<Habit> {
    const response = await fetch(`${this.baseUrl}/habits/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error(`Failed to update habit: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteHabit(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/habits/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to delete habit: ${response.statusText}`)
    }
  }

  // ==========================================================================
  // COMPLETIONS
  // ==========================================================================

  async getCompletions(params?: {
    start?: string
    end?: string
    habit_id?: number
  }): Promise<HabitCompletion[]> {
    const searchParams = new URLSearchParams()
    if (params?.start) searchParams.set('start', params.start)
    if (params?.end) searchParams.set('end', params.end)
    if (params?.habit_id) searchParams.set('habit_id', params.habit_id.toString())

    const url = `${this.baseUrl}/habits/completions${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await fetch(url, { headers: this.headers })

    if (!response.ok) {
      throw new Error(`Failed to fetch completions: ${response.statusText}`)
    }

    return response.json()
  }

  async completeHabit(id: number, date?: string, notes?: string): Promise<HabitCompletion> {
    const response = await fetch(`${this.baseUrl}/habits/${id}/complete`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ date, notes }),
    })

    if (!response.ok) {
      throw new Error(`Failed to complete habit: ${response.statusText}`)
    }

    return response.json()
  }

  async uncompleteHabit(id: number, date?: string): Promise<void> {
    const url = `${this.baseUrl}/habits/${id}/complete${date ? '?date=' + date : ''}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to uncomplete habit: ${response.statusText}`)
    }
  }

  async getStreak(id: number): Promise<HabitStreak> {
    const response = await fetch(`${this.baseUrl}/habits/${id}/streak`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch streak: ${response.statusText}`)
    }

    return response.json()
  }
}

export const habitsService = new HabitsService()
