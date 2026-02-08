import type { Exercise, ExerciseCategory, Difficulty, MuscleGroup } from '../types/exercise'
import type { WorkoutConfig, GeneratedWorkout, WorkoutPhase, CircuitBlock, WorkoutExercise } from '../types/workout'
import { exercises } from '../data/exercises'
import { pickRandom } from '../utils/shuffle'
import { generateId } from '../utils/id'

const DIFFICULTY_LEVEL: Record<Difficulty, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

/** How many reps/seconds to scale based on difficulty */
const VOLUME_SCALE: Record<Difficulty, number> = {
  beginner: 1.0,
  intermediate: 1.2,
  advanced: 1.4,
}

/** Circuit rounds per difficulty */
const ROUNDS_BY_DIFFICULTY: Record<Difficulty, number> = {
  beginner: 2,
  intermediate: 3,
  advanced: 4,
}

/** Rest between rounds (seconds) — harder = less rest */
const REST_BETWEEN_ROUNDS: Record<Difficulty, number> = {
  beginner: 60,
  intermediate: 45,
  advanced: 30,
}

/** Max exercises per circuit */
const EXERCISES_PER_CIRCUIT: Record<Difficulty, number> = {
  beginner: 4,
  intermediate: 5,
  advanced: 6,
}

const CATEGORY_WEIGHTS: Record<ExerciseCategory | 'balanced', Record<ExerciseCategory, number>> = {
  balanced: { push: 0.25, pull: 0.20, legs: 0.25, core: 0.20, cardio: 0.10, flexibility: 0 },
  push: { push: 0.40, pull: 0.10, legs: 0.15, core: 0.20, cardio: 0.10, flexibility: 0.05 },
  pull: { push: 0.10, pull: 0.40, legs: 0.15, core: 0.20, cardio: 0.10, flexibility: 0.05 },
  legs: { push: 0.10, pull: 0.10, legs: 0.40, core: 0.20, cardio: 0.15, flexibility: 0.05 },
  core: { push: 0.15, pull: 0.10, legs: 0.15, core: 0.40, cardio: 0.15, flexibility: 0.05 },
  cardio: { push: 0.10, pull: 0.10, legs: 0.15, core: 0.15, cardio: 0.40, flexibility: 0.10 },
  flexibility: { push: 0.15, pull: 0.10, legs: 0.15, core: 0.15, cardio: 0.10, flexibility: 0.35 },
}

function getEligibleExercises(config: WorkoutConfig, ignoreEquipmentOnly = false): Exercise[] {
  return exercises.filter(ex => {
    const hasEquipment = ex.equipment.length === 0 ||
      ex.equipment.every(eq => config.availableEquipment.includes(eq))
    const difficultyOk = DIFFICULTY_LEVEL[ex.difficulty] <= DIFFICULTY_LEVEL[config.difficulty]
    const notExcluded = !config.excludeExerciseIds?.includes(ex.id)
    // When equipmentOnly is set, only include exercises that require at least one piece of equipment
    // ignoreEquipmentOnly is used for warm-up/cool-down which have no equipment-specific exercises
    const equipmentOnlyOk = ignoreEquipmentOnly || !config.equipmentOnly || ex.equipment.length > 0
    return hasEquipment && difficultyOk && notExcluded && equipmentOnlyOk
  })
}

function estimateExerciseTime(we: WorkoutExercise): number {
  if (we.durationSeconds) return we.durationSeconds
  if (we.reps) {
    const secsPerRep = 3
    const reps = we.perSide ? we.reps * 2 : we.reps
    return reps * secsPerRep
  }
  return 30
}

function estimateCircuitTime(block: CircuitBlock): number {
  const exerciseTime = block.exercises.reduce((sum, we) => sum + estimateExerciseTime(we), 0)
  const restInRound = (block.exercises.length - 1) * block.restBetweenExercises
  const roundTime = exerciseTime + restInRound
  const totalRest = (block.rounds - 1) * block.restBetweenRounds
  return (roundTime * block.rounds + totalRest)
}

function makeWorkoutExercise(exercise: Exercise, difficulty: Difficulty): WorkoutExercise {
  const scheme = exercise.repScheme
  const scale = VOLUME_SCALE[difficulty]
  switch (scheme.type) {
    case 'reps':
      return { exercise, reps: Math.round(scheme.defaultReps * scale) }
    case 'timed':
      return { exercise, durationSeconds: Math.round(scheme.defaultSeconds * scale) }
    case 'each-side':
      return { exercise, reps: Math.round(scheme.defaultReps * scale), perSide: true }
  }
}

