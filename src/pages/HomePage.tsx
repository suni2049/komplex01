import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { generateWorkout } from '../lib/workoutGenerator'
import { useSettings } from '../hooks/useSettings'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { cn } from '../utils/cn'
import { formatDate, formatMinutes } from '../utils/formatTime'
import { equipmentList } from '../data/equipment'
import WorkoutPreview from '../components/workout/WorkoutPreview'
import { useSound } from '../hooks/useSound'
import type { ExerciseCategory, Difficulty } from '../types/exercise'
import type { GeneratedWorkout } from '../types/workout'
import { IconStarFilled } from '../components/icons/Icons'
import GlitchTitle from '../components/ui/GlitchTitle'

const DIRECTIVES = [
  'STRENGTH IS DISCIPLINE.',
  'THE BODY IS A WEAPON. SHARPEN IT.',
  'NO RETREAT. NO SURRENDER.',
  'WEAKNESS IS A CHOICE. CHOOSE STRENGTH.',
  'YOUR DUTY AWAITS.',
  'PAIN IS TEMPORARY. GLORY IS FOREVER.',
  'FORGE YOURSELF IN IRON.',
  'DEMAND YOUR BEST.',
]

const difficulties: { value: Difficulty; label: string; code: string }[] = [
  { value: 'beginner', label: 'RECRUIT', code: 'LVL-1' },
  { value: 'intermediate', label: 'SOLDIER', code: 'LVL-2' },
  { value: 'advanced', label: 'OPERATOR', code: 'LVL-3' },
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
  const { settings, setDifficulty } = useSettings()
  const { history } = useWorkoutHistory()
  const sound = useSound()
  const [focus, setFocus] = useState<ExerciseCategory | 'balanced'>('balanced')
  const [generating, setGenerating] = useState(false)
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null)
  const [motto] = useState(() => DIRECTIVES[Math.floor(Math.random() * DIRECTIVES.length)])

  const handleGenerate = useCallback(() => {
    sound.generate()
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
      sound.ready()
    }, 600)
  }, [settings, focus, sound])

  const handleStart = useCallback(() => {
    if (generatedWorkout) {
      sound.commence()
      sessionStorage.setItem('activeWorkout', JSON.stringify(generatedWorkout))
      navigate('/workout')
    }
  }, [generatedWorkout, navigate, sound])

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
            <GlitchTitle />
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
              onClick={() => { sound.select(); setFocus(opt.value) }}
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

      {/* Active equipment from settings */}
      {settings.equipment.length > 0 && (
        <div className="mb-5">
          <p className="section-header">// ACTIVE EQUIPMENT</p>
          <div className="flex gap-1.5 flex-wrap">
            {equipmentList.filter(e => e.id !== 'none' && settings.equipment.includes(e.id)).map(eq => (
              <span
                key={eq.id}
                className="px-2.5 py-1.5 text-xs font-mono flex items-center gap-1.5 border bg-primary-900 text-primary-400 border-primary-500"
              >
                <span className="text-current">{eq.icon}</span>
                {eq.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty */}
      <div className="mb-6">
        <p className="section-header">// CLEARANCE LEVEL</p>
        <div className="flex gap-2">
          {difficulties.map(d => (
            <button
              key={d.value}
              onClick={() => { sound.select(); setDifficulty(d.value) }}
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
          <span className="flex items-center justify-center gap-2">
            <IconStarFilled className="w-5 h-5" /> GENERATE PROGRAM <IconStarFilled className="w-5 h-5" />
          </span>
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
          >
            <WorkoutPreview
              workout={generatedWorkout}
              onRegenerate={handleGenerate}
              onStart={handleStart}
            />
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
                className="card-base p-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 border border-primary-500 flex items-center justify-center text-primary-500 font-mono text-xs">
                  {entry.isFavorite ? <IconStarFilled className="w-4 h-4" /> : '//'}
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
