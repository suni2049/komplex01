import { getDB, type UserSettings } from './db'
import type { WorkoutHistoryEntry } from '../types/workout'
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
