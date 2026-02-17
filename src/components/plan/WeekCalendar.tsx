import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlanDayCard from './PlanDayCard'
import { useWorkoutPlans } from '../../hooks/useWorkoutPlans'
import { useSound } from '../../hooks/useSound'
import { getWeekPlanConfig } from '../../store/storage'
import type { WorkoutPlan } from '../../types/workout'

interface WeekCalendarProps {
  plans: WorkoutPlan[]
  onStartWorkout: (plan: WorkoutPlan) => void
  onClearPlan: () => void
}

export default function WeekCalendar({ plans, onStartWorkout, onClearPlan }: WeekCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [overview, setOverview] = useState<string | null>(null)
  const [rotationStrategy, setRotationStrategy] = useState<string>('')
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const { regenerateDay } = useWorkoutPlans()
  const sound = useSound()

  // Load AI overview and rotation strategy
  useEffect(() => {
    if (plans.length > 0) {
      getWeekPlanConfig(plans[0].planId).then(config => {
        if (config?.aiOverview) setOverview(config.aiOverview)
        if (config?.rotationStrategy) setRotationStrategy(config.rotationStrategy)
      })
    }
  }, [plans])

  const completedCount = plans.filter(p => p.isCompleted).length
  const totalCount = plans.length
  const progressPercent = (completedCount / totalCount) * 100

  // Identify current day
  const today = new Date().toISOString().split('T')[0]
  const currentDayId = plans.find(p => p.scheduledDate === today)?.id

  const handleRegenerate = useCallback(async (plan: WorkoutPlan) => {
    setRegeneratingId(plan.id)
    sound.click()

    try {
      await regenerateDay(plan, plans, rotationStrategy)
      sound.ready()
    } catch (error) {
      console.error('Regeneration failed:', error)
    } finally {
      setRegeneratingId(null)
    }
  }, [plans, regenerateDay, rotationStrategy, sound])

  return (
    <div className="space-y-6">
      {/* AI Overview Section */}
      <AnimatePresence mode="wait">
        {overview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="card-base p-4 stripe-red overflow-hidden"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="section-header">// WEEK OVERVIEW</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="px-2 py-0.5 bg-accent-500/20 border border-accent-500 text-[9px] font-mono text-accent-500"
              >
                AI ANALYSIS
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-text-secondary leading-relaxed font-mono"
            >
              {overview}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-xl font-bold text-text-primary">
            WEEK PROTOCOL
          </h2>
          <span className="font-mono text-sm text-primary-500 font-bold">
            {completedCount}/{totalCount} COMPLETE
          </span>
        </div>

        <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-primary-500"
          />
        </div>
      </motion.div>

      {/* Calendar Grid - 7 COLUMN LAYOUT */}
      <div>
        {/* Day labels row - hidden on mobile */}
        <div className="hidden md:grid grid-cols-7 gap-2 lg:gap-3 mb-2">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
            <div key={day} className="text-center">
              <span className="text-[10px] font-mono text-text-muted tracking-wider">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Day cards - 7 columns on desktop, single column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 md:gap-2 lg:gap-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
              className={expandedDay === plan.id ? 'md:col-span-7' : ''}
            >
              <PlanDayCard
                plan={plan}
                onStart={() => onStartWorkout(plan)}
                onExpand={() => setExpandedDay(expandedDay === plan.id ? null : plan.id)}
                isExpanded={expandedDay === plan.id}
                isToday={plan.id === currentDayId}
                onRegenerate={plan.isCompleted ? undefined : () => handleRegenerate(plan)}
                isRegenerating={regeneratingId === plan.id}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Clear Plan Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <button
          onClick={onClearPlan}
          className="px-6 py-2 border-2 border-surface-2 text-text-muted font-mono text-sm hover:border-red-500 hover:text-red-500 transition-all"
        >
          CLEAR PLAN
        </button>
      </motion.div>
    </div>
  )
}
