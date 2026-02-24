import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { decodeWorkout } from '../lib/workoutSharing'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { generateId } from '../utils/id'
import type { GeneratedWorkout, WorkoutHistoryEntry } from '../types/workout'
import { IconBullet, IconStarFilled, IconCheck } from '../components/icons/Icons'

export default function SharedWorkoutPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { save } = useWorkoutHistory()

  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null)
  const [workoutName, setWorkoutName] = useState<string | undefined>()
  const [invalid, setInvalid] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!code) { setInvalid(true); return }
    const result = decodeWorkout(code)
    if (!result) { setInvalid(true); return }
    setWorkout(result.workout)
    setWorkoutName(result.name)
  }, [code])

  async function handleSave() {
    if (!workout || saving) return
    setSaving(true)
    const now = new Date().toISOString()
    const entry: WorkoutHistoryEntry = {
      id: generateId(),
      name: workoutName,
      createdAt: now,
      completedAt: now,
      workout,
      actualDurationSeconds: 0,
      exercisesCompleted: workout.totalExerciseCount,
      exercisesSkipped: 0,
      isFavorite: true,
      isTemplate: true,
    }
    await save(entry)
    setSaved(true)
    setSaving(false)
  }

  if (invalid) {
    return (
      <div className="px-4 pt-16 pb-6 text-center">
        <p className="font-heading text-xl font-bold text-primary-500 tracking-widest mb-2">INVALID LINK</p>
        <p className="text-xs text-text-muted font-mono mb-6">THIS PROTOCOL LINK IS CORRUPTED OR EXPIRED</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary-600 text-white font-heading font-bold tracking-widest text-sm border border-primary-500"
        >
          RETURN TO BASE
        </button>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="px-4 pt-16 text-center">
        <p className="text-text-muted font-mono text-sm">DECODING PROTOCOL...</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-10 pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-[10px] font-mono text-primary-500 tracking-widest mb-1">INCOMING TRANSMISSION</p>
        <h1 className="font-heading text-2xl font-bold text-text-primary tracking-wider">
          {workoutName ? workoutName.toUpperCase() : 'SHARED PROTOCOL'}
        </h1>
        <p className="text-xs text-text-muted font-mono mt-1">
          {workout.totalExerciseCount} EXERCISES // ~{workout.totalEstimatedMinutes}M
        </p>
      </motion.div>

      {/* Muscle badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 flex-wrap mb-4"
      >
        {Object.entries(workout.muscleGroupCoverage)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 6)
          .map(([muscle]) => (
            <span key={muscle} className="text-[10px] bg-primary-900 text-primary-400 px-1.5 py-0.5 border border-primary-700 font-mono uppercase">
              {muscle.replace('-', ' ')}
            </span>
          ))}
      </motion.div>

      {/* Workout phases */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-base p-4 mb-4 space-y-4"
      >
        {[workout.warmUp, workout.mainWorkout, workout.coolDown].map(phase => (
          <div key={phase.name}>
            <p className="text-[10px] font-heading font-bold text-primary-500 tracking-wider uppercase mb-1.5">
              {phase.name}
            </p>
            {phase.blocks.map(block => (
              <div key={block.name} className="ml-2 mb-2">
                {block.rounds > 1 && (
                  <p className="text-[10px] text-text-ghost font-mono mb-1">
                    {block.name.toUpperCase()} ({block.rounds}×)
                  </p>
                )}
                {block.exercises.map(we => (
                  <div key={we.exercise.id} className="flex items-center gap-1.5 ml-2 mb-0.5">
                    <IconBullet className="w-3 h-3 text-primary-500 flex-shrink-0" />
                    <span className="text-xs text-text-secondary font-mono">{we.exercise.name}</span>
                    <span className="text-[10px] text-text-ghost font-mono">
                      {we.reps ? `${we.reps}${we.perSide ? ' EA' : ''}` : `${we.durationSeconds}S`}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </motion.div>

      {/* Config info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-6 flex-wrap"
      >
        <span className="text-[10px] font-mono text-text-ghost border border-surface-3 px-2 py-0.5 uppercase">
          {workout.config.difficulty}
        </span>
        {workout.config.focus && (
          <span className="text-[10px] font-mono text-text-ghost border border-surface-3 px-2 py-0.5 uppercase">
            {workout.config.focus}
          </span>
        )}
        <span className="text-[10px] font-mono text-text-ghost border border-surface-3 px-2 py-0.5 uppercase">
          {workout.config.totalMinutes}M TARGET
        </span>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-2"
      >
        {saved ? (
          <div className="w-full py-3 bg-surface-2 text-star-gold font-heading font-bold text-xs tracking-widest border border-star-gold/40 flex items-center justify-center gap-2">
            <IconCheck className="w-4 h-4" />
            SAVED TO PROTOCOLS
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-primary-600 text-white font-heading font-bold text-xs tracking-widest border border-primary-500 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <IconStarFilled className="w-3 h-3" />
            {saving ? 'SAVING...' : 'SAVE TO PROTOCOLS'}
          </button>
        )}

        <button
          onClick={() => {
            sessionStorage.setItem('activeWorkout', JSON.stringify(workout))
            navigate('/workout')
          }}
          className="w-full py-3 bg-surface-2 text-text-secondary font-heading font-bold text-xs tracking-widest border border-surface-3"
        >
          EXECUTE NOW
        </button>

        {saved && (
          <button
            onClick={() => navigate('/favorites')}
            className="w-full py-2 text-text-muted font-mono text-[10px] tracking-wider"
          >
            VIEW SAVED PROTOCOLS →
          </button>
        )}
      </motion.div>
    </div>
  )
}
