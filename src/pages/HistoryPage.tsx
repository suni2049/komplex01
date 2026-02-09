import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { formatDate, formatSeconds } from '../utils/formatTime'
import { cn } from '../utils/cn'
import { IconStar, IconStarFilled, IconBullet } from '../components/icons/Icons'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { history, remove, toggleFavorite, renameWorkout, loading } = useWorkoutHistory()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renameTargetId && renameInputRef.current) {
      renameInputRef.current.focus()
    }
  }, [renameTargetId])

  if (loading) {
    return (
      <div className="px-4 pt-12 text-center">
        <p className="text-text-muted font-mono text-sm">LOADING RECORDS...</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-10 pb-6">
      <h1 className="font-heading text-2xl font-bold mb-6 text-text-primary tracking-wider">OPERATION LOG</h1>

      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-20"
        >
          <div className="text-4xl text-primary-500 mb-4 font-heading">[ ]</div>
          <p className="text-text-secondary font-heading font-bold tracking-wider mb-2 uppercase">No records found</p>
          <p className="text-xs text-text-muted font-mono mb-6">COMPLETE YOUR FIRST TRAINING PROTOCOL</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white font-heading font-bold tracking-widest text-sm border border-primary-500"
          >
            BEGIN TRAINING
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {history.map((entry, i) => {
            const expanded = expandedId === entry.id
            const workout = entry.workout
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-base overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                  className="w-full p-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 flex items-center justify-center text-xs font-mono border',
                      entry.isFavorite
                        ? 'border-star-gold text-star-gold'
                        : 'border-primary-500 text-primary-500'
                    )}>
                      {entry.isFavorite ? <IconStarFilled className="w-4 h-4" /> : '//'}
                    </div>
                    <div className="flex-1">
                      {entry.name && (
                        <p className="text-xs font-heading font-bold text-star-gold uppercase tracking-wider">{entry.name}</p>
                      )}
                      <p className={cn('font-heading font-bold uppercase tracking-wider', entry.name ? 'text-[10px] text-text-muted' : 'text-xs text-text-primary')}>{formatDate(entry.completedAt)}</p>
                      <p className="text-[10px] text-text-muted font-mono">
                        {entry.exercisesCompleted} EXERCISES // {formatSeconds(entry.actualDurationSeconds)}
                      </p>
                    </div>
                    <svg
                      className={cn(
                        'w-3 h-3 text-text-ghost transition-transform',
                        expanded && 'rotate-180'
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Muscle badges */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {Object.entries(workout.muscleGroupCoverage)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 4)
                      .map(([muscle]) => (
                        <span key={muscle} className="text-[10px] bg-primary-900 text-primary-400 px-1.5 py-0.5 border border-primary-700 font-mono uppercase">
                          {muscle.replace('-', ' ')}
                        </span>
                      ))}
                  </div>
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 border-t border-surface-3 pt-3">
                        {[workout.warmUp, workout.mainWorkout, workout.coolDown].map(phase => (
                          <div key={phase.name} className="mb-3">
                            <p className="text-[10px] font-heading font-bold text-primary-500 mb-1 tracking-wider uppercase">{phase.name}</p>
                            {phase.blocks.map(block => (
                              <div key={block.name} className="ml-2 mb-2">
                                {block.rounds > 1 && (
                                  <p className="text-[10px] text-text-ghost font-mono">{block.name.toUpperCase()} ({block.rounds}X)</p>
                                )}
                                {block.exercises.map(we => (
                                  <div key={we.exercise.id} className="flex items-center gap-1.5 ml-2">
                                    <IconBullet className="w-3 h-3 text-primary-500" />
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

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              sessionStorage.setItem('activeWorkout', JSON.stringify(workout))
                              navigate('/workout')
                            }}
                            className="flex-1 py-2 bg-primary-900 text-primary-400 text-[10px] font-heading font-bold tracking-wider border border-primary-700 uppercase"
                          >
                            RE-EXECUTE
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!entry.isFavorite) {
                                setRenameTargetId(entry.id)
                                setRenameValue(entry.name || '')
                              } else {
                                toggleFavorite(entry.id)
                              }
                            }}
                            className={cn(
                              'px-3 py-2 text-[10px] font-heading font-bold tracking-wider border uppercase flex items-center gap-1',
                              entry.isFavorite
                                ? 'bg-star-gold/20 text-star-gold border-star-gold/40'
                                : 'bg-surface-2 text-text-muted border-surface-3'
                            )}
                          >
                            {entry.isFavorite ? <><IconStarFilled className="w-3 h-3" /> SAVED</> : <><IconStar className="w-3 h-3" /> SAVE</>}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); remove(entry.id) }}
                            className="px-3 py-2 bg-primary-900/50 text-primary-400 text-[10px] font-heading font-bold tracking-wider border border-primary-700/50 uppercase"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Rename modal */}
      <AnimatePresence>
        {renameTargetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-surface-0/95 flex flex-col items-center justify-center px-6"
            onClick={() => setRenameTargetId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm border border-primary-500 bg-surface-1 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-heading text-sm font-bold text-primary-500 tracking-widest uppercase mb-1">NAME THIS PROTOCOL</p>
              <p className="text-[10px] text-text-muted font-mono mb-4">OPTIONAL — LEAVE BLANK TO USE DATE</p>
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (renameValue.trim()) renameWorkout(renameTargetId, renameValue.trim())
                    toggleFavorite(renameTargetId)
                    setRenameTargetId(null)
                  }
                }}
                placeholder="e.g. UPPER BODY DESTROYER"
                className="w-full bg-surface-0 border border-surface-3 px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-ghost tracking-wider uppercase focus:border-primary-500 focus:outline-none mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toggleFavorite(renameTargetId)
                    setRenameTargetId(null)
                  }}
                  className="flex-1 py-2.5 bg-surface-2 text-text-secondary font-heading font-bold text-[10px] tracking-wider border border-surface-3 uppercase"
                >
                  SKIP
                </button>
                <button
                  onClick={() => {
                    if (renameValue.trim()) renameWorkout(renameTargetId, renameValue.trim())
                    toggleFavorite(renameTargetId)
                    setRenameTargetId(null)
                  }}
                  className="flex-1 py-2.5 bg-primary-600 text-white font-heading font-bold text-[10px] tracking-wider border border-primary-500 uppercase flex items-center justify-center gap-1"
                >
                  <IconStarFilled className="w-3 h-3" /> SAVE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
