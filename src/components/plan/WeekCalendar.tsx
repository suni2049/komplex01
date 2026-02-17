import { useState } from 'react'
import { motion } from 'framer-motion'
import PlanDayCard from './PlanDayCard'
import type { WorkoutPlan } from '../../types/workout'

interface WeekCalendarProps {
  plans: WorkoutPlan[]
  onStartWorkout: (plan: WorkoutPlan) => void
  onClearPlan: () => void
}

export default function WeekCalendar({ plans, onStartWorkout, onClearPlan }: WeekCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const completedCount = plans.filter(p => p.isCompleted).length
  const totalCount = plans.length
  const progressPercent = (completedCount / totalCount) * 100

  return (
    <div className="space-y-6">
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

        {/* Progress Bar */}
        <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-primary-500"
          />
        </div>
      </motion.div>

      {/* Day Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <PlanDayCard
              plan={plan}
              onStart={() => onStartWorkout(plan)}
              onExpand={() => setExpandedDay(expandedDay === plan.id ? null : plan.id)}
              isExpanded={expandedDay === plan.id}
            />
          </motion.div>
        ))}
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
