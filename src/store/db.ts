import { openDB, type IDBPDatabase, type DBSchema } from 'idb'
import type { WorkoutHistoryEntry, WorkoutGrouping } from '../types/workout'
import type { Equipment, Difficulty } from '../types/exercise'

interface UserSettings {
  id: string
  equipment: Equipment[]
  defaultDifficulty: Difficulty
  defaultDurationMinutes: number
  accentColor: string
  soundEnabled: boolean
  workoutGrouping: WorkoutGrouping
}

interface CaliDB extends DBSchema {
  workoutHistory: {
    key: string
    value: WorkoutHistoryEntry
    indexes: { 'by-date': string; 'by-favorite': number }
  }
  userSettings: {
    key: string
    value: UserSettings
  }
}

let dbPromise: Promise<IDBPDatabase<CaliDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CaliDB>('califorge-db', 1, {
      upgrade(db) {
        const historyStore = db.createObjectStore('workoutHistory', { keyPath: 'id' })
        historyStore.createIndex('by-date', 'completedAt')
        historyStore.createIndex('by-favorite', 'isFavorite')
        db.createObjectStore('userSettings', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export type { UserSettings }
