import type { Exercise, MuscleGroup } from '../types/exercise'
import type { WorkoutPhase, WorkoutExercise } from '../types/workout'
import { pickRandom } from '../utils/shuffle'

/**
 * Muscle load map: how heavily each muscle group was worked in the main workout.
 * Higher values = more volume on that muscle = higher priority for stretching.
 */
export type MuscleLoadMap = Partial<Record<MuscleGroup, number>>

/**
 * Analyze the main workout phase and compute a load score per muscle group.
 * Primary muscles get full credit per round, secondary muscles get half.
 */
export function analyzeMuscleLoad(mainWorkout: WorkoutPhase): MuscleLoadMap {
  const load: MuscleLoadMap = {}

  for (const block of mainWorkout.blocks) {
    const rounds = block.rounds || 1
    for (const we of block.exercises) {
      for (const muscle of we.exercise.primaryMuscles) {
        load[muscle] = (load[muscle] || 0) + rounds
      }
      for (const muscle of we.exercise.secondaryMuscles) {
        load[muscle] = (load[muscle] || 0) + rounds * 0.5
      }
    }
  }

  return load
}

/**
 * Score a stretch exercise by how well it targets muscles that were loaded.
 * Primary muscles of the stretch get full load credit, secondary get half.
 */
function scoreStretch(stretch: Exercise, muscleLoad: MuscleLoadMap): number {
  let score = 0

  for (const muscle of stretch.primaryMuscles) {
    score += muscleLoad[muscle] || 0
  }
  for (const muscle of stretch.secondaryMuscles) {
    score += (muscleLoad[muscle] || 0) * 0.5
  }

  return score
}

/**
 * Get the top N muscle groups from the load map, sorted by load descending.
 */
export function getTopMuscles(muscleLoad: MuscleLoadMap, n: number): MuscleGroup[] {
  return Object.entries(muscleLoad)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([muscle]) => muscle as MuscleGroup)
}

interface StretchPairingResult {
  warmUpExercises: WorkoutExercise[]
  coolDownExercises: WorkoutExercise[]
  targetedMuscles: MuscleGroup[]
}

function makeStretchExercise(exercise: Exercise, durationBoost: number): WorkoutExercise {
  const scheme = exercise.repScheme
  switch (scheme.type) {
    case 'reps':
      return { exercise, reps: scheme.defaultReps }
    case 'timed': {
      const boosted = Math.round(scheme.defaultSeconds * (1 + durationBoost))
      return { exercise, durationSeconds: Math.max(boosted, 20) }
    }
    case 'each-side':
      return { exercise, reps: scheme.defaultReps, perSide: true }
  }
}

/**
 * Select warm-up stretches that prepare the muscles about to be worked.
 * Prioritizes dynamic stretches (isWarmUp) that target the heaviest-loaded muscles.
 */
function selectWarmUpStretches(
  eligible: Exercise[],
  muscleLoad: MuscleLoadMap,
  count: number,
): WorkoutExercise[] {
  const warmUpPool = eligible.filter(e => e.category === 'flexibility' && e.isWarmUp)

  if (warmUpPool.length === 0) return []

  // Score each warm-up stretch by muscle relevance
  const scored = warmUpPool.map(stretch => ({
    stretch,
    score: scoreStretch(stretch, muscleLoad) + Math.random() * 0.5, // small randomness for variety
  }))

  scored.sort((a, b) => b.score - a.score)

  const selected = scored.slice(0, Math.min(count, scored.length))
  return selected.map(({ stretch }) => makeStretchExercise(stretch, 0))
}

/**
 * Select cool-down stretches that target the muscles that were just worked hardest.
 * Longer hold durations for the most-loaded muscles.
 */
function selectCoolDownStretches(
  eligible: Exercise[],
  muscleLoad: MuscleLoadMap,
  count: number,
): WorkoutExercise[] {
  const coolDownPool = eligible.filter(e => e.category === 'flexibility' && e.isCoolDown)

  if (coolDownPool.length === 0) return []

  // Score by how well each stretch covers the worked muscles
  const scored = coolDownPool.map(stretch => ({
    stretch,
    score: scoreStretch(stretch, muscleLoad) + Math.random() * 0.3,
  }))

  scored.sort((a, b) => b.score - a.score)

  // Find the max load for duration boost calculation
  const maxLoad = Math.max(...Object.values(muscleLoad).map(v => v || 0), 1)

  const selected = scored.slice(0, Math.min(count, scored.length))
  return selected.map(({ stretch, score }) => {
    // Boost hold duration for stretches targeting heavily-loaded muscles (up to 40% longer)
    const durationBoost = Math.min(score / maxLoad, 1) * 0.4
    return makeStretchExercise(stretch, durationBoost)
  })
}

/**
 * Main entry point: pair stretches to a generated main workout.
 * Returns warm-up exercises, cool-down exercises, and the top targeted muscles.
 */
export function pairStretchesToWorkout(
  mainWorkout: WorkoutPhase,
  eligible: Exercise[],
): StretchPairingResult {
  const muscleLoad = analyzeMuscleLoad(mainWorkout)
  const topMuscles = getTopMuscles(muscleLoad, 5)

  // Select warm-up: 2-3 dynamic stretches + 1-2 general warm-up moves
  const warmUpStretches = selectWarmUpStretches(eligible, muscleLoad, 3)

  // Fill remaining warm-up slots with general warm-up exercises (cardio/core)
  const warmUpCardioPool = eligible.filter(
    e => (e.category === 'cardio' || e.category === 'core') && e.isWarmUp &&
      !warmUpStretches.some(ws => ws.exercise.id === e.id)
  )
  const generalWarmUp = pickRandom(warmUpCardioPool, Math.min(2, warmUpCardioPool.length))
    .map(ex => {
      const we = makeStretchExercise(ex, 0)
      // Reduce warm-up volume
      if (we.reps) we.reps = Math.ceil(we.reps * 0.6)
      if (we.durationSeconds) we.durationSeconds = Math.min(we.durationSeconds, 30)
      return we
    })

  const warmUpExercises = [...warmUpStretches, ...generalWarmUp].slice(0, 5)

  // Select cool-down: 4-5 stretches targeting the most-worked muscles
  const coolDownExercises = selectCoolDownStretches(eligible, muscleLoad, 5)

  return {
    warmUpExercises,
    coolDownExercises,
    targetedMuscles: topMuscles,
  }
}
