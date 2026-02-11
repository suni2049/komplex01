import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { computeWorkoutStats } from '../../lib/workoutStats'
import { useCountUp } from '../../hooks/useCountUp'
import { cn } from '../../utils/cn'
import StickFigure from '../stickfigure/StickFigure'
import { IconStarFilled } from '../icons/Icons'
import { useSound } from '../../hooks/useSound'
import type { GeneratedWorkout, CircuitBlock, WorkoutExercise } from '../../types/workout'

interface WorkoutPreviewProps {
  workout: GeneratedWorkout
  onRegenerate: () => void
  onStart: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

function StatCard({ value, label, unit, delay }: { value: number; label: string; unit?: string; delay: number }) {
  const display = useCountUp(value, 1200, delay)
  return (
    <div className="card-base p-2.5 text-center">
      <p className="text-lg font-mono font-bold text-primary-500 leading-none">
        {display}
        {unit && <span className="text-[10px] text-text-ghost ml-0.5">{unit}</span>}
      </p>
      <p className="text-[9px] font-mono text-text-ghost mt-1 tracking-wider uppercase">{label}</p>
    </div>
  )
}

function TimedStatCard({ seconds, delay }: { seconds: number; delay: number }) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const displayMin = useCountUp(mins, 1200, delay)
  const displaySec = useCountUp(secs, 1200, delay)
  return (
    <div className="card-base p-2.5 text-center">
      <p className="text-lg font-mono font-bold text-primary-500 leading-none">
        {displayMin}<span className="text-[10px] text-text-ghost">m</span>{' '}
        {displaySec}<span className="text-[10px] text-text-ghost">s</span>
      </p>
      <p className="text-[9px] font-mono text-text-ghost mt-1 tracking-wider uppercase">TIMED WORK</p>
    </div>
  )
}

function MuscleBar({ muscle, percentage, index }: { muscle: string; percentage: number; index: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-text-secondary uppercase w-20 shrink-0 truncate">
        {muscle.replace(/-/g, ' ')}
      </span>
      <div className="flex-1 h-2 bg-surface-2 relative overflow-hidden">
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 bg-primary-500',
            percentage > 60 ? 'opacity-100' : percentage > 30 ? 'opacity-70' : 'opacity-40'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.4 + index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
      <span className="text-[10px] font-mono text-text-ghost w-8 text-right">{percentage}%</span>
    </div>
  )
}

