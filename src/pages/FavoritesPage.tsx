import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { formatDate } from '../utils/formatTime'
import { IconStarFilled } from '../components/icons/Icons'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites, toggleFavorite, renameWorkout, loading } = useWorkoutHistory()
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
        <p className="text-text-muted font-mono text-sm">LOADING ARCHIVES...</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-10 pb-6">
      <h1 className="font-heading text-2xl font-bold mb-6 text-text-primary tracking-wider">SAVED PROTOCOLS</h1>

      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-20"
        >
          <div className="text-4xl text-star-gold mb-4 flex justify-center"><IconStarFilled className="w-12 h-12" /></div>
          <p className="text-text-secondary font-heading font-bold tracking-wider mb-2 uppercase">No saved protocols</p>
          <p className="text-xs text-text-muted font-mono mb-6">COMPLETE A PROTOCOL AND ARCHIVE IT</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white font-heading font-bold tracking-widest text-sm border border-primary-500"
          >
            GENERATE PROTOCOL
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {favorites.map((entry, i) => {
            const workout = entry.workout
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-base p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 border border-star-gold flex items-center justify-center text-star-gold text-sm">
                    <IconStarFilled className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    {entry.name && (
                      <p className="text-xs font-heading font-bold text-star-gold uppercase tracking-wider">{entry.name}</p>
                    )}
                    <p className={entry.name ? 'text-[10px] font-heading font-bold text-text-muted uppercase tracking-wider' : 'text-xs font-heading font-bold text-text-primary uppercase tracking-wider'}>{formatDate(entry.completedAt)}</p>
                    <p className="text-[10px] text-text-muted font-mono">
                      {workout.totalExerciseCount} EXERCISES // ~{workout.totalEstimatedMinutes}M
                    </p>
                  </div>
                </div>

                {/* Muscles */}
                <div className="flex gap-1 mb-3 flex-wrap">
                  {Object.entries(workout.muscleGroupCoverage)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([muscle]) => (
                      <span key={muscle} className="text-[10px] bg-primary-900 text-primary-400 px-1.5 py-0.5 border border-primary-700 font-mono uppercase">
                        {muscle.replace('-', ' ')}
                      </span>
                    ))}
                </div>

                {/* Circuits */}
                {workout.mainWorkout.blocks.map(block => (
                  <div key={block.name} className="mb-1">
                    <p className="text-[10px] font-mono text-text-ghost uppercase">{block.name}</p>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {block.exercises.map(we => (
                        <span key={we.exercise.id} className="text-xs text-text-muted font-mono">
                          {we.exercise.name}
                          {block.exercises.indexOf(we) < block.exercises.length - 1 ? ' /' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 mt-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      sessionStorage.setItem('activeWorkout', JSON.stringify(workout))
                      navigate('/workout')
                    }}
                    className="flex-1 py-3 bg-primary-600 text-white font-heading font-bold text-xs tracking-widest border border-primary-500 uppercase flex items-center justify-center gap-2"
                  >
                    <IconStarFilled className="w-3 h-3" /> COMMENCE
                  </motion.button>
                  <button
                    onClick={() => {
                      setRenameTargetId(entry.id)
                      setRenameValue(entry.name || '')
                    }}
                    className="px-4 py-3 bg-surface-2 text-text-muted text-xs font-heading font-bold tracking-wider border border-surface-3 uppercase"
                  >
                    RENAME
                  </button>
                  <button
                    onClick={() => toggleFavorite(entry.id)}
                    className="px-4 py-3 bg-primary-900/50 text-primary-400 text-xs font-heading font-bold tracking-wider border border-primary-700/50 uppercase"
                  >
                    REMOVE
                  </button>
                </div>
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
              <p className="font-heading text-sm font-bold text-primary-500 tracking-widest uppercase mb-1">RENAME PROTOCOL</p>
              <p className="text-[10px] text-text-muted font-mono mb-4">CLEAR TO REVERT TO DATE</p>
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    renameWorkout(renameTargetId, renameValue.trim())
                    setRenameTargetId(null)
                  }
                }}
                placeholder="e.g. UPPER BODY DESTROYER"
                className="w-full bg-surface-0 border border-surface-3 px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-ghost tracking-wider uppercase focus:border-primary-500 focus:outline-none mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setRenameTargetId(null)}
                  className="flex-1 py-2.5 bg-surface-2 text-text-secondary font-heading font-bold text-[10px] tracking-wider border border-surface-3 uppercase"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    renameWorkout(renameTargetId, renameValue.trim())
                    setRenameTargetId(null)
                  }}
                  className="flex-1 py-2.5 bg-primary-600 text-white font-heading font-bold text-[10px] tracking-wider border border-primary-500 uppercase"
                >
                  CONFIRM
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
