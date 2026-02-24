import { exercises as allExercises } from '../data/exercises'
import type { GeneratedWorkout, WorkoutPhase, CircuitBlock, WorkoutExercise } from '../types/workout'
import type { MuscleGroup } from '../types/exercise'
import { generateId } from '../utils/id'

// ─── V2 compact payload ────────────────────────────────────────────────────
// Single-char keys + integer exercise indices instead of string IDs.
// Muscle coverage is omitted and re-derived on decode from exercise data.
// Phase names are fixed and hardcoded on decode.

interface V2Ex {
  i: number     // index into allExercises array
  r?: number    // reps
  d?: number    // durationSeconds
  p?: 1         // perSide (only present when true)
}

interface V2Block {
  n: string     // block name
  r: number     // rounds
  re: number    // restBetweenExercises
  rr: number    // restBetweenRounds
  e: V2Ex[]     // exercises
}

interface V2Phase {
  em: number    // estimatedMinutes
  b: V2Block[]  // blocks
}

interface V2Payload {
  v: 2
  n?: string    // workout name
  d: string     // difficulty
  m: number     // totalMinutes (config)
  f?: string    // focus
  eq: string[]  // availableEquipment
  wu: V2Phase   // warmUp
  mw: V2Phase   // mainWorkout
  cd: V2Phase   // coolDown
  tc: number    // totalExerciseCount
  tm: number    // totalEstimatedMinutes
}

// ─── Legacy V1 payload (decode-only) ──────────────────────────────────────
interface V1Ex { id: string; reps?: number; durationSeconds?: number; perSide?: boolean }
interface V1Block { name: string; rounds: number; restBetweenExercises: number; restBetweenRounds: number; exercises: V1Ex[] }
interface V1Phase { name: string; estimatedMinutes: number; blocks: V1Block[] }
interface V1Payload {
  v: 1; name?: string; config: { totalMinutes: number; availableEquipment: string[]; difficulty: string; focus?: string }
  warmUp: V1Phase; main: V1Phase; coolDown: V1Phase; totalMinutes: number; totalCount: number
  muscles: Partial<Record<MuscleGroup, number>>
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const exerciseIndexMap = new Map(allExercises.map((e, i) => [e.id, i]))
const PHASE_NAMES = ['Warm-Up', 'Main Workout', 'Cool Down'] as const

function deriveMuscleGroupCoverage(workout: GeneratedWorkout): Partial<Record<MuscleGroup, number>> {
  const coverage: Partial<Record<MuscleGroup, number>> = {}
  for (const block of workout.mainWorkout.blocks) {
    for (const we of block.exercises) {
      for (const muscle of we.exercise.primaryMuscles) {
        coverage[muscle] = (coverage[muscle] || 0) + 1
      }
    }
  }
  return coverage
}

function slimPhaseV2(phase: WorkoutPhase): V2Phase {
  return {
    em: phase.estimatedMinutes,
    b: phase.blocks.map(block => {
      const b: V2Block = {
        n: block.name,
        r: block.rounds,
        re: block.restBetweenExercises,
        rr: block.restBetweenRounds,
        e: block.exercises.map(we => {
          const idx = exerciseIndexMap.get(we.exercise.id) ?? -1
          const ex: V2Ex = { i: idx }
          if (we.reps !== undefined) ex.r = we.reps
          if (we.durationSeconds !== undefined) ex.d = we.durationSeconds
          if (we.perSide) ex.p = 1
          return ex
        }).filter(ex => ex.i !== -1),
      }
      return b
    }),
  }
}

function expandPhaseV2(slim: V2Phase, phaseName: string): WorkoutPhase {
  return {
    name: phaseName,
    estimatedMinutes: slim.em,
    blocks: slim.b.map((b): CircuitBlock => ({
      type: 'circuit',
      name: b.n,
      rounds: b.r,
      restBetweenExercises: b.re,
      restBetweenRounds: b.rr,
      exercises: b.e
        .map((ex): WorkoutExercise | null => {
          const exercise = allExercises[ex.i]
          if (!exercise) return null
          const we: WorkoutExercise = { exercise }
          if (ex.r !== undefined) we.reps = ex.r
          if (ex.d !== undefined) we.durationSeconds = ex.d
          if (ex.p) we.perSide = true
          return we
        })
        .filter((we): we is WorkoutExercise => we !== null),
    })),
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

export function encodeWorkout(workout: GeneratedWorkout, name?: string): string {
  const payload: V2Payload = {
    v: 2,
    d: workout.config.difficulty,
    m: workout.config.totalMinutes,
    eq: workout.config.availableEquipment,
    wu: slimPhaseV2(workout.warmUp),
    mw: slimPhaseV2(workout.mainWorkout),
    cd: slimPhaseV2(workout.coolDown),
    tc: workout.totalExerciseCount,
    tm: workout.totalEstimatedMinutes,
  }
  if (name) payload.n = name
  if (workout.config.focus) payload.f = workout.config.focus

  const json = JSON.stringify(payload)
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function decodeWorkout(code: string): { workout: GeneratedWorkout; name?: string } | null {
  try {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(b64)))
    const raw = JSON.parse(json)

    if (raw.v === 2) {
      const p = raw as V2Payload
      const workout: GeneratedWorkout = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        config: {
          totalMinutes: p.m,
          availableEquipment: p.eq as never,
          difficulty: p.d as never,
          ...(p.f && { focus: p.f as never }),
        },
        warmUp: expandPhaseV2(p.wu, PHASE_NAMES[0]),
        mainWorkout: expandPhaseV2(p.mw, PHASE_NAMES[1]),
        coolDown: expandPhaseV2(p.cd, PHASE_NAMES[2]),
        totalExerciseCount: p.tc,
        totalEstimatedMinutes: p.tm,
        muscleGroupCoverage: {},
      }
      workout.muscleGroupCoverage = deriveMuscleGroupCoverage(workout)
      return { workout, name: p.n }
    }

    if (raw.v === 1) {
      const p = raw as V1Payload
      const exerciseMap = new Map(allExercises.map(e => [e.id, e]))
      const expandV1 = (slim: V1Phase): WorkoutPhase => ({
        name: slim.name,
        estimatedMinutes: slim.estimatedMinutes,
        blocks: slim.blocks.map((block): CircuitBlock => ({
          type: 'circuit',
          name: block.name,
          rounds: block.rounds,
          restBetweenExercises: block.restBetweenExercises,
          restBetweenRounds: block.restBetweenRounds,
          exercises: block.exercises
            .map((se): WorkoutExercise | null => {
              const exercise = exerciseMap.get(se.id)
              if (!exercise) return null
              const we: WorkoutExercise = { exercise }
              if (se.reps !== undefined) we.reps = se.reps
              if (se.durationSeconds !== undefined) we.durationSeconds = se.durationSeconds
              if (se.perSide !== undefined) we.perSide = se.perSide
              return we
            })
            .filter((we): we is WorkoutExercise => we !== null),
        })),
      })
      const workout: GeneratedWorkout = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        config: p.config as never,
        warmUp: expandV1(p.warmUp),
        mainWorkout: expandV1(p.main),
        coolDown: expandV1(p.coolDown),
        totalEstimatedMinutes: p.totalMinutes,
        totalExerciseCount: p.totalCount,
        muscleGroupCoverage: p.muscles,
      }
      return { workout, name: p.name }
    }

    return null
  } catch {
    return null
  }
}

export function buildShareUrl(code: string): string {
  return `https://komplex01.co.uk/share/${code}`
}
