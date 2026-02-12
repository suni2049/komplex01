import type { WorkoutHistoryEntry } from '../store/db'
import type { MuscleGroup } from '../types/exercise'

export interface MuscleGroupUsage {
  muscleGroup: MuscleGroup
  lastWorkedDate: string | null
  daysSinceWorked: number
  totalVolume: number // Total times worked in recent history
  recentWorkouts: string[] // Workout IDs where this muscle was worked
}

export interface WorkoutHistoryAnalysis {
  recentMuscleGroups: Map<MuscleGroup, MuscleGroupUsage>
  lastWorkoutDate: string | null
  totalWorkouts: number
  mostWorkedMuscles: MuscleGroup[]
  leastWorkedMuscles: MuscleGroup[]
  wellRestedMuscles: MuscleGroup[] // Not worked in 2+ days
  recentlyWorkedMuscles: MuscleGroup[] // Worked in last 24 hours
}

const DAYS_WELL_RESTED = 2
const MAX_HISTORY_DAYS = 7 // Analyze last 7 days

export function analyzeWorkoutHistory(
  history: WorkoutHistoryEntry[]
): WorkoutHistoryAnalysis {
  const now = new Date()
  const recentWorkouts = history
    .filter(w => {
      const workoutDate = new Date(w.completedAt)
      const daysAgo = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysAgo <= MAX_HISTORY_DAYS
    })
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

  const muscleGroupMap = new Map<MuscleGroup, MuscleGroupUsage>()

  // Analyze each workout for muscle group usage
  recentWorkouts.forEach(workout => {
    const workoutDate = new Date(workout.completedAt)
    const daysAgo = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)

    // Extract muscle groups from workout
    const muscleGroups = new Set<MuscleGroup>()

    if (workout.workout.muscleGroupCoverage) {
      Object.keys(workout.workout.muscleGroupCoverage).forEach(muscle => {
        muscleGroups.add(muscle as MuscleGroup)
      })
    }

    // Update muscle group usage tracking
    muscleGroups.forEach(muscle => {
      const existing = muscleGroupMap.get(muscle)

      if (!existing) {
        muscleGroupMap.set(muscle, {
          muscleGroup: muscle,
          lastWorkedDate: workout.completedAt,
          daysSinceWorked: daysAgo,
          totalVolume: 1,
          recentWorkouts: [workout.id],
        })
      } else {
        // Update if this workout is more recent
        if (new Date(workout.completedAt) > new Date(existing.lastWorkedDate || 0)) {
          existing.lastWorkedDate = workout.completedAt
          existing.daysSinceWorked = daysAgo
        }
        existing.totalVolume += 1
        existing.recentWorkouts.push(workout.id)
      }
    })
  })

  // Calculate metrics
  const muscleUsages = Array.from(muscleGroupMap.values())
  const sortedByVolume = [...muscleUsages].sort((a, b) => b.totalVolume - a.totalVolume)

  const mostWorkedMuscles = sortedByVolume.slice(0, 3).map(m => m.muscleGroup)
  const leastWorkedMuscles = sortedByVolume.slice(-3).map(m => m.muscleGroup)

  const wellRestedMuscles = muscleUsages
    .filter(m => m.daysSinceWorked >= DAYS_WELL_RESTED)
    .map(m => m.muscleGroup)

  const recentlyWorkedMuscles = muscleUsages
    .filter(m => m.daysSinceWorked < 1)
    .map(m => m.muscleGroup)

  return {
    recentMuscleGroups: muscleGroupMap,
    lastWorkoutDate: recentWorkouts[0]?.completedAt || null,
    totalWorkouts: recentWorkouts.length,
    mostWorkedMuscles,
    leastWorkedMuscles,
    wellRestedMuscles,
    recentlyWorkedMuscles,
  }
}

export function buildCoachContext(analysis: WorkoutHistoryAnalysis): string {
  const lines: string[] = []

  lines.push('=== RECENT TRAINING HISTORY ===')
  lines.push(`Total workouts in last 7 days: ${analysis.totalWorkouts}`)

  if (analysis.lastWorkoutDate) {
    const lastWorkout = new Date(analysis.lastWorkoutDate)
    const hoursAgo = Math.floor((Date.now() - lastWorkout.getTime()) / (1000 * 60 * 60))
    lines.push(`Last workout: ${hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`}`)
  } else {
    lines.push('Last workout: None in recent history')
  }

  if (analysis.recentlyWorkedMuscles.length > 0) {
    lines.push(`\nRecently worked muscles (last 24h): ${analysis.recentlyWorkedMuscles.join(', ')}`)
    lines.push('⚠️ These muscles may need recovery time')
  }

  if (analysis.wellRestedMuscles.length > 0) {
    lines.push(`\nWell-rested muscles (2+ days): ${analysis.wellRestedMuscles.join(', ')}`)
    lines.push('✓ These muscles are ready for training')
  }

  if (analysis.mostWorkedMuscles.length > 0) {
    lines.push(`\nMost frequently trained: ${analysis.mostWorkedMuscles.join(', ')}`)
  }

  if (analysis.leastWorkedMuscles.length > 0) {
    lines.push(`Least frequently trained: ${analysis.leastWorkedMuscles.join(', ')}`)
  }

  return lines.join('\n')
}
