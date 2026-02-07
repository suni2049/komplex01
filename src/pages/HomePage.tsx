import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { generateWorkout } from '../lib/workoutGenerator'
import { useSettings } from '../hooks/useSettings'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { cn } from '../utils/cn'
import { formatDate, formatMinutes } from '../utils/formatTime'
import { equipmentList } from '../data/equipment'
import type { ExerciseCategory, Difficulty } from '../types/exercise'
import type { GeneratedWorkout, CircuitBlock, WorkoutExercise } from '../types/workout'

const DIRECTIVES = [
  'STRENGTH IS DISCIPLINE.',
  'THE BODY IS A WEAPON. SHARPEN IT.',
  'NO RETREAT. NO SURRENDER.',
  'WEAKNESS IS A CHOICE. CHOOSE STRENGTH.',
  'COMRADE, YOUR DUTY AWAITS.',
  'PAIN IS TEMPORARY. GLORY IS FOREVER.',
  'FORGE YOURSELF IN IRON.',
  'THE STATE DEMANDS YOUR BEST.',
]

const difficulties: { value: Difficulty; label: string; code: string }[] = [
  { value: 'beginner', label: 'RECRUIT', code: 'LVL-1' },
  { value: 'intermediate', label: 'SOLDIER', code: 'LVL-2' },
  { value: 'advanced', label: 'SPETSNAZ', code: 'LVL-3' },
]

