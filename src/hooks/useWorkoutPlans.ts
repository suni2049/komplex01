import { useState, useEffect, useCallback } from 'react'
import { getActiveWeekPlan, saveWorkoutPlan, saveWeekPlanConfig, deleteWeekPlan, markPlanWorkoutComplete, updateWorkoutPlan, getSettings } from '../store/storage'
import { regenerateSingleDay } from '../lib/weekPlanGenerator'
import type { WorkoutPlan, WeekPlanConfig } from '../types/workout'

export function useWorkoutPlans() {
  const [activePlan, setActivePlan] = useState<WorkoutPlan[] | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const plan = await getActiveWeekPlan()
    setActivePlan(plan)
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const savePlan = useCallback(async (config: WeekPlanConfig, plans: WorkoutPlan[]) => {
    await saveWeekPlanConfig(config)
    for (const plan of plans) {
      await saveWorkoutPlan(plan)
    }
    await reload()
  }, [reload])

  const markComplete = useCallback(async (planId: string, dayId: string, historyId: string) => {
    await markPlanWorkoutComplete(planId, dayId, historyId)
    await reload()
  }, [reload])

  const deletePlan = useCallback(async (planId: string) => {
    await deleteWeekPlan(planId)
    await reload()
  }, [reload])

  const regenerateDay = useCallback(async (
    plan: WorkoutPlan,
    allPlans: WorkoutPlan[],
    rotationStrategy: string
  ) => {
    const settings = await getSettings()
    const enableAI = settings.enableAICoach && !!settings.groqApiKey

    const regenerated = await regenerateSingleDay(plan, allPlans, rotationStrategy, enableAI)
    await updateWorkoutPlan(regenerated.id, regenerated)
    await reload()
  }, [reload])

  return { activePlan, loading, savePlan, markComplete, deletePlan, regenerateDay, reload }
}
