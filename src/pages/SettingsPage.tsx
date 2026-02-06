import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSettings } from '../hooks/useSettings'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { equipmentList } from '../data/equipment'
import { cn } from '../utils/cn'
import type { Difficulty } from '../types/exercise'

const durations = [30, 45, 60, 90]

const difficulties: { value: Difficulty; label: string; code: string }[] = [
  { value: 'beginner', label: 'RECRUIT', code: 'LVL-1' },
  { value: 'intermediate', label: 'SOLDIER', code: 'LVL-2' },
  { value: 'advanced', label: 'SPETSNAZ', code: 'LVL-3' },
]

export default function SettingsPage() {
  const { settings, toggleEquipment, setDifficulty, setDuration } = useSettings()
  const { clearHistory, history } = useWorkoutHistory()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  return (
    <div className="px-4 pt-10 pb-6">
      <h1 className="font-heading text-2xl font-bold mb-6 text-text-primary tracking-wider">CONFIGURATION</h1>

      {/* Equipment */}
      <section className="mb-8">
        <p className="section-header mb-3">// AVAILABLE EQUIPMENT</p>
        <div className="grid grid-cols-2 gap-2">
          {equipmentList.filter(e => e.id !== 'none').map(eq => {
            const active = settings.equipment.includes(eq.id)
            return (
              <motion.button
                key={eq.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleEquipment(eq.id)}
                className={cn(
                  'p-3 text-left transition-all border',
                  active
                    ? 'bg-primary-900 border-primary-500'
                    : 'bg-surface-1 border-surface-3'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{eq.icon}</span>
                  <div className={cn(
                    'w-5 h-5 border-2 flex items-center justify-center transition-all',
                    active ? 'border-primary-500 bg-primary-500' : 'border-text-ghost'
                  )}>
                    {active && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-xs font-heading font-bold mt-1 text-text-primary tracking-wider uppercase">{eq.name}</p>
                <p className="text-[10px] text-text-muted font-mono">{eq.description}</p>
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* Difficulty */}
      <section className="mb-8">
        <p className="section-header mb-3">// CLEARANCE LEVEL</p>
        <div className="flex gap-2">
          {difficulties.map(d => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={cn(
                'flex-1 py-3 text-xs font-heading font-bold transition-all text-center tracking-wider border',
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
      </section>

      {/* Duration */}
      <section className="mb-8">
        <p className="section-header mb-3">// PROTOCOL DURATION</p>
        <div className="flex gap-2">
          {durations.map(m => (
            <button
              key={m}
              onClick={() => setDuration(m)}
              className={cn(
                'flex-1 py-3 text-sm font-mono font-bold transition-all text-center border',
                settings.defaultDurationMinutes === m
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-surface-1 text-text-muted border-surface-3'
              )}
            >
              {m}M
            </button>
          ))}
        </div>
      </section>

      {/* Clear History */}
      <section className="mb-8">
        <p className="section-header mb-3">// DATA MANAGEMENT</p>
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={history.length === 0}
            className={cn(
              'w-full py-3 text-xs font-heading font-bold tracking-wider transition border uppercase',
              history.length > 0
                ? 'bg-primary-900/50 text-primary-400 border-primary-700/50 hover:bg-primary-900'
                : 'bg-surface-1 text-text-ghost border-surface-3'
            )}
          >
            PURGE ALL RECORDS ({history.length} ENTRIES)
          </button>
        ) : (
          <div className="bg-primary-900/30 p-4 border border-primary-700/50">
            <p className="text-xs text-primary-400 font-heading font-bold mb-3 tracking-wider">
              ⚠ CONFIRM DATA PURGE. THIS CANNOT BE REVERSED.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 bg-surface-2 text-text-secondary text-xs font-heading font-bold tracking-wider border border-surface-3 uppercase"
              >
                ABORT
              </button>
              <button
                onClick={() => { clearHistory(); setShowClearConfirm(false) }}
                className="flex-1 py-2 bg-primary-600 text-white text-xs font-heading font-bold tracking-wider border border-primary-500 uppercase"
              >
                CONFIRM PURGE
              </button>
            </div>
          </div>
        )}
      </section>

      {/* About */}
      <section className="text-center text-text-ghost text-xs">
        <div className="inline-block border border-primary-500 px-4 py-2">
          <p className="font-heading font-bold text-primary-500 text-sm tracking-widest">КОМПЛЕКС-01</p>
          <p className="font-mono text-[10px] mt-1 text-text-muted">CALISTHENICS TRAINING SYSTEM v1.0</p>
        </div>
      </section>
    </div>
  )
}
