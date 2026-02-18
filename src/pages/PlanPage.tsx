import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutPlans } from '../hooks/useWorkoutPlans'
import { useSettings } from '../hooks/useSettings'
import { useSound } from '../hooks/useSound'
import { generateWeekPlan, ROTATIONS } from '../lib/weekPlanGenerator'
import WeekCalendar from '../components/plan/WeekCalendar'
import { cn } from '../utils/cn'
import { equipmentList } from '../data/equipment'
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

const FOCUS_COLORS: Record<string, string> = {
  push:        'text-red-400 border-red-500/40 bg-red-500/10',
  pull:        'text-blue-400 border-blue-500/40 bg-blue-500/10',
  legs:        'text-green-400 border-green-500/40 bg-green-500/10',
  core:        'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  cardio:      'text-purple-400 border-purple-500/40 bg-purple-500/10',
  balanced:    'text-primary-400 border-primary-500/40 bg-primary-500/10',
  flexibility: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
}

const DAY_ABBREVS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function PlanPage() {
  const navigate = useNavigate()
  const sound = useSound()
  const { settings } = useSettings()
  const { activePlan, loading, savePlan, deletePlan } = useWorkoutPlans()

  const [selectedStrategy, setSelectedStrategy] = useState<WeekRotationStrategy>('push-pull-legs')
  const [startDate, setStartDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [duration, setDuration] = useState<number>(settings.defaultDurationMinutes)
  const [equipmentOnly, setEquipmentOnly] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const hasEquipment = settings.equipment.filter(e => e !== 'none').length > 0

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
          difficulty: 'advanced',
          equipmentOnly: equipmentOnly && hasEquipment,
        },
        createdAt: new Date().toISOString(),
      }

      const enableAI = settings.enableAICoach && !!settings.groqApiKey
      const plans = await generateWeekPlan(config, enableAI)
      await savePlan(config, plans)
      setGenerating(false)
      sound.ready()
    }, 800)
  }, [startDate, selectedStrategy, duration, equipmentOnly, settings, hasEquipment, savePlan, sound])

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

  // Week preview derived from selected strategy
  const previewDays = ROTATIONS[selectedStrategy]

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
        <div className="grid grid-cols-5 gap-2">
          {[15, 30, 45, 60, 90].map(min => (
            <button
              key={min}
              onClick={() => { sound.click(); setDuration(min) }}
              className={cn(
                'px-3 py-2 border-2 transition-all font-mono text-xs font-bold',
                duration === min
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                  : 'border-surface-2 text-text-muted hover:border-surface-3'
              )}
            >
              {min}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Start Date Picker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
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

      {/* Equipment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-base p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-xs text-text-muted">
            <span className="text-primary-500">//</span> EQUIPMENT IN USE
          </h3>
          {hasEquipment && (
            <button
              onClick={() => { sound.click(); setEquipmentOnly(v => !v) }}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono tracking-wider border transition-all',
                equipmentOnly
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-surface-1 text-text-ghost border-surface-3 hover:border-primary-500/50'
              )}
            >
              <span className={cn(
                'w-3 h-3 border flex items-center justify-center text-[8px]',
                equipmentOnly ? 'border-white' : 'border-text-ghost'
              )}>
                {equipmentOnly && '✓'}
              </span>
              EQUIPMENT ONLY
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {equipmentList
            .filter(eq => settings.equipment.includes(eq.id) && eq.id !== 'none')
            .map(eq => (
              <div
                key={eq.id}
                className="flex items-center gap-1.5 px-2 py-1 border border-primary-500/30 bg-primary-500/5 text-text-secondary"
              >
                <span className="text-primary-500">{eq.icon}</span>
                <span className="font-mono text-[10px] font-bold">{eq.name}</span>
              </div>
            ))}
          {!hasEquipment && (
            <span className="font-mono text-[10px] text-text-muted">
              BODYWEIGHT ONLY — add equipment in Settings
            </span>
          )}
        </div>
        {equipmentOnly && hasEquipment && (
          <p className="font-mono text-[10px] text-primary-400 mt-2">
            Workouts will prioritize exercises that require your equipment
          </p>
        )}
      </motion.div>

      {/* Week Preview — shows actual day focuses for the selected strategy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card-base p-4 mb-6"
      >
        <h3 className="font-mono text-xs text-text-muted mb-3">
          <span className="text-primary-500">//</span> WEEK PREVIEW
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {previewDays.map((day, i) => {
            const colorClass = FOCUS_COLORS[day.focus] || FOCUS_COLORS.balanced
            return (
              <div key={i} className="text-center">
                <div className="text-[9px] font-mono text-text-muted mb-1.5 tracking-wider">
                  {DAY_ABBREVS[i]}
                </div>
                <div className={cn(
                  'py-1.5 px-0.5 border text-[8px] font-mono font-bold tracking-wide',
                  colorClass
                )}>
                  {day.label}
                </div>
              </div>
            )
          })}
        </div>
        <p className="font-mono text-[9px] text-text-muted mt-3 leading-relaxed">
          Recovery logic prevents overtraining the same muscle groups on consecutive days.
          Flexibility day uses a dedicated mobility and stretch circuit.
        </p>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
