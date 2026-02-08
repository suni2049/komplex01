import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { formatDate } from '../utils/formatTime'
import { IconStarFilled } from '../components/icons/Icons'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites, toggleFavorite, loading } = useWorkoutHistory()

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
                    <p className="text-xs font-heading font-bold text-text-primary uppercase tracking-wider">{formatDate(entry.completedAt)}</p>
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
    </div>
  )
}