export default function WorkoutPreview({ workout, onRegenerate, onStart }: WorkoutPreviewProps) {
  const stats = useMemo(() => computeWorkoutStats(workout), [workout])
  const sound = useSound()

  const phases = [
    { phase: workout.warmUp, color: 'bg-accent-500' },
    { phase: workout.mainWorkout, color: 'bg-primary-500' },
    { phase: workout.coolDown, color: 'bg-khaki' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-6 space-y-4"
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="card-base p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold text-primary-500 tracking-wider uppercase flex items-center gap-2">
            <IconStarFilled className="w-4 h-4" /> TRAINING PROTOCOL
          </h2>
          <span className="text-xs text-text-muted font-mono">
            ~{workout.totalEstimatedMinutes} MIN
          </span>
        </div>

        {/* Decorative divider */}
        <div className="mt-2 h-px bg-surface-3 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-1.5">
        <StatCard value={workout.totalExerciseCount} label="EXERCISES" delay={200} />
        <StatCard value={stats.totalReps} label="TOTAL REPS" delay={280} />
        <TimedStatCard seconds={stats.totalTimedSeconds} delay={360} />
        <StatCard value={stats.intensityScore} label="INTENSITY" unit="/100" delay={440} />
        <StatCard value={workout.totalEstimatedMinutes} label="DURATION" unit="MIN" delay={520} />
        <StatCard value={workout.mainWorkout.blocks.length} label={workout.config.grouping === 'sequential' ? 'EXERCISES' : 'CIRCUITS'} delay={600} />
      </motion.div>

      {/* ── Muscle Coverage ── */}
      <motion.div variants={itemVariants} className="card-base p-4">
        <p className="section-header mb-3">// MUSCLE COVERAGE</p>
        <div className="space-y-1.5">
          {stats.muscleBreakdown.map((m, i) => (
            <MuscleBar key={m.muscle} muscle={m.muscle} percentage={m.percentage} index={i} />
          ))}
        </div>
      </motion.div>

      {/* ── Difficulty Distribution ── */}
      <motion.div variants={itemVariants} className="flex gap-2">
        <div className="flex-1 bg-surface-2 border border-surface-3 px-2 py-1.5 text-center">
          <span className="text-[10px] font-mono text-success-400">
            RECRUIT: {stats.difficultyDistribution.beginner}
          </span>
        </div>
        <div className="flex-1 bg-surface-2 border border-surface-3 px-2 py-1.5 text-center">
          <span className="text-[10px] font-mono text-accent-500">
            SOLDIER: {stats.difficultyDistribution.intermediate}
          </span>
        </div>
        <div className="flex-1 bg-surface-2 border border-surface-3 px-2 py-1.5 text-center">
          <span className="text-[10px] font-mono text-primary-500">
            OPERATOR: {stats.difficultyDistribution.advanced}
          </span>
        </div>
      </motion.div>

      {/* ── Phase Summary ── */}
      <motion.div variants={itemVariants} className="card-base p-4">
        <p className="section-header mb-3">// PHASE BREAKDOWN</p>
        <div className="space-y-2">
          {phases.map(({ phase, color }) => (
            <div key={phase.name} className="flex items-center gap-3">
              <div className={cn('w-2 h-2 shrink-0', color)} />
              <span className="text-xs font-heading font-bold flex-1 text-text-primary uppercase tracking-wider">
                {phase.name}
              </span>
              <span className="text-[10px] text-text-muted font-mono">
                {phase.blocks.reduce((s, b) => s + b.exercises.length, 0)} EX
              </span>
              <span className="text-[10px] text-text-ghost font-mono">{phase.estimatedMinutes}M</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Circuit Detail ── */}
      <motion.div variants={itemVariants} className="card-base p-4">
        <p className="section-header mb-3">// {workout.config.grouping === 'sequential' ? 'EXERCISE INTEL' : 'CIRCUIT INTEL'}</p>
        <div className="space-y-4">
          {workout.mainWorkout.blocks.map((block: CircuitBlock) => {
            const muscles = stats.circuitMuscles.get(block.name) || []
            return (
              <div key={block.name}>
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[10px] font-heading font-bold text-primary-500 tracking-wider uppercase">
                    {block.name} ({block.rounds}X)
                  </p>
                </div>

                {muscles.length > 0 && (
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {muscles.map(m => (
                      <span
                        key={m}
                        className="bg-surface-2 text-text-muted px-1 py-0.5 text-[9px] font-mono uppercase border border-surface-3"
                      >
                        {m.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {block.exercises.map((we: WorkoutExercise) => (
                  <div key={we.exercise.id} className="flex items-center gap-2 ml-3 mb-1">
                    <div className="shrink-0 w-7 h-7 border border-surface-3 bg-surface-0 flex items-center justify-center overflow-hidden">
                      <StickFigure
                        animationId={we.exercise.animationId}
                        playing={false}
                        size={24}
                      />
                    </div>
                    <span className="text-xs text-text-secondary font-mono truncate flex-1">
                      {we.exercise.name}
                    </span>
                    <span className="text-[10px] text-text-ghost font-mono shrink-0">
                      {we.reps
                        ? `${we.reps}${we.perSide ? ' EA' : ''}`
                        : `${we.durationSeconds}S`}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Action Buttons ── */}
      <motion.div variants={itemVariants} className="flex gap-2">
        <button
          onClick={() => { sound.click(); onRegenerate() }}
          className="flex-1 py-3 text-xs font-heading font-bold tracking-wider bg-surface-2 text-text-secondary border border-surface-3 hover:border-primary-500 transition uppercase"
        >
          REGENERATE
        </button>
        <motion.button
          onClick={() => { sound.commence(); onStart() }}
          whileTap={{ scale: 0.97 }}
          className="flex-[2] py-3 text-xs font-heading font-bold tracking-wider bg-primary-600 text-white border border-primary-500 uppercase flex items-center justify-center gap-2 animate-glow-pulse-lg"
        >
          <IconStarFilled className="w-3 h-3" /> COMMENCE
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
