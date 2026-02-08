import type { GeneratedWorkout, WorkoutPhase } from '../types/workout'
import type { Difficulty, MuscleGroup } from '../types/exercise'

export interface MuscleScore {
  muscle: MuscleGroup
  score: number
  percentage: number
}

export interface WorkoutStats {
  totalReps: number
  totalTimedSeconds: number
  muscleBreakdown: MuscleScore[]
  difficultyDistribution: Record<Difficulty, number>
  intensityScore: number
  circuitMuscles: Map<string, MuscleGroup[]>
}

function countPhaseVolume(phase: WorkoutPhase) {
  let reps = 0
  let timed = 0
  for (const block of phase.blocks) {
    for (const we of block.exercises) {
      const multiplier = block.rounds * (we.perSide ? 2 : 1)
      if (we.reps) reps += we.reps * multiplier
      if (we.durationSeconds) timed += we.durationSeconds * block.rounds
    }
  }
  return { reps, timed }
}

function countDifficulty(phase: WorkoutPhase, dist: Record<Difficulty, number>) {
  const seen = new Set<string>()
  for (const block of phase.blocks) {
    for (const we of block.exercises) {
      if (!seen.has(we.exercise.id)) {
        seen.add(we.exercise.id)
        dist[we.exercise.difficulty] = (dist[we.exercise.difficulty] || 0) + 1
      }
    }
  }
}

export function computeWorkoutStats(workout: GeneratedWorkout): WorkoutStats {
  const phases = [workout.warmUp, workout.mainWorkout, workout.coolDown]

  // Volume
  let totalReps = 0
  let totalTimedSeconds = 0
  for (const phase of phases) {
    const vol = countPhaseVolume(phase)
    totalReps += vol.reps
    totalTimedSeconds += vol.timed
  }

  // Muscle breakdown
  const coverage = workout.muscleGroupCoverage
  const maxScore = Math.max(...Object.values(coverage).map(v => v ?? 0), 1)
  const muscleBreakdown: MuscleScore[] = Object.entries(coverage)
    .filter(([, v]) => (v ?? 0) > 0)
    .map(([muscle, score]) => ({
      muscle: muscle as MuscleGroup,
      score: score ?? 0,
      percentage: Math.round(((score ?? 0) / maxScore) * 100),
    }))
    .sort((a, b) => b.score - a.score)

  // Difficulty distribution
  const difficultyDistribution: Record<Difficulty, number> = {
    beginner: 0, intermediate: 0, advanced: 0,
  }
  for (const phase of phases) countDifficulty(phase, difficultyDistribution)

  // Intensity score (1-100)
  const diffWeights: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3 }
  const totalExercises = Object.values(difficultyDistribution).reduce((s, n) => s + n, 0) || 1
  const avgDiff = Object.entries(difficultyDistribution)
    .reduce((s, [d, n]) => s + diffWeights[d as Difficulty] * n, 0) / totalExercises
  const circuits = workout.mainWorkout.blocks.length
  const volumeFactor = Math.min(totalReps / 300, 1)
  const intensityScore = Math.round(
    Math.min(avgDiff * 25 + volumeFactor * 25 + circuits * 12.5, 100)
  )

  // Per-circuit muscles
  const circuitMuscles = new Map<string, MuscleGroup[]>()
  for (const block of workout.mainWorkout.blocks) {
    const muscles = new Set<MuscleGroup>()
    for (const we of block.exercises) {
      we.exercise.primaryMuscles.forEach(m => muscles.add(m))
    }
    circuitMuscles.set(block.name, [...muscles])
  }

  return {
    totalReps,
    totalTimedSeconds,
    muscleBreakdown,
    difficultyDistribution,
    intensityScore,
    circuitMuscles,
  }
}
