export type MuscleGroup =
  | 'chest' | 'shoulders' | 'triceps' | 'biceps' | 'forearms'
  | 'upper-back' | 'lats' | 'lower-back'
  | 'core' | 'obliques' | 'hip-flexors'
  | 'glutes' | 'quads' | 'hamstrings' | 'calves'
  | 'full-body'

export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'flexibility'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type Equipment =
  | 'none' | 'push-up-bars' | 'pull-up-bar' | 'resistance-bands'
  | 'dumbbell' | 'yoga-mat' | 'jump-rope' | 'parallettes'

export type RepScheme =
  | { type: 'reps'; defaultReps: number }
  | { type: 'timed'; defaultSeconds: number }
  | { type: 'each-side'; defaultReps: number }

export interface Exercise {
  id: string
  name: string
  description: string
  instructions: string[]
  category: ExerciseCategory
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  difficulty: Difficulty
  equipment: Equipment[]
  repScheme: RepScheme
  animationId: string
  isWarmUp?: boolean
  isCoolDown?: boolean
  restModifier?: number
}
