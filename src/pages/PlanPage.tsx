import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutPlans } from '../hooks/useWorkoutPlans'
import { useSettings } from '../hooks/useSettings'
import { useSound } from '../hooks/useSound'
import { generateWeekPlan } from '../lib/weekPlanGenerator'
import WeekCalendar from '../components/plan/WeekCalendar'
import { cn } from '../utils/cn'
import type { WeekRotationStrategy } from '../types/workout'

const ROTATION_STRATEGIES: { value: WeekRotationStrategy; label: string; description: string }[] = [
  {
    value: 'push-pull-legs',
    label: 'PUSH-PULL-LEGS',
    description: 'Classic split: Push muscles, pull muscles, legs. Ideal for focused muscle building.',
  },
  {
    value: 'upper-lower-full',
    label: 'UPPER-LOWER-FULL',
    description: 'Upper body, lower body, and full body days. Balanced frequency and recovery.',
  },
  {
    value: 'balanced',
    label: 'BALANCED',
    description: 'Full body workouts every day with varied intensity. Great for general fitness.',
  },
]

export default function PlanPage() {
  const navigate = useNavigate()
  const sound = useSound()
  const { settings } = useSettings()
  const { activePlan, loading, savePlan, deletePlan } = useWorkoutPlans()

  const [selectedStrategy, setSelectedStrategy] = useState<WeekRotationStrategy>('push-pull-legs')
  const [startDate, setStartDate] = useState<string>(() => {
    // Default to today
    return new Date().toISOString().split('T')[0]
  })
  const [duration, setDuration] = useState<number>(settings.defaultDurationMinutes)
  const [generating, setGenerating] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleGenerate = useCallback(() => {
    sound.generate()
    setGenerating(true)

    setTimeout(async () => {
      const planId = `plan-${Date.now()}`
      const config = {
        planId,
        startDate,
        rotationStrategy: selectedStrategy,
        baseConfig: {
          totalMinutes: duration,
          availableEquipment: settings.equipment,
          difficulty: settings.defaultDifficulty,
        },
        createdAt: new Date().toISOString(),
      }

      const enableAI = settings.enableAICoach && !!settings.groqApiKey
      const plans = await generateWeekPlan(config, enableAI)
      await savePlan(config, plans)
      setGenerating(false)
      sound.ready()
    }, 800)
  }, [startDate, selectedStrategy, duration, settings, savePlan, sound])

  const handleStartWorkout = useCallback((plan: any) => {
    sound.commence()
    sessionStorage.setItem('activeWorkout', JSON.stringify(plan.workout))
    sessionStorage.setItem('activePlanContext', JSON.stringify({
      planId: plan.planId,
      dayId: plan.id
    }))
    navigate('/workout')
  }, [navigate, sound])

  const handleClearPlan = useCallback(async () => {
    if (!activePlan || activePlan.length === 0) return

    if (!showClearConfirm) {
      setShowClearConfirm(true)
      return
    }

    sound.click()
    await deletePlan(activePlan[0].planId)
    setShowClearConfirm(false)
  }, [activePlan, deletePlan, sound, showClearConfirm])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-sm text-text-muted">LOADING...</p>
      </div>
    )
  }

  // Active Plan View
  if (activePlan && activePlan.length > 0) {
    return (
      <div className="px-4 pt-10 pb-6">
        <WeekCalendar
          plans={activePlan}
          onStartWorkout={handleStartWorkout}
          onClearPlan={handleClearPlan}
        />

        {/* Clear Confirmation Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setShowClearConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card-base p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                  CLEAR WEEK PLAN?
                </h3>
                <p className="text-sm text-text-muted mb-6">
                  This will delete all workouts in the current plan. Completed workouts will remain in your history.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 btn-secondary py-2 font-mono text-sm"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleClearPlan}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 font-mono text-sm font-bold"
                  >
                    CLEAR
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Empty State - Generation UI
  return (
    <div className="px-4 pt-10 pb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-block border-2 border-primary-500 px-4 py-1 mb-2">
          <h1 className="font-heading text-2xl font-bold tracking-wider text-primary-500">
            WEEK PROTOCOL
          </h1>
        </div>
        <p className="font-mono text-xs text-text-muted">
          GENERATE 7 DAYS OF OPTIMIZED TRAINING
        </p>
      </motion.div>

      {/* Rotation Strategy Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <label className="section-header mb-3">ROTATION STRATEGY</label>
        <div className="space-y-2">
          {ROTATION_STRATEGIES.map((strategy) => (
            <button
              key={strategy.value}
              onClick={() => { sound.click(); setSelectedStrategy(strategy.value) }}
              className={cn(
                'w-full text-left p-4 border-2 transition-all',
                selectedStrategy === strategy.value
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-surface-2 hover:border-surface-3'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-sm font-bold text-text-primary">
                  {strategy.label}
                </span>
                {selectedStrategy === strategy.value && (
                  <span className="w-4 h-4 rounded-full bg-primary-500" />
                )}
              </div>
              <p className="text-[11px] text-text-muted">
                {strategy.description}
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Workout Duration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <label className="section-header mb-3">WORKOUT DURATION: {duration} MIN</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="15"
            max="90"
            step="15"
            value={duration}
            onChange={(e) => { sound.click(); setDuration(Number(e.target.value)) }}
            className="flex-1 h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex gap-2">
            {[15, 30, 45, 60, 90].map(min => (
              <button
                key={min}
                onClick={() => { sound.click(); setDuration(min) }}
                className={cn(
                  'px-2 py-1 text-[10px] font-mono border transition-all',
                  duration === min
                    ? 'border-primary-500 bg-primary-500/20 text-primary-500'
                    : 'border-surface-2 text-text-muted hover:border-surface-3'
                )}
              >
                {min}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Start Date Picker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <label className="section-header mb-3">START DATE</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-4 py-3 bg-surface-1 border-2 border-surface-2 text-text-primary font-mono text-sm focus:border-primary-500 focus:outline-none"
        />
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-base p-4 mb-6"
      >
        <h3 className="font-mono text-xs text-text-muted mb-3">WEEK PREVIEW:</h3>
        <div className="grid grid-cols-7 gap-2">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
            <div key={day} className="text-center">
              <div className="text-[9px] font-mono text-text-muted mb-1">{day}</div>
              <div className="w-2 h-2 mx-auto rounded-full bg-primary-500/50" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full btn-primary py-4 font-mono font-bold text-lg disabled:opacity-50"
        >
          {generating ? 'GENERATING...' : 'GENERATE WEEK PLAN'}
        </button>
      </motion.div>
    </div>
  )
}
