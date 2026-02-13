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
}