function generateWarmUp(eligible: Exercise[]): WorkoutPhase {
  const warmUpPool = eligible.filter(e => e.isWarmUp)
  const flexPool = eligible.filter(e => e.category === 'flexibility' && e.isWarmUp)
  const cardioPool = eligible.filter(e =>
    (e.category === 'cardio' || e.category === 'core') && e.isWarmUp
  )

  const selected: Exercise[] = []

  // 1-2 flexibility/mobility
  const flex = pickRandom(flexPool.length > 0 ? flexPool : warmUpPool, Math.min(2, flexPool.length || 1))
  selected.push(...flex)

  // 2-3 dynamic warm-up
  const remaining = warmUpPool.filter(e => !selected.includes(e))
  const dynamic = pickRandom(
    remaining.length > 0 ? remaining : cardioPool,
    Math.min(3, remaining.length || 1)
  )
  selected.push(...dynamic)

  const exercises = selected.slice(0, 5).map(ex => {
    const we = makeWorkoutExercise(ex, 'beginner')
    // Reduce warm-up volume
    if (we.reps) we.reps = Math.ceil(we.reps * 0.6)
    if (we.durationSeconds) we.durationSeconds = Math.min(we.durationSeconds, 30)
    return we
  })

  const block: CircuitBlock = {
    type: 'circuit',
    name: 'Warm-Up',
    rounds: 1,
    restBetweenExercises: 0,
    restBetweenRounds: 0,
    exercises,
  }

  return {
    name: 'Warm-Up',
    estimatedMinutes: Math.ceil(estimateCircuitTime(block) / 60),
    blocks: [block],
  }
}

function generateCoolDown(eligible: Exercise[], _usedMuscles: MuscleGroup[]): WorkoutPhase {
  const coolDownPool = eligible.filter(e => e.isCoolDown)
  const flexPool = eligible.filter(e => e.category === 'flexibility')
  const pool = coolDownPool.length >= 3 ? coolDownPool : [...coolDownPool, ...flexPool]
  const unique = [...new Set(pool)]

  const selected = pickRandom(unique, Math.min(4, unique.length))

  const exercises = selected.map(ex => {
    const we = makeWorkoutExercise(ex, 'beginner')
    if (we.durationSeconds) we.durationSeconds = Math.max(we.durationSeconds, 40)
    return we
  })

  const block: CircuitBlock = {
    type: 'circuit',
    name: 'Cool-Down',
    rounds: 1,
    restBetweenExercises: 0,
    restBetweenRounds: 0,
    exercises,
  }

  return {
    name: 'Cool-Down',
    estimatedMinutes: Math.ceil(estimateCircuitTime(block) / 60),
    blocks: [block],
  }
}

