import { openDB, type IDBPDatabase, type DBSchema } from 'idb'
import type { WorkoutHistoryEntry, WorkoutPlan, WeekPlanConfig } from '../types/workout'
import type { Equipment, Difficulty } from '../types/exercise'

interface UserSettings {
  id: string
  equipment: Equipment[]
  defaultDifficulty: Difficulty
  defaultDurationMinutes: number
  accentColor: string
  soundEnabled: boolean
  exerciseGrouping?: 'circuit' | 'grouped'
  // AI Coach settings
  enableAICoach?: boolean
  groqApiKey?: string
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
  workoutPlans: {
    key: string
    value: WorkoutPlan
    indexes: {
      'by-plan-id': string
      'by-scheduled-date': string
      'by-completion': number
    }
  }
  weekPlanConfigs: {
    key: string
    value: WeekPlanConfig
  }
}

let dbPromise: Promise<IDBPDatabase<CaliDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CaliDB>('califorge-db', 2, {
      upgrade(db, oldVersion) {
        // Existing stores (v1)
        if (oldVersion < 1) {
          const historyStore = db.createObjectStore('workoutHistory', { keyPath: 'id' })
          historyStore.createIndex('by-date', 'completedAt')
          historyStore.createIndex('by-favorite', 'isFavorite')
          db.createObjectStore('userSettings', { keyPath: 'id' })
        }

        // New stores (v2)
        if (oldVersion < 2) {
          const planStore = db.createObjectStore('workoutPlans', { keyPath: 'id' })
          planStore.createIndex('by-plan-id', 'planId')
          planStore.createIndex('by-scheduled-date', 'scheduledDate')
          planStore.createIndex('by-completion', 'isCompleted')
          db.createObjectStore('weekPlanConfigs', { keyPath: 'planId' })
        }
      },
    })
  }
  return dbPromise
}

export type { UserSettings, WorkoutHistoryEntry, WorkoutPlan, WeekPlanConfig }
