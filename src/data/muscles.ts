import type { MuscleGroup, ExerciseCategory } from '../types/exercise'

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  'chest': 'Chest',
  'shoulders': 'Shoulders',
  'triceps': 'Triceps',
  'biceps': 'Biceps',
  'forearms': 'Forearms',
  'upper-back': 'Upper Back',
  'lats': 'Lats',
  'lower-back': 'Lower Back',
  'core': 'Core',
  'obliques': 'Obliques',
  'hip-flexors': 'Hip Flexors',
  'glutes': 'Glutes',
  'quads': 'Quads',
  'hamstrings': 'Hamstrings',
  'calves': 'Calves',
  'full-body': 'Full Body',
}

export const categoryColors: Record<ExerciseCategory, { bg: string; text: string }> = {
  push: { bg: 'bg-primary-200', text: 'text-primary-700' },
  pull: { bg: 'bg-surface-3', text: 'text-accent-500' },
  legs: { bg: 'bg-surface-3', text: 'text-success-500' },
  core: { bg: 'bg-surface-3', text: 'text-warning' },
  cardio: { bg: 'bg-primary-100', text: 'text-primary-700' },
  flexibility: { bg: 'bg-surface-3', text: 'text-khaki' },
}

export const categoryLabels: Record<ExerciseCategory, string> = {
  push: 'PUSH',
  pull: 'PULL',
  legs: 'LEGS',
  core: 'CORE',
  cardio: 'CARDIO',
  flexibility: 'FLEX',
}
