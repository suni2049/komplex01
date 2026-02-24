import { exercises as allExercises } from '../data/exercises'
import type { GeneratedWorkout, WorkoutConfig, WorkoutPhase, CircuitBlock, WorkoutExercise } from '../types/workout'
import type { MuscleGroup } from '../types/exercise'
import { generateId } from '../utils/id'

interface SlimExercise {
  id: string
  reps?: number
  durationSeconds?: number
  perSide?: boolean
}

interface SlimBlock {
  name: string
  rounds: number
  restBetweenExercises: number
  restBetweenRounds: number
  exercises: SlimExercise[]
}

interface SlimPhase {
  name: string
  estimatedMinutes: number
  blocks: SlimBlock[]
}

interface SharePayload {
  v: number
  name?: string
  config: WorkoutConfig
  warmUp: SlimPhase
  main: SlimPhase
  coolDown: SlimPhase
  totalMinutes: number
  totalCount: number
  muscles: Partial<Record<MuscleGroup, number>>
}

function slimPhase(phase: WorkoutPhase): SlimPhase {
  return {
    name: phase.name,
    estimatedMinutes: phase.estimatedMinutes,
    blocks: phase.blocks.map(block => ({
      name: block.name,
      rounds: block.rounds,
      restBetweenExercises: block.restBetweenExercises,
      restBetweenRounds: block.restBetweenRounds,
      exercises: block.exercises.map(we => {
        const slim: SlimExercise = { id: we.exercise.id }
        if (we.reps !== undefined) slim.reps = we.reps
        if (we.durationSeconds !== undefined) slim.durationSeconds = we.durationSeconds
        if (we.perSide !== undefined) slim.perSide = we.perSide
        return slim
      }),
    })),
  }
}

export function encodeWorkout(workout: GeneratedWorkout, name?: string): string {
  const payload: SharePayload = {
    v: 1,
    config: workout.config,
    warmUp: slimPhase(workout.warmUp),
    main: slimPhase(workout.mainWorkout),
    coolDown: slimPhase(workout.coolDown),
    totalMinutes: workout.totalEstimatedMinutes,
    totalCount: workout.totalExerciseCount,
    muscles: workout.muscleGroupCoverage,
  }
  if (name) payload.name = name

  const json = JSON.stringify(payload)
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function decodeWorkout(code: string): { workout: GeneratedWorkout; name?: string } | null {
  try {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(b64)))
    const payload: SharePayload = JSON.parse(json)

    if (payload.v !== 1) return null

    const exerciseMap = new Map(allExercises.map(e => [e.id, e]))

    const expandPhase = (slim: SlimPhase): WorkoutPhase => ({
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
      config: payload.config,
      warmUp: expandPhase(payload.warmUp),
      mainWorkout: expandPhase(payload.main),
      coolDown: expandPhase(payload.coolDown),
      totalEstimatedMinutes: payload.totalMinutes,
      totalExerciseCount: payload.totalCount,
      muscleGroupCoverage: payload.muscles,
    }

    return { workout, name: payload.name }
  } catch {
    return null
  }
}

export function buildShareUrl(code: string): string {
  return `https://komplex01.co.uk/share/${code}`
}
