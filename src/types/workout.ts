import type { Exercise, ExerciseCategory, Equipment, Difficulty, MuscleGroup } from './exercise'

export interface WorkoutConfig {
  totalMinutes: number
  availableEquipment: Equipment[]
  difficulty: Difficulty
  excludeExerciseIds?: string[]
  focus?: ExerciseCategory | 'balanced'
  equipmentOnly?: boolean
  // AI-enhanced parameters for intelligent workout generation
  targetMuscles?: MuscleGroup[] // Specific muscles AI wants to prioritize
  avoidMuscles?: MuscleGroup[] // Muscles to avoid (for recovery)
  preferredExerciseIds?: string[] // Specific exercises AI recommends
  volumeModifier?: number // Adjust overall volume (0.7-1.3, default 1.0)
  emphasizeCardio?: boolean // Whether to include extra cardio
}

export interface WorkoutExercise {
  exercise: Exercise
  reps?: number
  durationSeconds?: number
  perSide?: boolean
}

export interface CircuitBlock {
  type: 'circuit'
  name: string
  rounds: number
  restBetweenExercises: number
  restBetweenRounds: number
  exercises: WorkoutExercise[]
}

export interface WorkoutPhase {
  name: string
  estimatedMinutes: number
  blocks: CircuitBlock[]
}

export interface StretchPairingInfo {
  targetedMuscles: MuscleGroup[]
  aiEnhanced: boolean
  aiReasoning?: string
}

export interface GeneratedWorkout {
  id: string
  createdAt: string
  config: WorkoutConfig
  warmUp: WorkoutPhase
  mainWorkout: WorkoutPhase
  coolDown: WorkoutPhase
  totalEstimatedMinutes: number
  totalExerciseCount: number
  muscleGroupCoverage: Partial<Record<MuscleGroup, number>>
  stretchPairing?: StretchPairingInfo
}

export interface WorkoutHistoryEntry {
  id: string
  name?: string
  createdAt: string
  completedAt: string
  workout: GeneratedWorkout
  actualDurationSeconds: number
  exercisesCompleted: number
  exercisesSkipped: number
  isFavorite: boolean
  isTemplate?: boolean // True if this is an AI-generated template (not yet completed)
  fromPlanId?: string // Link to plan if this was a planned workout
}

export type WeekRotationStrategy = 'push-pull-legs' | 'upper-lower-full' | 'balanced'

export interface WorkoutPlan {
  id: string                          // Unique ID for this day's plan
  planId: string                      // Shared ID grouping all 7 days together
  createdAt: string                   // When the plan was generated
  scheduledDate: string               // ISO date (YYYY-MM-DD)
  dayOfWeek: number                   // 0-6 (Sun-Sat)
  dayLabel: string                    // "MON", "TUE", "WED", etc.
  workout: GeneratedWorkout           // The full workout for this day
  isCompleted: boolean                // Has user completed this workout?
  completedAt?: string                // When it was marked complete
  completedWorkoutHistoryId?: string  // Link to WorkoutHistoryEntry if completed
  config: WorkoutConfig               // Config used to generate this workout
  focus: ExerciseCategory | 'balanced' | 'flexibility' // Day focus
  regeneratedCount?: number           // Track how many times regenerated
  lastRegeneratedAt?: string          // Timestamp of last regeneration
  previousWorkoutId?: string          // Link to replaced workout
}

export interface WeekPlanConfig {
  planId: string                      // ID for this week plan
  startDate: string                   // ISO date for first day (Monday)
  rotationStrategy: WeekRotationStrategy
  baseConfig: WorkoutConfig           // Base settings (duration, equipment, difficulty)
  createdAt: string
  aiOverview?: string                 // AI-generated week summary
  overviewGeneratedAt?: string        // Timestamp for cache
}
