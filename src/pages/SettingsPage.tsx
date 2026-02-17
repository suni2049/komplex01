import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSettings } from '../hooks/useSettings'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { equipmentList } from '../data/equipment'
import { accentThemes } from '../data/themes'
import { cn } from '../utils/cn'
import { useSound } from '../hooks/useSound'
import { groqService } from '../lib/groqService'
import { IconLightning } from '../components/icons/Icons'
import type { Difficulty } from '../types/exercise'

const durations = [30, 45, 60, 90]

const difficulties: { value: Difficulty; label: string; code: string }[] = [
  { value: 'beginner', label: 'RECRUIT', code: 'LVL-1' },
  { value: 'intermediate', label: 'SOLDIER', code: 'LVL-2' },
  { value: 'advanced', label: 'OPERATOR', code: 'LVL-3' },
]

export default function SettingsPage() {
  const { settings, toggleEquipment, setDifficulty, setDuration, setAccentColor, toggleSound, toggleAICoach, setGroqApiKey, setExerciseGrouping, toggleQuickWorkout, setQuickWorkoutMinutes } = useSettings()
  const { clearHistory, history } = useWorkoutHistory()
  const sound = useSound()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(settings.groqApiKey || '')
  const [keyValidation, setKeyValidation] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')

  return (
    <div className="px-4 pt-10 pb-6">
      <div className="mb-6 border-b-2 border-primary-500 pb-3">
        <h1 className="font-heading text-2xl font-bold text-text-primary tracking-wider">CONFIGURATION</h1>
        <p className="text-[10px] font-mono text-primary-500 tracking-widest mt-1">SYS.CONFIG // OPERATOR PREFERENCES</p>
      </div>

      {/* Equipment */}
      <section className="mb-8 border-l-2 border-primary-500/30 pl-3">
        <p className="section-header mb-3"><span className="text-primary-500">//</span> AVAILABLE EQUIPMENT</p>
        <div className="grid grid-cols-2 gap-2">
          {equipmentList.filter(e => e.id !== 'none').map(eq => {
            const active = settings.equipment.includes(eq.id)
            return (
              <motion.button
                key={eq.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => { sound.click(); toggleEquipment(eq.id) }}
                className={cn(
                  'p-3 text-left transition-all border',
                  active
                    ? 'bg-primary-900 border-primary-500'
                    : 'bg-surface-1 border-surface-3'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('flex items-center justify-center', active ? 'text-primary-500' : 'text-current')}>{eq.icon}</span>
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
      <section className="mb-8 border-l-2 border-primary-500/30 pl-3">
        <p className="section-header mb-3"><span className="text-primary-500">//</span> CLEARANCE LEVEL</p>
        <div className="flex gap-2">
          {difficulties.map(d => (
            <button
              key={d.value}
              onClick={() => { sound.select(); setDifficulty(d.value) }}
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
      <section className="mb-8 border-l-2 border-primary-500/30 pl-3">
        <p className="section-header mb-3"><span className="text-primary-500">//</span> PROTOCOL DURATION</p>
        <div className="flex gap-2">
          {durations.map(m => (
            <button
              key={m}
              onClick={() => { sound.select(); setDuration(m) }}
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

      {/* Exercise Structure */}
      <section className="mb-8 border-l-2 border-primary-500/30 pl-3">
        <p className="section-header mb-3"><span className="text-primary-500">//</span> EXERCISE STRUCTURE</p>
        <div className="flex gap-2">
          <button
            onClick={() => { sound.select(); setExerciseGrouping('circuit') }}
            className={cn(
              'flex-1 py-3 px-2 text-xs font-heading font-bold transition-all text-center border',
              settings.exerciseGrouping === 'circuit' || !settings.exerciseGrouping
                ? 'bg-primary-600 text-white border-primary-500'
                : 'bg-surface-1 text-text-muted border-surface-3'
            )}
          >
            <div>CIRCUIT</div>
            <div className="text-[10px] font-mono opacity-70 mt-1">ROTATE EXERCISES</div>
          </button>
          <button
            onClick={() => { sound.select(); setExerciseGrouping('grouped') }}
            className={cn(
              'flex-1 py-3 px-2 text-xs font-heading font-bold transition-all text-center border',
              settings.exerciseGrouping === 'grouped'
                ? 'bg-primary-600 text-white border-primary-500'
                : 'bg-surface-1 text-text-muted border-surface-3'
            )}
          >
            <div>GROUPED</div>
            <div className="text-[10px] font-mono opacity-70 mt-1">COMPLETE ALL SETS</div>
          </button>
        </div>
      </section>

      {/* Audio */}
      <section className="mb-8 border-l-2 border-primary-500/30 pl-3">
        <p className="section-header mb-3"><span className="text-primary-500">//</span> AUDIO</p>
        <button
          onClick={() => { sound.click(); toggleSound() }}
          className={cn(
            'w-full py-3 text-xs font-heading font-bold tracking-wider transition border uppercase flex items-center justify-center gap-3',
            settings.soundEnabled
              ? 'bg-primary-600 text-white border-primary-500'
              : 'bg-surface-1 text-text-muted border-surface-3'
          )}
        >
          SOUND EFFECTS
          <span className="font-mono text-[10px]">[{settings.soundEnabled ? 'ON' : 'OFF'}]</span>
        </button>
      </section>

      {/* AI Coach Configuration */}
      <section className="mb-8 border-l-2 border-primary-500/30 pl-3">
        <p className="section-header mb-3"><span className="text-primary-500">//</span> AI COACH CONFIGURATION</p>

        {/* Enable/Disable Toggle */}
        <button
          onClick={() => { sound.click(); toggleAICoach() }}
          className={cn(
            'w-full py-3 text-xs font-heading font-bold tracking-wider transition border uppercase flex items-center justify-center gap-3 mb-3',
            settings.enableAICoach
              ? 'bg-primary-600 text-white border-primary-500'
              : 'bg-surface-1 text-text-muted border-surface-3'
          )}
        >
          AI COACH
          <span className="font-mono text-[10px]">[{settings.enableAICoach ? 'ENABLED' : 'DISABLED'}]</span>
        </button>

        {/* AI Features Description */}
        <div className={cn(
          'mb-3 p-3 border text-[10px] font-mono leading-relaxed',
          settings.enableAICoach
            ? 'bg-primary-900/20 border-primary-500/30 text-text-secondary'
            : 'bg-surface-1 border-surface-3 text-text-ghost'
        )}>
          <p className="text-xs font-heading font-bold tracking-wider mb-2 text-text-primary uppercase">
            {settings.enableAICoach ? 'AI FEATURES ACTIVE' : 'AI FEATURES AVAILABLE'}
          </p>
          <div className="space-y-1.5">
            <p><span className="text-primary-500">STRETCH PAIRING</span> — AI analyzes your workout and optimizes warm-up and cool-down stretches to target your most-worked muscles, reducing next-day soreness.</p>
            <p><span className="text-primary-500">LIVE COACHING</span> — Real-time form guidance, common mistakes, and exercise modifications during your workout.</p>
            <p><span className="text-primary-500">RECOVERY INTEL</span> — Flags high-risk muscle groups and adjusts stretch hold durations based on your workout intensity.</p>
          </div>
        </div>

        {/* API Key Input */}
        <div className="bg-surface-1 border border-surface-3 p-3">
          <label className="block text-[10px] font-mono text-text-muted mb-2 tracking-wider">GROQ API KEY</label>
          <div className="flex gap-2 mb-2">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value)
                setKeyValidation('idle')
              }}
              placeholder="Enter your Groq API key..."
              className="flex-1 bg-surface-0 border border-surface-3 px-3 py-2 text-xs font-mono text-text-primary focus:border-primary-500 focus:outline-none"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="px-3 py-2 bg-surface-2 border border-surface-3 text-text-muted text-xs font-mono hover:border-primary-500"
            >
              {showApiKey ? 'HIDE' : 'SHOW'}
            </button>
          </div>

          {/* Validation Status */}
          {keyValidation === 'validating' && (
            <p className="text-[10px] font-mono text-text-muted mb-2">⏳ Validating key...</p>
          )}
          {keyValidation === 'valid' && (
            <p className="text-[10px] font-mono text-green-500 mb-2">✓ API key is valid</p>
          )}
          {keyValidation === 'invalid' && (
            <p className="text-[10px] font-mono text-primary-500 mb-2">✗ Invalid API key</p>
          )}

          {/* Save Button */}
          <button
            onClick={async () => {
              if (!apiKeyInput.trim()) {
                setGroqApiKey(undefined)
                setKeyValidation('idle')
                sound.select()
                return
              }

              sound.select()
              setKeyValidation('validating')
              const isValid = await groqService.validateApiKey(apiKeyInput.trim())

              if (isValid) {
                setGroqApiKey(apiKeyInput.trim())
                setKeyValidation('valid')
              } else {
                setKeyValidation('invalid')
              }
            }}
            className="w-full py-2 bg-primary-600 text-white text-xs font-heading font-bold tracking-wider border border-primary-500 uppercase hover:bg-primary-700"
          >
            SAVE API KEY
          </button>

          {/* Help Text */}
          <div className="mt-3 pt-3 border-t border-surface-3">
            <p className="text-[10px] font-mono text-text-muted mb-2">
              Free tier: 14,400 requests/day. Your key stays on your device.
            </p>
            <a
              href="https://console.groq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[10px] font-mono text-primary-500 hover:text-primary-400 underline"
            >
              → Get Free API Key from Groq Console
            </a>
          </div>
        </div>
      </section>

      {/* Quick Workout */}
      <section className="mb-8 border-l-2 border-primary-500/30 pl-3">
        <p className="section-header mb-3"><span className="text-primary-500">//</span> QUICK WORKOUT</p>

        {/* Enable/Disable Toggle */}
        <button
          onClick={() => {
            sound.click()
            toggleQuickWorkout()
          }}
          className={cn(
            'w-full py-3 text-xs font-heading font-bold tracking-wider transition border uppercase flex items-center justify-center gap-3 mb-3',
            settings.enableQuickWorkout
              ? 'bg-primary-600 text-white border-primary-500'
              : 'bg-surface-1 text-text-muted border-surface-3'
          )}
        >
          <IconLightning className="w-4 h-4" strokeWidth={2.5} />
          QUICK WORKOUT
          <span className="font-mono text-[10px]">[{settings.enableQuickWorkout ? 'ENABLED' : 'DISABLED'}]</span>
        </button>

        {/* Quick Workout Description */}
        <div className={cn(
          'mb-3 p-3 border text-[10px] font-mono leading-relaxed',
          settings.enableQuickWorkout
            ? 'bg-primary-900/20 border-primary-500/30 text-text-secondary'
            : 'bg-surface-1 border-surface-3 text-text-ghost'
        )}>
          <p className="text-xs font-heading font-bold tracking-wider mb-2 text-text-primary uppercase">
            {settings.enableQuickWorkout ? 'QUICK MODE ACTIVE' : 'QUICK MODE AVAILABLE'}
          </p>
          <p>Adds a quick workout button to the home page for rapid {settings.quickWorkoutMinutes || 15}-minute sessions. Perfect for time-crunched days.</p>
        </div>

        {/* Duration Picker */}
        {settings.enableQuickWorkout && (
          <div className="bg-surface-1 border border-surface-3 p-3">
            <label className="block text-[10px] font-mono text-text-muted mb-3 tracking-wider">QUICK WORKOUT DURATION</label>
            <div className="flex gap-2">
              {[10, 15, 20, 30].map(mins => (
                <button
                  key={mins}
                  onClick={() => {
                    sound.select()
                    setQuickWorkoutMinutes(mins)
                  }}
                  className={cn(
                    'flex-1 py-2 text-xs font-heading font-bold transition-all text-center tracking-wider border',
                    settings.quickWorkoutMinutes === mins
                      ? 'bg-primary-600 text-white border-primary-500'
                      : 'bg-surface-0 text-text-muted border-surface-3'
                  )}
                >
                  {mins}M
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Accent Color */}
      <section className="mb-8 border-l-2 border-primary-500/30 pl-3">
        <p className="section-header mb-3"><span className="text-primary-500">//</span> ACCENT COLOR</p>
        <div className="grid grid-cols-2 gap-2">
          {accentThemes.map(theme => {
            const active = settings.accentColor === theme.id
            return (
              <motion.button
                key={theme.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => { sound.select(); setAccentColor(theme.id) }}
                className={cn(
                  'p-3 text-left transition-all border',
                  active
                    ? 'border-2'
                    : 'bg-surface-1 border-surface-3'
                )}
                style={active ? { borderColor: theme.preview, backgroundColor: `${theme.preview}11` } : {}}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-8 h-8 border-2 border-surface-4"
                    style={{ backgroundColor: theme.preview }}
                  />
                  <div
                    className={cn(
                      'w-5 h-5 border-2 flex items-center justify-center transition-all',
                      active ? 'bg-white' : 'border-text-ghost'
                    )}
                    style={active ? { borderColor: theme.preview } : {}}
                  >
                    {active && (
                      <svg className="w-3 h-3" fill="none" stroke={theme.preview} viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-xs font-heading font-bold mt-1 text-text-primary tracking-wider uppercase">{theme.name}</p>
                <p className="text-[10px] text-text-muted font-mono">{theme.label}</p>
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* Clear History */}
      <section className="mb-8 border-l-2 border-primary-500/30 pl-3">
        <p className="section-header mb-3"><span className="text-primary-500">//</span> DATA MANAGEMENT</p>
        {!showClearConfirm ? (
          <button
            onClick={() => { sound.warning(); setShowClearConfirm(true) }}
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
          <p className="font-heading font-bold text-primary-500 text-sm tracking-widest">KOMPLEX-01</p>
          <p className="font-mono text-[10px] mt-1 text-text-muted">CALISTHENICS TRAINING SYSTEM v1.0</p>
        </div>
      </section>
    </div>
  )
}
