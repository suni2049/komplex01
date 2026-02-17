import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/cn'
import { IconCheck } from '../icons/Icons'
import type { WorkoutPlan } from '../../types/workout'

interface WeekCalendarProps {
  plans: WorkoutPlan[]
  onStartWorkout: (plan: WorkoutPlan) => void
  onClearPlan: () => void
}

const FOCUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  push: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30', dot: 'bg-red-500' },
  pull: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30', dot: 'bg-blue-500' },
  legs: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30', dot: 'bg-green-500' },
  core: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30', dot: 'bg-yellow-500' },
  cardio: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30', dot: 'bg-purple-500' },
  balanced: { bg: 'bg-primary-500/10', text: 'text-primary-500', border: 'border-primary-500/30', dot: 'bg-primary-500' },
  flexibility: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/30', dot: 'bg-cyan-500' },
}

const DAY_HEADERS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function WeekCalendar({ plans, onStartWorkout, onClearPlan }: WeekCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const completedCount = plans.filter(p => p.isCompleted).length
  const totalCount = plans.length
  const progressPercent = (completedCount / totalCount) * 100

  const selectedPlan = plans.find(p => p.id === selectedDay)

  // Sort plans by scheduled date to ensure correct order
  const sortedPlans = [...plans].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.getDate().toString()
  }

  const getMonthYear = () => {
    if (sortedPlans.length === 0) return ''
    const first = new Date(sortedPlans[0].scheduledDate)
    const last = new Date(sortedPlans[sortedPlans.length - 1].scheduledDate)
    const firstMonth = first.toLocaleDateString('en-US', { month: 'long' })
    const lastMonth = last.toLocaleDateString('en-US', { month: 'long' })
    const year = first.getFullYear()
    if (firstMonth === lastMonth) return `${firstMonth} ${year}`
    return `${firstMonth} - ${lastMonth} ${year}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base p-4"
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-heading text-xl font-bold text-text-primary">
            WEEK PROTOCOL
          </h2>
          <span className="font-mono text-sm text-primary-500 font-bold">
            {completedCount}/{totalCount}
          </span>
        </div>
        <p className="font-mono text-[10px] text-text-muted mb-3">{getMonthYear()}</p>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-primary-500"
          />
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-base p-3"
      >
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_HEADERS.map(day => (
            <div key={day} className="text-center py-1">
              <span className="font-mono text-[9px] text-text-muted font-bold tracking-wider">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1">
          {sortedPlans.map((plan, index) => {
            const colors = FOCUS_COLORS[plan.focus] || FOCUS_COLORS.balanced
            const isSelected = selectedDay === plan.id
            const isToday = plan.scheduledDate === new Date().toISOString().split('T')[0]

            return (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setSelectedDay(isSelected ? null : plan.id)}
                className={cn(
                  'relative flex flex-col items-center p-2 rounded-lg border-2 transition-all min-h-[72px]',
                  isSelected
                    ? `${colors.border} ${colors.bg} ring-1 ring-primary-500/50`
                    : plan.isCompleted
                      ? 'border-surface-2 bg-surface-1/50 opacity-70'
                      : `border-surface-2 hover:${colors.border} hover:${colors.bg}`,
                  isToday && !isSelected && 'border-primary-500/40'
                )}
              >
                {/* Date number */}
                <span className={cn(
                  'font-mono text-sm font-bold mb-1',
                  isSelected ? colors.text : 'text-text-primary',
                  isToday && 'underline underline-offset-2'
                )}>
                  {formatDateShort(plan.scheduledDate)}
                </span>

                {/* Focus dot + label */}
                <div className="flex items-center gap-1">
                  <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
                  <span className={cn(
                    'font-mono text-[8px] font-bold uppercase',
                    isSelected ? colors.text : 'text-text-muted'
                  )}>
                    {plan.focus.length > 4 ? plan.focus.slice(0, 4) : plan.focus}
                  </span>
                </div>

                {/* Exercise count */}
                <span className="font-mono text-[8px] text-text-muted mt-0.5">
                  {plan.workout.totalExerciseCount}ex
                </span>

                {/* Completed checkmark */}
                {plan.isCompleted && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary-500 flex items-center justify-center">
                    <IconCheck className="w-2 h-2 text-white" />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Selected Day Detail Panel */}
      <AnimatePresence mode="wait">
        {selectedPlan && (
          <motion.div
            key={selectedPlan.id}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={cn(
              'card-base p-4 border-l-4',
              FOCUS_COLORS[selectedPlan.focus]?.border || 'border-primary-500/30'
            )}>
              {/* Day header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    {selectedPlan.dayLabel} — {formatDate(selectedPlan.scheduledDate)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      'inline-block px-2 py-0.5 text-[10px] font-mono font-bold border',
                      `${FOCUS_COLORS[selectedPlan.focus]?.bg || ''} ${FOCUS_COLORS[selectedPlan.focus]?.text || ''} ${FOCUS_COLORS[selectedPlan.focus]?.border || ''}`
                    )}>
                      {selectedPlan.focus.toUpperCase()}
                    </span>
                    <span className="font-mono text-[11px] text-text-muted">
                      {selectedPlan.workout.totalExerciseCount} exercises
                    </span>
                    <span className="font-mono text-[11px] text-text-muted">
                      {selectedPlan.workout.totalEstimatedMinutes} min
                    </span>
                  </div>
                </div>
                {selectedPlan.isCompleted && (
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <IconCheck className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Exercise list */}
              <div className="space-y-2 mb-4">
                {selectedPlan.workout.mainWorkout.blocks.map((block, idx) => (
                  <div key={idx}>
                    <p className="font-mono text-[10px] text-text-muted mb-1">
                      {block.name} — {block.rounds} {block.rounds === 1 ? 'round' : 'rounds'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      {block.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 py-0.5">
                          <div className={cn(
                            'w-1 h-1 rounded-full',
                            FOCUS_COLORS[ex.exercise.category]?.dot || 'bg-text-muted'
                          )} />
                          <span className="font-mono text-[11px] text-text-secondary truncate">
                            {ex.exercise.name}
                          </span>
                          <span className="font-mono text-[9px] text-text-muted ml-auto whitespace-nowrap">
                            {ex.reps
                              ? `${ex.reps}${ex.perSide ? '/side' : ''}`
                              : `${ex.durationSeconds}s`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Start button */}
              {!selectedPlan.isCompleted && (
                <button
                  onClick={() => onStartWorkout(selectedPlan)}
                  className="w-full btn-primary py-2.5 font-mono font-bold text-sm"
                >
                  START WORKOUT
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Plan Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center pt-2"
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