function scoreAndPick(pool: Exercise[], categoryWeight: number, configLevel: number): Exercise {
  const scored = pool.map(ex => {
    let score = 1
    score += categoryWeight * 10
    if (ex.equipment.length > 0) score += 4

    const exLevel = DIFFICULTY_LEVEL[ex.difficulty]
    if (exLevel === configLevel) {
      score += 8
    } else if (exLevel === configLevel - 1) {
      score += 3
    } else {
      score -= 2
    }

    return { ex, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const topN = scored.slice(0, Math.min(3, scored.length))
  return topN[Math.floor(Math.random() * topN.length)].ex
}

function generateMainWorkout(
  eligible: Exercise[],
  targetMinutes: number,
  focus: ExerciseCategory | 'balanced',
  difficulty: Difficulty
): WorkoutPhase {
  const weights = CATEGORY_WEIGHTS[focus]
  const mainPool = eligible.filter(e => !e.isWarmUp || e.category !== 'flexibility')
  const usedIds = new Set<string>()
  const blocks: CircuitBlock[] = []
  const configLevel = DIFFICULTY_LEVEL[difficulty]

  const categoryOrder: ExerciseCategory[] = ['push', 'legs', 'pull', 'core', 'cardio']
  let totalSeconds = 0
  const targetSeconds = targetMinutes * 60
  let circuitNum = 0
  const maxExercises = EXERCISES_PER_CIRCUIT[difficulty]

  while (totalSeconds < targetSeconds && circuitNum < 4) {
    circuitNum++
    const circuitExercises: WorkoutExercise[] = []
    const rotatedOrder = [...categoryOrder.slice(circuitNum % categoryOrder.length), ...categoryOrder.slice(0, circuitNum % categoryOrder.length)]

    for (const cat of rotatedOrder) {
      if (circuitExercises.length >= maxExercises) break

      const catPool = mainPool.filter(e =>
        e.category === cat && !usedIds.has(e.id)
      )

      if (catPool.length === 0) continue

      const pick = scoreAndPick(catPool, weights[cat], configLevel)
      usedIds.add(pick.id)
      circuitExercises.push(makeWorkoutExercise(pick, difficulty))
    }

    // If we don't have enough exercises from category rotation,
    // fill from any remaining unused exercises (allows multiple from same category)
    if (circuitExercises.length < maxExercises) {
      const remainingPool = mainPool.filter(e => !usedIds.has(e.id))
      while (circuitExercises.length < maxExercises && remainingPool.length > 0) {
        const pick = scoreAndPick(remainingPool, 0.2, configLevel)
        usedIds.add(pick.id)
        circuitExercises.push(makeWorkoutExercise(pick, difficulty))
        // Remove from remainingPool
        const idx = remainingPool.findIndex(e => e.id === pick.id)
        if (idx !== -1) remainingPool.splice(idx, 1)
      }
    }

    // Minimum 2 exercises for a valid circuit (lowered from 3 for limited pools)
    if (circuitExercises.length < 2) break

    const circuitNames = ['Upper Body Blast', 'Lower Body Burn', 'Core Crusher', 'Full Body Finisher']
    const rounds = ROUNDS_BY_DIFFICULTY[difficulty]
    const block: CircuitBlock = {
      type: 'circuit',
      name: `Circuit ${circuitNum} - ${circuitNames[(circuitNum - 1) % circuitNames.length]}`,
      rounds,
      restBetweenExercises: 0,
      restBetweenRounds: REST_BETWEEN_ROUNDS[difficulty],
      exercises: circuitExercises,
    }

    const circuitTime = estimateCircuitTime(block)
    // Add inter-circuit rest
    const restBetweenCircuits = circuitNum > 1 ? REST_BETWEEN_ROUNDS[difficulty] + 30 : 0

    if (totalSeconds + circuitTime + restBetweenCircuits > targetSeconds + 180) {
      // Try with one fewer round
      block.rounds = Math.max(2, rounds - 1)
      const reducedTime = estimateCircuitTime(block)
      if (totalSeconds + reducedTime + restBetweenCircuits <= targetSeconds + 180) {
        totalSeconds += reducedTime + restBetweenCircuits
        blocks.push(block)
      }
      break
    }

    totalSeconds += circuitTime + restBetweenCircuits
    blocks.push(block)
  }

  return {
    name: 'Main Workout',
    estimatedMinutes: Math.ceil(totalSeconds / 60),
    blocks,
  }
}

export function generateWorkout(config: WorkoutConfig): GeneratedWorkout {
  const eligible = getEligibleExercises(config)
  // Warm-up/cool-down always use full pool (no equipment-only filter)
  // since there are no equipment-specific warm-up/cool-down exercises
  const warmCoolEligible = config.equipmentOnly
    ? getEligibleExercises(config, true)
    : eligible

  const warmUpMinutes = 7
  const coolDownMinutes = 5
  const mainMinutes = config.totalMinutes - warmUpMinutes - coolDownMinutes - 3 // 3 min buffer

  const warmUp = generateWarmUp(warmCoolEligible)
  const mainWorkout = generateMainWorkout(eligible, mainMinutes, config.focus || 'balanced', config.difficulty)
  const coolDown = generateCoolDown(warmCoolEligible, [])

  // Count muscle coverage
  const muscleGroupCoverage: Partial<Record<MuscleGroup, number>> = {}
  const allPhases: WorkoutPhase[] = [warmUp, mainWorkout, coolDown]
  for (const phase of allPhases) {
    for (const block of phase.blocks) {
      for (const we of block.exercises) {
        for (const m of we.exercise.primaryMuscles) {
          muscleGroupCoverage[m as MuscleGroup] = (muscleGroupCoverage[m as MuscleGroup] || 0) + (block.rounds || 1)
        }
        for (const m of we.exercise.secondaryMuscles) {
          muscleGroupCoverage[m as MuscleGroup] = (muscleGroupCoverage[m as MuscleGroup] || 0) + ((block.rounds || 1) * 0.5)
        }
      }
    }
  }

  let totalExerciseCount = 0
  for (const phase of allPhases) {
    for (const block of phase.blocks) {
      totalExerciseCount += block.exercises.length
    }
  }

  const totalEstimatedMinutes = warmUp.estimatedMinutes + mainWorkout.estimatedMinutes + coolDown.estimatedMinutes

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    config,
    warmUp,
    mainWorkout,
    coolDown,
    totalEstimatedMinutes,
    totalExerciseCount,
    muscleGroupCoverage,
  }
}
