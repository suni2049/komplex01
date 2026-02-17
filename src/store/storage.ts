import { getDB, type UserSettings } from './db'
import type { WorkoutHistoryEntry, WorkoutPlan, WeekPlanConfig } from '../types/workout'
import type { Equipment } from '../types/exercise'

// === Workout History ===

export async function saveWorkout(entry: WorkoutHistoryEntry): Promise<void> {
  const db = await getDB()
  await db.put('workoutHistory', entry)
}

export async function getWorkoutHistory(): Promise<WorkoutHistoryEntry[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('workoutHistory', 'by-date')
  return all.reverse()
}

export async function getWorkoutById(id: string): Promise<WorkoutHistoryEntry | undefined> {
  const db = await getDB()
  return db.get('workoutHistory', id)
}

export async function deleteWorkout(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('workoutHistory', id)
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const db = await getDB()
  const entry = await db.get('workoutHistory', id)
  if (!entry) return false
  entry.isFavorite = !entry.isFavorite
  await db.put('workoutHistory', entry)
  return entry.isFavorite
}

export async function renameWorkout(id: string, name: string): Promise<void> {
  const db = await getDB()
  const entry = await db.get('workoutHistory', id)
  if (!entry) return
  entry.name = name || undefined
  await db.put('workoutHistory', entry)
}

export async function getFavorites(): Promise<WorkoutHistoryEntry[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('workoutHistory', 'by-date')
  return all.filter(e => e.isFavorite).reverse()
}

export async function clearHistory(): Promise<void> {
  const db = await getDB()
  await db.clear('workoutHistory')
}

// === Settings ===

const DEFAULT_SETTINGS: UserSettings = {
  id: 'settings',
  equipment: ['none', 'push-up-bars'] as Equipment[],
  defaultDifficulty: 'intermediate',
  defaultDurationMinutes: 60,
  accentColor: 'signal-red',
  soundEnabled: true,
  exerciseGrouping: 'circuit',
  enableAICoach: false,
  groqApiKey: undefined,
}

export async function getSettings(): Promise<UserSettings> {
  const db = await getDB()
  const settings = await db.get('userSettings', 'settings')
  return settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS
}

export async function updateSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
  const db = await getDB()
  const current = await getSettings()
  const updated = { ...current, ...partial, id: 'settings' }
  await db.put('userSettings', updated)
  return updated
}

// === Workout Plans ===

export async function saveWorkoutPlan(plan: WorkoutPlan): Promise<void> {
  const db = await getDB()
  await db.put('workoutPlans', plan)
}

export async function saveWeekPlanConfig(config: WeekPlanConfig): Promise<void> {
  const db = await getDB()
  await db.put('weekPlanConfigs', config)
}

export async function getWeekPlan(planId: string): Promise<WorkoutPlan[]> {
  const db = await getDB()
  const plans = await db.getAllFromIndex('workoutPlans', 'by-plan-id', planId)
  return plans.sort((a, b) => a.dayOfWeek - b.dayOfWeek)
}

export async function getActiveWeekPlan(): Promise<WorkoutPlan[] | null> {
  const db = await getDB()
  const allPlans = await db.getAll('workoutPlans')
  if (allPlans.length === 0) return null

  // Group by planId, return most recent incomplete plan
  const planGroups = new Map<string, WorkoutPlan[]>()
  allPlans.forEach(plan => {
    if (!planGroups.has(plan.planId)) planGroups.set(plan.planId, [])
    planGroups.get(plan.planId)!.push(plan)
  })

  for (const [_, plans] of planGroups) {
    const hasIncomplete = plans.some(p => !p.isCompleted)
    if (hasIncomplete) {
      return plans.sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    }
  }

  return null
}

export async function markPlanWorkoutComplete(
  _planId: string,
  dayId: string,
  historyId: string
): Promise<void> {
  const db = await getDB()
  const plan = await db.get('workoutPlans', dayId)
  if (plan) {
    plan.isCompleted = true
    plan.completedAt = new Date().toISOString()
    plan.completedWorkoutHistoryId = historyId
    await db.put('workoutPlans', plan)
  }
}

export async function deleteWeekPlan(planId: string): Promise<void> {
  const db = await getDB()
  const plans = await db.getAllFromIndex('workoutPlans', 'by-plan-id', planId)
  for (const plan of plans) {
    await db.delete('workoutPlans', plan.id)
  }
  await db.delete('weekPlanConfigs', planId)
}

export async function getAllWeekPlanConfigs(): Promise<WeekPlanConfig[]> {
  const db = await getDB()
  return db.getAll('weekPlanConfigs')
}
