import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { IconCheck } from '../icons/Icons'
import type { WorkoutPlan } from '../../types/workout'

interface PlanDayCardProps {
  plan: WorkoutPlan
  onStart: () => void
  onExpand?: () => void
  isExpanded?: boolean
}

const FOCUS_COLORS: Record<string, string> = {
  push: 'bg-red-500/20 text-red-500 border-red-500',
  pull: 'bg-blue-500/20 text-blue-500 border-blue-500',
  legs: 'bg-green-500/20 text-green-500 border-green-500',
  core: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
  cardio: 'bg-purple-500/20 text-purple-500 border-purple-500',
  balanced: 'bg-primary-500/20 text-primary-500 border-primary-500',
  flexibility: 'bg-cyan-500/20 text-cyan-500 border-cyan-500',
}

export default function PlanDayCard({ plan, onStart, onExpand, isExpanded }: PlanDayCardProps) {
  const focusColor = FOCUS_COLORS[plan.focus] || FOCUS_COLORS.balanced

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'card-base p-4 cursor-pointer transition-all',
        plan.isCompleted && 'opacity-75',
        isExpanded && 'ring-2 ring-primary-500'
      )}
      onClick={onExpand}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-text-primary">
            {plan.dayLabel}
          </h3>
          <p className="font-mono text-[10px] text-text-muted">
            {formatDate(plan.scheduledDate)}
          </p>
        </div>

        {plan.isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center"
          >
            <IconCheck className="w-5 h-5 text-white" />
          </motion.div>
        ) : null}
      </div>

      {/* Focus Badge */}
      <div className="mb-3">
        <span
          className={cn(
            'inline-block px-2 py-0.5 text-[10px] font-mono font-bold border',
            focusColor
          )}
        >
          {plan.focus.toUpperCase()}
        </span>
      </div>

      {/* Workout Stats */}
      <div className="flex items-center gap-3 mb-3 text-[11px] font-mono text-text-muted">
        <span>{plan.workout.totalExerciseCount} EXERCISES</span>
        <span>•</span>
        <span>{plan.workout.totalEstimatedMinutes} MIN</span>
      </div>

      {/* Expanded View - Exercise List */}
      {isExpanded && !plan.isCompleted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-surface-2 pt-3 mt-3"
        >
          <p className="text-[10px] font-mono text-text-muted mb-2">EXERCISES:</p>
          <div className="space-y-1 mb-4">
            {plan.workout.mainWorkout.blocks.slice(0, 2).map((block, idx) => (
              <div key={idx} className="text-[10px] font-mono text-text-secondary">
                {block.exercises.slice(0, 3).map((ex, i) => (
                  <div key={i}>• {ex.exercise.name}</div>
                ))}
                {block.exercises.length > 3 && (
                  <div className="text-text-muted">
                    + {block.exercises.length - 3} more
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      {!plan.isCompleted && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStart()
          }}
          className="w-full btn-primary py-2 text-sm font-mono font-bold"
        >
          START
        </button>
      )}
    </motion.div>
  )
}