const focusOptions: { value: ExerciseCategory | 'balanced'; label: string }[] = [
  { value: 'balanced', label: 'BALANCED' },
  { value: 'push', label: 'PUSH' },
  { value: 'pull', label: 'PULL' },
  { value: 'legs', label: 'LEGS' },
  { value: 'core', label: 'CORE' },
  { value: 'cardio', label: 'CARDIO' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { settings, toggleEquipment, setDifficulty } = useSettings()
  const { history } = useWorkoutHistory()
  const [focus, setFocus] = useState<ExerciseCategory | 'balanced'>('balanced')
  const [generating, setGenerating] = useState(false)
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null)
  const [motto] = useState(() => DIRECTIVES[Math.floor(Math.random() * DIRECTIVES.length)])

  const handleGenerate = useCallback(() => {
    setGenerating(true)
    setTimeout(() => {
      const workout = generateWorkout({
        totalMinutes: settings.defaultDurationMinutes,
        availableEquipment: settings.equipment,
        difficulty: settings.defaultDifficulty,
        focus,
      })
      setGeneratedWorkout(workout)
      setGenerating(false)
    }, 600)
  }, [settings, focus])

  const handleStart = useCallback(() => {
    if (generatedWorkout) {
      sessionStorage.setItem('activeWorkout', JSON.stringify(generatedWorkout))
      navigate('/workout')
    }
  }, [generatedWorkout, navigate])

  const recentWorkouts = history.slice(0, 3)

  return (
    <div className="px-4 pt-10 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-block border-2 border-primary-500 px-4 py-1 mb-2">
          <h1 className="font-heading text-3xl font-bold tracking-wider text-primary-500">
            КОМПЛЕКС-01
          </h1>
        </div>
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase mt-2">{motto}</p>
      </motion.div>

      {/* Focus selector */}
      <div className="mb-5">
        <p className="section-header">// MISSION FOCUS</p>
        <div className="flex gap-1.5 flex-wrap">
          {focusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFocus(opt.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-heading font-bold tracking-wider transition-all border',
                focus === opt.value
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-surface-1 text-text-muted border-surface-3 hover:border-primary-500'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick equipment toggles */}
      <div className="mb-5">
        <p className="section-header">// AVAILABLE EQUIPMENT</p>
        <div className="flex gap-1.5 flex-wrap">
          {equipmentList.filter(e => e.id !== 'none').map(eq => {
            const active = settings.equipment.includes(eq.id)
            return (
              <button
                key={eq.id}
                onClick={() => toggleEquipment(eq.id)}
                className={cn(
                  'px-2.5 py-1.5 text-xs font-mono transition-all flex items-center gap-1.5 border',
                  active
                    ? 'bg-primary-900 text-primary-400 border-primary-500'
                    : 'bg-surface-1 text-text-ghost border-surface-3'
                )}
              >
                <span>{eq.icon}</span>
                {eq.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <p className="section-header">// CLEARANCE LEVEL</p>
        <div className="flex gap-2">
          {difficulties.map(d => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={cn(
                'flex-1 py-2.5 text-xs font-heading font-bold tracking-wider transition-all text-center border',
                settings.defaultDifficulty === d.value
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-surface-1 text-text-muted border-surface-3'
              )}
            >
              <span className="block text-[10px] font-mono text-text-ghost">{d.code}</span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <motion.button
        onClick={handleGenerate}
        disabled={generating}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'w-full py-5 text-white font-heading font-bold text-lg tracking-widest uppercase transition-all',
          'bg-primary-600 border-2 border-primary-500',
          'active:bg-primary-700',
          generating && 'opacity-80'
        )}
      >
        {generating ? (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="font-mono"
          >
            GENERATING PROTOCOL...
          </motion.span>
        ) : (
          '★ GENERATE PROGRAM ★'
        )}
      </motion.button>

      <p className="text-[10px] text-center text-text-ghost font-mono mt-2 tracking-wider">
        DURATION: {formatMinutes(settings.defaultDurationMinutes)} // PROTOCOL ACTIVE
      </p>

      {/* Generated Workout Preview */}
      <AnimatePresence>
        {generatedWorkout && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="mt-6 card-soviet p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-base font-bold text-primary-500 tracking-wider uppercase">
                ★ TRAINING PROTOCOL
              </h2>
              <span className="text-xs text-text-muted font-mono">
                ~{generatedWorkout.totalEstimatedMinutes} MIN
              </span>
            </div>

            <div className="flex gap-1.5 mb-3 flex-wrap">
              {Object.entries(generatedWorkout.muscleGroupCoverage)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([muscle]) => (
                  <span key={muscle} className="text-[10px] bg-primary-900 text-primary-400 px-1.5 py-0.5 border border-primary-700 font-mono uppercase">
                    {muscle.replace('-', ' ')}
                  </span>
                ))}
            </div>

            {/* Phases summary */}
            <div className="space-y-1.5 mb-4">
              {[generatedWorkout.warmUp, generatedWorkout.mainWorkout, generatedWorkout.coolDown].map(phase => (
                <div key={phase.name} className="flex items-center gap-3">
                  <div className={cn(
                    'w-2 h-2',
                    phase.name === 'Warm-Up' ? 'bg-star-gold' :
                    phase.name === 'Cool-Down' ? 'bg-khaki' : 'bg-primary-500'
                  )} />
                  <span className="text-xs font-heading font-bold flex-1 text-text-primary uppercase">{phase.name}</span>
                  <span className="text-[10px] text-text-muted font-mono">
                    {phase.blocks.reduce((s: number, b: { exercises: unknown[] }) => s + b.exercises.length, 0)} EX
                  </span>
                  <span className="text-[10px] text-text-ghost font-mono">{phase.estimatedMinutes}M</span>
                </div>
              ))}
            </div>

            {/* Circuits detail */}
            {generatedWorkout.mainWorkout.blocks.map((block: CircuitBlock) => (
              <div key={block.name} className="mb-3">
                <p className="text-[10px] font-heading font-bold text-primary-500 mb-1 tracking-wider">
                  {block.name.toUpperCase()} ({block.rounds}X)
                </p>
                {block.exercises.map((we: WorkoutExercise) => (
                  <div key={we.exercise.id} className="flex items-center gap-2 ml-3 mb-0.5">
                    <span className="text-primary-500 text-[10px]">▸</span>
                    <span className="text-xs text-text-secondary font-mono">
                      {we.exercise.name}
                      <span className="text-text-ghost ml-1">
                        {we.reps ? `${we.reps}${we.perSide ? ' EA' : ''} REPS` : `${we.durationSeconds}S`}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleGenerate}
                className="flex-1 py-3 text-xs font-heading font-bold tracking-wider bg-surface-2 text-text-secondary border border-surface-3 hover:border-primary-500 transition uppercase"
              >
                REGENERATE
              </button>
              <motion.button
                onClick={handleStart}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(220, 38, 38, 0)',
                    '0 0 16px rgba(220, 38, 38, 0.45)',
                    '0 0 0px rgba(220, 38, 38, 0)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex-1 py-3 text-xs font-heading font-bold tracking-wider bg-primary-600 text-white border border-primary-500 uppercase"
              >
                ★ COMMENCE
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <div className="mt-8">
          <p className="section-header mb-3">// RECENT OPERATIONS</p>
          <div className="space-y-2">
            {recentWorkouts.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-soviet p-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 border border-primary-500 flex items-center justify-center text-primary-500 font-mono text-xs">
                  {entry.isFavorite ? '★' : '//'}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-heading font-bold text-text-primary uppercase">{formatDate(entry.completedAt)}</p>
                  <p className="text-[10px] text-text-muted font-mono">
                    {entry.exercisesCompleted} EXERCISES // {Math.round(entry.actualDurationSeconds / 60)}M
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
