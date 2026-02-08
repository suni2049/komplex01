import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { exercises } from '../data/exercises'
import { categoryLabels, categoryColors } from '../data/muscles'
import StickFigure from '../components/stickfigure/StickFigure'
import { cn } from '../utils/cn'
import { equipmentList } from '../data/equipment'
import type { ExerciseCategory, Difficulty, Equipment, Exercise } from '../types/exercise'

const categories: (ExerciseCategory | 'all')[] = ['all', 'push', 'pull', 'legs', 'core', 'cardio', 'flexibility']
const difficultyFilters: (Difficulty | 'all')[] = ['all', 'beginner', 'intermediate', 'advanced']

const difficultyLabels: Record<string, string> = {
  all: 'ALL RANKS',
  beginner: 'RECRUIT',
  intermediate: 'SOLDIER',
  advanced: 'OPERATOR',
}

export default function ExerciseBrowserPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | 'all'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all')
  const [equipmentFilter, setEquipmentFilter] = useState<Equipment | 'all'>('all')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter !== 'all' && ex.category !== categoryFilter) return false
      if (difficultyFilter !== 'all' && ex.difficulty !== difficultyFilter) return false
      if (equipmentFilter !== 'all') {
        if (equipmentFilter === 'none') {
          if (ex.equipment.length > 0) return false
        } else {
          if (!ex.equipment.includes(equipmentFilter)) return false
        }
      }
      return true
    })
  }, [search, categoryFilter, difficultyFilter, equipmentFilter])

  return (
    <div className="px-4 pt-10 pb-6">
      <h1 className="font-heading text-2xl font-bold mb-4 text-text-primary tracking-wider">EXERCISE MANUAL</h1>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-ghost" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="SEARCH EXERCISES..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 input-military text-sm"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-1 mb-3 overflow-x-auto hide-scrollbar pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              'px-2.5 py-1 text-[10px] font-heading font-bold whitespace-nowrap transition-all tracking-wider border',
              categoryFilter === cat
                ? 'bg-primary-600 text-white border-primary-500'
                : 'bg-surface-1 text-text-muted border-surface-3'
            )}
          >
            {cat === 'all' ? 'ALL' : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-1 mb-3">
        {difficultyFilters.map(d => (
          <button
            key={d}
            onClick={() => setDifficultyFilter(d)}
            className={cn(
              'px-2 py-1 text-[10px] font-heading font-bold transition-all tracking-wider border',
              difficultyFilter === d
                ? 'bg-primary-600 text-white border-primary-500'
                : 'bg-surface-1 text-text-muted border-surface-3'
            )}
          >
            {difficultyLabels[d]}
          </button>
        ))}
      </div>

      {/* Equipment filter */}
      <div className="flex gap-1 mb-4 overflow-x-auto hide-scrollbar pb-1">
        <button
          onClick={() => setEquipmentFilter('all')}
          className={cn(
            'px-2 py-1 text-[10px] font-heading font-bold whitespace-nowrap transition-all tracking-wider border',
            equipmentFilter === 'all'
              ? 'bg-primary-600 text-white border-primary-500'
              : 'bg-surface-1 text-text-muted border-surface-3'
          )}
        >
          ALL GEAR
        </button>
        <button
          onClick={() => setEquipmentFilter('none')}
          className={cn(
            'px-2 py-1 text-[10px] font-heading font-bold whitespace-nowrap transition-all tracking-wider border',
            equipmentFilter === 'none'
              ? 'bg-primary-600 text-white border-primary-500'
              : 'bg-surface-1 text-text-muted border-surface-3'
          )}
        >
          BODYWEIGHT
        </button>
        {equipmentList.filter(e => e.id !== 'none').map(eq => (
          <button
            key={eq.id}
            onClick={() => setEquipmentFilter(eq.id)}
            className={cn(
              'px-2 py-1 text-[10px] font-mono whitespace-nowrap transition-all tracking-wider border flex items-center gap-1',
              equipmentFilter === eq.id
                ? 'bg-primary-600 text-white border-primary-500'
                : 'bg-surface-1 text-text-muted border-surface-3'
            )}
          >
            <span className="w-3.5 h-3.5 [&>svg]:w-3.5 [&>svg]:h-3.5">{eq.icon}</span>
            {eq.name.toUpperCase()}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-text-ghost font-mono mb-3 tracking-wider">{filtered.length} ENTRIES FOUND</p>

      {/* Exercise list */}
      <div className="space-y-1.5">
        {filtered.map((ex, i) => (
          <motion.button
            key={ex.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
            onClick={() => setSelectedExercise(ex)}
            className="w-full card-base p-3 text-left flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-surface-1 flex items-center justify-center flex-shrink-0 border border-surface-3">
              <StickFigure animationId={ex.animationId} size={44} playing={false} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-heading font-bold truncate text-text-primary tracking-wider uppercase">{ex.name}</p>
              <div className="flex gap-1 mt-0.5">
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 border font-mono',
                  categoryColors[ex.category]?.bg || 'bg-surface-2',
                  categoryColors[ex.category]?.text || 'text-text-muted',
                  'border-surface-3'
                )}>
                  {categoryLabels[ex.category]}
                </span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 border font-mono',
                  ex.difficulty === 'beginner' ? 'border-success-500/30 text-success-500' :
                  ex.difficulty === 'intermediate' ? 'border-star-gold/30 text-star-gold' :
                  'border-primary-500/30 text-primary-400'
                )}>
                  {ex.difficulty === 'beginner' ? 'REC' : ex.difficulty === 'intermediate' ? 'SOL' : 'OPR'}
                </span>
              </div>
            </div>
            <svg className="w-3 h-3 text-text-ghost flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        ))}
      </div>

      {/* Exercise detail modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-h-[85vh] bg-surface-0 overflow-y-auto border-t-2 border-primary-500"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-0.5 bg-surface-4" />
              </div>

              <div className="px-5 pb-8">
                {/* Animation */}
                <div className="flex justify-center mb-4 bg-surface-1 py-6 border-2 border-surface-3">
                  <StickFigure
                    key={selectedExercise.id}
                    animationId={selectedExercise.animationId}
                    size={180}
                    playing={true}
                  />
                </div>

                {/* Name + badges */}
                <h2 className="font-heading text-xl font-bold mb-2 text-text-primary tracking-wider uppercase">{selectedExercise.name}</h2>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 border font-mono',
                    categoryColors[selectedExercise.category]?.bg,
                    categoryColors[selectedExercise.category]?.text,
                    'border-surface-3'
                  )}>
                    {categoryLabels[selectedExercise.category]}
                  </span>
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 border font-mono',
                    selectedExercise.difficulty === 'beginner' ? 'border-success-500/30 text-success-500' :
                    selectedExercise.difficulty === 'intermediate' ? 'border-star-gold/30 text-star-gold' :
                    'border-primary-500/30 text-primary-400'
                  )}>
                    {difficultyLabels[selectedExercise.difficulty]}
                  </span>
                  {selectedExercise.equipment.length > 0 && selectedExercise.equipment.map(eq => (
                    <span key={eq} className="text-[10px] px-1.5 py-0.5 border border-surface-3 text-text-muted font-mono uppercase">
                      {eq.replace('-', ' ')}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-text-secondary mb-4">{selectedExercise.description}</p>

                {/* Muscles */}
                <div className="mb-4">
                  <p className="section-header mb-1">// PRIMARY TARGETS</p>
                  <div className="flex gap-1 flex-wrap">
                    {selectedExercise.primaryMuscles.map(m => (
                      <span key={m} className="text-[10px] bg-primary-900 text-primary-400 px-1.5 py-0.5 border border-primary-700 font-mono uppercase">
                        {m.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                  {selectedExercise.secondaryMuscles.length > 0 && (
                    <>
                      <p className="section-header mt-2 mb-1">// SECONDARY TARGETS</p>
                      <div className="flex gap-1 flex-wrap">
                        {selectedExercise.secondaryMuscles.map(m => (
                          <span key={m} className="text-[10px] bg-surface-2 text-text-muted px-1.5 py-0.5 border border-surface-3 font-mono uppercase">
                            {m.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Instructions */}
                <div>
                  <p className="section-header mb-2">// EXECUTION PROTOCOL</p>
                  <div className="space-y-2">
                    {selectedExercise.instructions.map((step, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="w-6 h-6 bg-primary-900 text-primary-400 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 border border-primary-700">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm text-text-secondary leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
