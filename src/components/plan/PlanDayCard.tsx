import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/cn'
import { IconCheck } from '../icons/Icons'
import type { WorkoutPlan } from '../../types/workout'

interface PlanDayCardProps {
  plan: WorkoutPlan
  onStart: () => void
  onExpand?: () => void
  isExpanded?: boolean
  isToday?: boolean          // NEW: Highlight current day
  onRegenerate?: () => void  // NEW: Regenerate callback
  isRegenerating?: boolean   // NEW: Loading state
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

export default function PlanDayCard({
  plan,
  onStart,
  onExpand,
  isExpanded,
  isToday = false,
  onRegenerate,
  isRegenerating = false
}: PlanDayCardProps) {
  const focusColor = FOCUS_COLORS[plan.focus] || FOCUS_COLORS.balanced

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRegenerate) onRegenerate()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'card-base p-3 md:p-4 cursor-pointer transition-all relative',
        plan.isCompleted && 'opacity-75',
        isExpanded && 'ring-2 ring-primary-500',
        isToday && !plan.isCompleted && 'ring-2 ring-accent-500 shadow-lg shadow-accent-500/20'
      )}
      onClick={onExpand}
    >
      {/* Today badge */}
      {isToday && !plan.isCompleted && (
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent-500 text-[9px] font-mono font-bold text-surface-0 z-10"
        >
          TODAY
        </motion.div>
      )}

      {/* Regeneration badge */}
      {plan.regeneratedCount && plan.regeneratedCount > 0 && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-surface-3 border border-primary-500 flex items-center justify-center">
          <span className="text-[8px] font-mono text-primary-500 font-bold">
            {plan.regeneratedCount}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div>
          <h3 className="font-heading text-base md:text-lg font-bold text-text-primary">
            {plan.dayLabel}
          </h3>
          <p className="font-mono text-[9px] md:text-[10px] text-text-muted">
            {formatDate(plan.scheduledDate)}
          </p>
        </div>

        {plan.isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary-500 flex items-center justify-center"
          >
            <IconCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </motion.div>
        )}
      </div>

      {/* Focus Badge */}
      <div className="mb-2 md:mb-3">
        <span
          className={cn(
            'inline-block px-2 py-0.5 text-[9px] md:text-[10px] font-mono font-bold border',
            focusColor
          )}
        >
          {plan.focus.toUpperCase()}
        </span>
      </div>

      {/* Workout Stats */}
      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 text-[10px] md:text-[11px] font-mono text-text-muted">
        <span>{plan.workout.totalExerciseCount} EX</span>
        <span>•</span>
        <span>{plan.workout.totalEstimatedMinutes} MIN</span>
      </div>

      {/* Expanded View - Exercise List */}
      <AnimatePresence>
        {isExpanded && !plan.isCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-surface-2 pt-3 mt-3 overflow-hidden"
          >
            <p className="text-[10px] font-mono text-text-muted mb-2">EXERCISES:</p>
            <div className="space-y-1 mb-4">
              {plan.workout.mainWorkout.blocks.slice(0, 2).map((block, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="text-[10px] font-mono text-text-secondary"
                >
                  {block.exercises.slice(0, 3).map((ex, i) => (
                    <div key={i}>• {ex.exercise.name}</div>
                  ))}
                  {block.exercises.length > 3 && (
                    <div className="text-text-muted">
                      + {block.exercises.length - 3} more
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Regenerate Button */}
            {onRegenerate && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="w-full mb-2 py-2 border-2 border-surface-3 text-text-muted font-mono text-xs hover:border-accent-500 hover:text-accent-500 transition-all disabled:opacity-50"
              >
                {isRegenerating ? 'REGENERATING...' : 'REGENERATE DAY'}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      {!plan.isCompleted && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation()
            onStart()
          }}
          className="w-full btn-primary py-2 text-xs md:text-sm font-mono font-bold"
        >
          START
        </motion.button>
      )}
    </motion.div>
  )
}
