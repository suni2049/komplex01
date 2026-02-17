import { generateWorkout, enhanceWorkoutWithAI } from './workoutGenerator'
import type { WorkoutPlan, WeekPlanConfig, WorkoutConfig, GeneratedWorkout } from '../types/workout'
import type { MuscleGroup, ExerciseCategory } from '../types/exercise'

interface DayConfig {
  focus: ExerciseCategory | 'balanced' | 'flexibility'
  targetMuscles: MuscleGroup[]
  emphasizeCardio?: boolean
}

// Rotation strategies define focus and target muscles for each day
const ROTATIONS: Record<string, DayConfig[]> = {
  'push-pull-legs': [
    { focus: 'push', targetMuscles: ['chest', 'shoulders', 'triceps'] },
    { focus: 'pull', targetMuscles: ['upper-back', 'lats', 'biceps'] },
    { focus: 'legs', targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
    { focus: 'push', targetMuscles: ['shoulders', 'triceps', 'chest'] },
    { focus: 'pull', targetMuscles: ['lats', 'upper-back', 'biceps'] },
    { focus: 'legs', targetMuscles: ['glutes', 'quads', 'hamstrings'] },
    { focus: 'flexibility', targetMuscles: [] }, // Stretch-only day
  ],
  'upper-lower-full': [
    { focus: 'push', targetMuscles: ['chest', 'shoulders', 'triceps', 'upper-back'] }, // Upper
    { focus: 'legs', targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'] }, // Lower
    { focus: 'core', targetMuscles: ['core', 'obliques'], emphasizeCardio: true }, // Active recovery
    { focus: 'push', targetMuscles: ['shoulders', 'chest', 'upper-back', 'biceps'] }, // Upper
    { focus: 'legs', targetMuscles: ['glutes', 'hamstrings', 'quads'] }, // Lower
    { focus: 'balanced', targetMuscles: [] }, // Full body
    { focus: 'flexibility', targetMuscles: [] },
  ],
  'balanced': [
    { focus: 'balanced', targetMuscles: [] },
    { focus: 'balanced', targetMuscles: [] },
    { focus: 'core', targetMuscles: ['core', 'obliques'], emphasizeCardio: true },
    { focus: 'balanced', targetMuscles: [] },
    { focus: 'balanced', targetMuscles: [] },
    { focus: 'balanced', targetMuscles: [] },
    { focus: 'flexibility', targetMuscles: [] },
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

    // Avoid muscles worked in previous 48 hours
    if (i >= 2) {
      const recentMuscles = new Set<MuscleGroup>()
      plans.slice(i - 2, i).forEach(plan => {
        Object.keys(plan.workout.muscleGroupCoverage).forEach(m =>
          recentMuscles.add(m as MuscleGroup)
        )
      })
      workoutConfig.avoidMuscles = Array.from(recentMuscles)
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

export async function regenerateSingleDay(
  existingPlan: WorkoutPlan,
  allPlansInWeek: WorkoutPlan[],
  rotationStrategy: string,
  enableAI: boolean = false
): Promise<WorkoutPlan> {
  const rotation = ROTATIONS[rotationStrategy]
  // Note: existingPlan.config already has the correct focus and target muscles from the rotation

  // Calculate muscles to avoid from previous 2 days
  const previousDays = allPlansInWeek
    .filter(p => p.dayOfWeek < existingPlan.dayOfWeek && p.dayOfWeek >= existingPlan.dayOfWeek - 2)

  const recentMuscles = new Set<MuscleGroup>()
  previousDays.forEach(plan => {
    Object.keys(plan.workout.muscleGroupCoverage).forEach(m =>
      recentMuscles.add(m as MuscleGroup)
    )
  })

  const workoutConfig: WorkoutConfig = {
    ...existingPlan.config,
    avoidMuscles: Array.from(recentMuscles),
    // Exclude previous workout's exercises for variety
    excludeExerciseIds: existingPlan.workout.mainWorkout.blocks
      .flatMap(b => b.exercises.map(e => e.exercise.id))
  }

  let workout: GeneratedWorkout = generateWorkout(workoutConfig)

  if (enableAI) {
    try {
      const enhanced = await enhanceWorkoutWithAI(workout)
      if (enhanced) workout = enhanced
    } catch (error) {
      console.warn('AI enhancement failed for regeneration', error)
    }
  }

  return {
    ...existingPlan,
    workout,
    regeneratedCount: (existingPlan.regeneratedCount || 0) + 1,
    lastRegeneratedAt: new Date().toISOString(),
    previousWorkoutId: existingPlan.workout.id,
  }
}
