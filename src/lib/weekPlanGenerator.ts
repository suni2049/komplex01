import { generateWorkout, enhanceWorkoutWithAI } from './workoutGenerator'
import type { WorkoutPlan, WeekPlanConfig, WorkoutConfig, GeneratedWorkout } from '../types/workout'
import type { MuscleGroup, ExerciseCategory } from '../types/exercise'

export interface DayConfig {
  focus: ExerciseCategory | 'balanced' | 'flexibility'
  label: string
  targetMuscles: MuscleGroup[]
  emphasizeCardio?: boolean
}

// Core and obliques appear as secondary muscles in almost every exercise.
// Never add them to avoidMuscles or the eligible exercise pool collapses.
const NEVER_AVOID = new Set<MuscleGroup>(['core', 'obliques'])

// Rotation strategies define focus and target muscles for each day
export const ROTATIONS: Record<string, DayConfig[]> = {
  'push-pull-legs': [
    { focus: 'push',        label: 'PUSH',  targetMuscles: ['chest', 'shoulders', 'triceps'] },
    { focus: 'pull',        label: 'PULL',  targetMuscles: ['upper-back', 'lats', 'biceps'] },
    { focus: 'legs',        label: 'LEGS',  targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
    { focus: 'push',        label: 'PUSH',  targetMuscles: ['shoulders', 'triceps', 'chest'] },
    { focus: 'pull',        label: 'PULL',  targetMuscles: ['lats', 'upper-back', 'biceps'] },
    { focus: 'legs',        label: 'LEGS',  targetMuscles: ['glutes', 'quads', 'hamstrings'] },
    { focus: 'flexibility', label: 'FLEX',  targetMuscles: [] },
  ],
  'upper-lower-full': [
    { focus: 'push',        label: 'UPPER', targetMuscles: ['chest', 'shoulders', 'triceps', 'upper-back'] },
    { focus: 'legs',        label: 'LOWER', targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
    { focus: 'core',        label: 'ACTIV', targetMuscles: ['core', 'obliques'], emphasizeCardio: true },
    { focus: 'push',        label: 'UPPER', targetMuscles: ['shoulders', 'chest', 'upper-back', 'biceps'] },
    { focus: 'legs',        label: 'LOWER', targetMuscles: ['glutes', 'hamstrings', 'quads'] },
    { focus: 'balanced',    label: 'FULL',  targetMuscles: [] },
    { focus: 'flexibility', label: 'FLEX',  targetMuscles: [] },
  ],
  'balanced': [
    { focus: 'balanced',    label: 'FULL',  targetMuscles: [] },
    { focus: 'balanced',    label: 'FULL',  targetMuscles: [] },
    { focus: 'core',        label: 'CORE',  targetMuscles: ['core', 'obliques'], emphasizeCardio: true },
    { focus: 'balanced',    label: 'FULL',  targetMuscles: [] },
    { focus: 'balanced',    label: 'FULL',  targetMuscles: [] },
    { focus: 'balanced',    label: 'FULL',  targetMuscles: [] },
    { focus: 'flexibility', label: 'FLEX',  targetMuscles: [] },
  ],
}

export async function generateWeekPlan(
  config: WeekPlanConfig,
  enableAI: boolean = false
): Promise<WorkoutPlan[]> {
  const rotation = ROTATIONS[config.rotationStrategy]
  const plans: WorkoutPlan[] = []
  const startDate = new Date(config.startDate)

  for (let i = 0; i < 7; i++) {
    const dayConfig = rotation[i]
    const scheduledDate = new Date(startDate)
    scheduledDate.setDate(startDate.getDate() + i)

    // For flexibility day, use reduced duration
    const workoutConfig: WorkoutConfig = {
      ...config.baseConfig,
      focus: dayConfig.focus as ExerciseCategory | 'balanced',
      targetMuscles: dayConfig.targetMuscles,
      emphasizeCardio: dayConfig.emphasizeCardio,
      totalMinutes: dayConfig.focus === 'flexibility' ? 30 : config.baseConfig.totalMinutes,
    }

    // Build avoidMuscles from the declared targetMuscles of the previous two days.
    // Using targetMuscles (from ROTATIONS) is far more reliable than computing coverage:
    // - Coverage from muscleGroupCoverage is contaminated by warm-up exercises that
    //   are drawn from a universal pool (squats, high-knees, lateral lunges appear on
    //   PUSH days and falsely add quads/glutes to avoidMuscles, crippling leg days)
    // - targetMuscles precisely reflects the training intent of each day
    // - For balanced days where targetMuscles=[], no muscles are added → no restriction
    // Skip flexibility days — stretching aids recovery and should be unrestricted.
    if (i >= 2 && dayConfig.focus !== 'flexibility') {
      const recentMuscles = new Set<MuscleGroup>()
      plans.slice(i - 2, i).forEach(plan => {
        const targets = plan.config.targetMuscles ?? []
        targets.forEach(m => {
          if (!NEVER_AVOID.has(m as MuscleGroup)) {
            recentMuscles.add(m as MuscleGroup)
          }
        })
      })
      if (recentMuscles.size > 0) {
        workoutConfig.avoidMuscles = Array.from(recentMuscles)
      }
    }

    let workout: GeneratedWorkout = generateWorkout(workoutConfig)

    // Enhance with AI if enabled (for personalized stretches)
    if (enableAI) {
      try {
        const enhanced = await enhanceWorkoutWithAI(workout)
        if (enhanced) workout = enhanced
      } catch (error) {
        // Silently continue with non-enhanced workout if AI fails
        console.warn('AI enhancement failed for day', i + 1, error)
      }
    }

    plans.push({
      id: `${config.planId}-day${i}`,
      planId: config.planId,
      createdAt: new Date().toISOString(),
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      dayOfWeek: scheduledDate.getDay(),
      dayLabel: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][scheduledDate.getDay()],
      workout,
      isCompleted: false,
      config: workoutConfig,
      focus: dayConfig.focus,
    })
  }

  return plans
}
